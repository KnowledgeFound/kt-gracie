import { City } from "../models/City";
import { setLocalStorage, getLocalStorage } from "../commons/utilts";
import { getProgressContainer } from "./progressContainerService";
import { AssessmentType } from "../ENUMS/enums";

export function createCity(name: string): City {
    return new City(name);
};

export function saveCityToLocalStorage(city: City): void {
    setLocalStorage("city", JSON.stringify(city));
}

export function getCityFromLocalStorage(): City | null {
    const cityData = getLocalStorage("city");

    if (cityData) {
        const parsed = JSON.parse(cityData);

        var city = new City(parsed.name);
        city.setContentScore(parsed.contentScore);
        city.setFinalAssessmentScore(parsed.finalAssessmentScore);
        city.setHealth(parsed.health);
        
        return city;
    }
    
    return null;
}


/**
 * Learning progress as the two 0–100 scores the city's health is built from:
 *  - content: share of lessons and flashcard sets completed
 *  - assessment: quiz points earned out of all quiz points on offer
 * Only units that have content count, so modules still "coming soon" can't drag it down.
 */
export function getCityScores(): { contentScore: number; assessmentScore: number } {
    const container = getProgressContainer();
    if (!container) return { contentScore: 0, assessmentScore: 0 };

    let contentDone = 0, contentTotal = 0, quizScore = 0, quizMax = 0;

    container.arr_progress.forEach((p) => {
        p.subProgressTeachings.forEach((t) => {
            contentTotal++;
            if (t.completed) contentDone++;
        });
        p.subProgress.forEach((a) => {
            if (a.assessmentType === AssessmentType.QUIZ) {
                quizMax += a.maxScore;
                quizScore += Math.min(a.score, a.maxScore);
            } else if (a.assessmentType === AssessmentType.FLASHCARD) {
                contentTotal++;
                if (a.completed) contentDone++;
            }
        });
    });

    const pct = (n: number, d: number) => (d === 0 ? 0 : (n / d) * 100);
    return { contentScore: pct(contentDone, contentTotal), assessmentScore: pct(quizScore, quizMax) };
}

/**
 * Recompute the saved city's health from course progress and persist it.
 * Returns the updated city, or null when no city exists yet.
 */
export function syncCityHealth(): City | null {
    const city = getCityFromLocalStorage();
    if (!city) return null;

    const { contentScore, assessmentScore } = getCityScores();
    city.setContentScore(contentScore);
    city.setFinalAssessmentScore(assessmentScore);
    // The model subtracts decay, which would leave a brand-new city below zero.
    city.setHealth(Math.round(Math.max(0, Math.min(100, city.getHealth()))));

    saveCityToLocalStorage(city);
    return city;
}

export function deleteCityFromLocalStorage(): void {
    localStorage.removeItem("city");
}



