import { getLocalStorage, setLocalStorage } from "../commons/utilts";
import { ProgressContainer, Progress, Achievement } from "@/types/user";
import { getUser } from "./userServices";
import { AssessmentType } from "@/ENUMS/enums";

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
    
    if (storedProgressContainer && typeof storedProgressContainer === "object" && Array.isArray((storedProgressContainer as ProgressContainer).arr_progress)) {
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
        return progressContainer.arr_progress.filter(p => p.completed).length;
    }

    return 0;
}

export function getNumberOfAssessmentsCompleted(): number {
    const progressContainer = getProgressContainer();

    if (progressContainer) {
        return progressContainer.arr_progress.reduce((count, p) => {
            return count + (p.subProgress.filter(sp => sp.completed).length);
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
            return count + (p.subProgress.filter(sp => sp.completed && sp.assessmentType === AssessmentType.QUIZ).length);
        }, 0);
    }

    return 0;
}

