import { describe, it, expect, beforeEach } from "vitest";
import { AssessmentType } from "@/ENUMS/enums";
import { City } from "@/models/City";
import { getCityScores, saveCityToLocalStorage, syncCityHealth } from "../cityService";
import { addProgressToContainer, markAssessmentCompleted, markTeachingCompleted } from "../progressContainerService";
import { createProgress } from "../progressService";

function seed() {
    addProgressToContainer(
        createProgress(
            "KU-1",
            [
                { assessmentID: 2, assessmentType: AssessmentType.QUIZ, score: 0, maxScore: 10, pointScore: 1, completed: false, ktMax: 10, ktEarned: 0 },
                { assessmentID: 3, assessmentType: AssessmentType.FLASHCARD, score: 0, maxScore: 5, pointScore: 1, completed: false, ktMax: 10, ktEarned: 0 },
            ],
            [{ teachingID: 1, topic: "T", difficulty: "EASY", completed: false, ktMax: 10, ktEarned: 0 }],
        ),
    );
}

describe("city health follows course progress", () => {
    beforeEach(() => {
        localStorage.clear();
        saveCityToLocalStorage(new City("UN City"));
        seed();
    });

    it("stays at 0 (never negative) before any progress", () => {
        expect(getCityScores()).toEqual({ contentScore: 0, assessmentScore: 0 });
        expect(syncCityHealth()!.getHealth()).toBe(0);
    });

    it("rises as lessons, flashcards and quizzes are completed", () => {
        markTeachingCompleted("KU-1", 1);
        const afterLesson = syncCityHealth()!.getHealth();
        markAssessmentCompleted("KU-1", 3, AssessmentType.FLASHCARD, 5, 5);
        const afterCards = syncCityHealth()!.getHealth();
        markAssessmentCompleted("KU-1", 2, AssessmentType.QUIZ, 8, 10);
        const afterQuiz = syncCityHealth()!.getHealth();

        expect(afterLesson).toBeGreaterThan(0);
        expect(afterCards).toBeGreaterThan(afterLesson);
        expect(afterQuiz).toBeGreaterThan(afterCards);
        // content 100%, quiz 80% → 0.5*100 + 0.5*80 - 5 decay
        expect(afterQuiz).toBe(85);
    });

    it("persists the new health", () => {
        markTeachingCompleted("KU-1", 1);
        const synced = syncCityHealth()!.getHealth();
        expect(syncCityHealth()!.getHealth()).toBe(synced);
    });

    it("returns null when there is no city", () => {
        localStorage.removeItem("city");
        expect(syncCityHealth()).toBeNull();
    });
});
