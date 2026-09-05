import { getLocalStorage, setLocalStorage } from "../commons/utilts";
import { ProgressContainer, Progress, Achievement, SubProgress } from "@/types/user";
import { getUser } from "./userServices";
import { AssessmentType } from "@/ENUMS/enums";
import { KnowledgeUnit } from "@/types/types";
import { createProgress } from "./progressService";
 
export const PROGRESS_STORAGE_KEY = "progress_container";

function getProgressContainerStorageKey(): string {
    const user = getUser();
    const userId = user?.anonymousId ?? "anonymous";
    return `${PROGRESS_STORAGE_KEY}_${userId}`;
}


export function persistProgressContainer(progressContainer: ProgressContainer): void {
    setLocalStorage(getProgressContainerStorageKey(), progressContainer);
}

export function getProgressContainer(): ProgressContainer | null {
    const storedProgressContainer = getLocalStorage(getProgressContainerStorageKey());

    if (
        storedProgressContainer &&
        typeof storedProgressContainer === "object" &&
        Array.isArray(storedProgressContainer.arr_progress)
    ) {
        return storedProgressContainer as ProgressContainer;
    }

    return null;
}

export function addProgressToContainer(progress: Progress): void {
    const progressContainer = getProgressContainer() || { arr_progress: [] };
    const existingIndex = progressContainer.arr_progress.findIndex(p => p.knowledgeUnitID === progress.knowledgeUnitID);

    if (existingIndex !== -1) {
        // Update existing progress
        progressContainer.arr_progress[existingIndex] = progress;
    } else {
        // Add new progress
        progressContainer.arr_progress.push(progress);
    }

    persistProgressContainer(progressContainer);
}

export function getProgressFromContainer(knowledgeUnitID: string): Progress | null {
    const progressContainer = getProgressContainer();
    if (progressContainer) {
        const progress = progressContainer.arr_progress.find(p => p.knowledgeUnitID === knowledgeUnitID);
        return progress || null;
    }
    return null;
}

export function getNumberOfModulesCompleted(): number {
    const progressContainer = getProgressContainer();

    if (progressContainer) {
        return progressContainer.arr_progress.filter(p => p.completed === true).length;
    }

    return 0;
}

export function getNumberOfAssessmentsCompleted(): number {
    const progressContainer = getProgressContainer();

    console.log("Progress Container:", progressContainer);

    if (progressContainer) {
        return progressContainer.arr_progress.reduce((count, p) => {
            return count + (p.subProgress.filter(sp => sp.completed === true).length);
        }, 0);
    }

    return 0;
}

export function getNumberOfTeachingsCompleted(): number {
    const progressContainer = getProgressContainer();

    if (progressContainer) {
        return progressContainer.arr_progress.reduce((count, p) => {
            return count + (p.subProgressTeachings.filter(sp => sp.completed === true).length);
        }, 0);
    }

    return 0;
}

export function getAllAchievements(): Achievement[] {
    const progressContainer = getProgressContainer();

    if (progressContainer) {
        return progressContainer.arr_progress.flatMap(p => p.achievments);
    }

    return [];
}

export function createAndPersistProgressContainer() : void
{
    if(getProgressContainer())
        return;

    const progressContainer = {
        arr_progress: []
    };

    persistProgressContainer(progressContainer);
}


/**
 * Returns the total score accumulated across all assessments in the progress container.
 */
export function getTotalScore(): number {
    const progressContainer = getProgressContainer();

    if (progressContainer) {
        return progressContainer.arr_progress.reduce((total, p) => {
            return total + (p.subProgress.reduce((subTotal, sp) => subTotal + sp.score, 0));
        }, 0);
    }

    return 0;
}

export function getNumberOfQuizzesCompleted(): number {
    const progressContainer = getProgressContainer();

    if (progressContainer) {
        return progressContainer.arr_progress.reduce((count, p) => {
            return count + (p.subProgress.filter(sp => sp.completed === true && sp.assessmentType === AssessmentType.QUIZ).length);
        }, 0);
    }

    return 0;
}

export function getTotalNumberOfAssessments(): number {
    const progressContainer = getProgressContainer();

    if (progressContainer) {
        return progressContainer.arr_progress.reduce((count, p) => {
            return count + p.subProgress.length;
        }, 0);
    }

    return 0;
}

export function getTotalNumberOfTeachings(): number {
    const progressContainer = getProgressContainer();

    if (progressContainer) {
        return progressContainer.arr_progress.reduce((count, p) => {
            return count + p.subProgressTeachings.length;
        }, 0);
    }

    return 0;
}

export function getScoreDetails(): { currentScore: number; maxScore: number; percentage: number; encouragementMessage: string } {
    const currentScore = getTotalScore();
    const maxScore = getMaxScore();
    const percentage = maxScore === 0 ? 0 : (currentScore / maxScore) * 100;

    let encouragementMessage = "";

    if (percentage <= 25) {
        encouragementMessage = "Every expert was once a beginner!";
    } else if (percentage >= 26 && percentage <= 49) {
        encouragementMessage = "You are laying the groundwork!";
    } else if (percentage >= 50 && percentage <= 69) {
        encouragementMessage = "More than halfway there!";
    } else if (percentage >= 70 && percentage <= 79) {
        encouragementMessage = "Solid effort—you have got real momentum!";
    }
    else if (percentage >= 80 && percentage <= 89) {   
        encouragementMessage = "Awesome work! You really know your stuff!";
    }
    else if (percentage >= 90) {
        encouragementMessage = "Outstanding! Master of the game!";
    }

    return { currentScore, maxScore, percentage, encouragementMessage };
}

export function getMaxScore(): number {
    const progressContainer = getProgressContainer();

    if (progressContainer) {
        return progressContainer.arr_progress.reduce((max, p) => {
            return max + (p.subProgress.reduce((subMax, sp) => subMax + sp.maxScore, 0));
        }, 0);
    }

    return 0;
}



export function getTheBestAssessmentScore(): {score: number, maxScore: number} {
    const progressContainer = getProgressContainer();

    if (progressContainer) {
        let bestScore = 0;
        let difference = Number.MAX_VALUE;
        let maxScore = 0;

        progressContainer.arr_progress.forEach(p => {
            p.subProgress.forEach(sp => {
                if ((sp.maxScore - sp.score) < difference) {
                    difference = sp.maxScore - sp.score;
                    bestScore = sp.score;
                    maxScore = sp.maxScore;
                }
            });
        });

        return { score: bestScore, maxScore: maxScore };
    }

    return { score: 0, maxScore: 0 };
}
