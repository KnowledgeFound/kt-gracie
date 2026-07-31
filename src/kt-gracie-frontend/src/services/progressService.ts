import { Progress } from "@/types/user";
import { CompletedScore } from "../ENUMS/enums";
import { getLocalStorage, setLocalStorage, USER_STORAGE_KEY } from "../commons/utilts";
import { getUser } from "./userServices";

const PROGRESS_STORAGE_KEY = `${USER_STORAGE_KEY}_progress`;

function normalizeProgressList(value: unknown): Array<Progress> {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value.filter((item): item is Progress => Boolean(item && typeof item === "object" && typeof (item as Progress).knowledgeUnitID === "string"));
    }

    if (typeof value === "object" && value !== null && "knowledgeUnitID" in value) {
        return [value as Progress];
    }

    return [];
}

function getProgressStorageKey(): string {
    const user = getUser();
    const userId = user?.anonymousId ?? "anonymous";
    return `${PROGRESS_STORAGE_KEY}_${userId}`;
}

// Progress

export function deleteProgress(): void {
    localStorage.removeItem(getProgressStorageKey());
}

export function createProgress(input: Progress): Array<Progress> {
    const progress: Progress = {
        knowledgeUnitID: input.knowledgeUnitID,
        teaching: input.teaching ?? CompletedScore.ZERO,
        assessment: input.assessment ?? CompletedScore.ZERO,
    };

    const existingProgress = getProgress();
    const nextProgress = existingProgress.some((item) => item.knowledgeUnitID === progress.knowledgeUnitID)
        ? existingProgress.map((item) => item.knowledgeUnitID === progress.knowledgeUnitID ? progress : item)
        : [...existingProgress, progress];

    persistProgress(nextProgress);
    return nextProgress;
}

export function getProgress(): Array<Progress> {
    const storedProgress = getLocalStorage(getProgressStorageKey());
    return normalizeProgressList(storedProgress);
}

export function getProgressById(knowledgeUnitID: string): Progress | null {
    const progress = getProgress();
    return progress.find((item) => item.knowledgeUnitID === knowledgeUnitID) ?? null;
}

export function persistProgress(progress: Array<Progress> | Progress): void {
    const normalizedProgress = normalizeProgressList(progress);
    setLocalStorage(getProgressStorageKey(), normalizedProgress);
}

export function updateProgress(input: Pick<Progress, "knowledgeUnitID"> & Partial<Omit<Progress, "knowledgeUnitID">>): Array<Progress> {
    const existingProgress = getProgress();
    const progressIndex = existingProgress.findIndex((item) => item.knowledgeUnitID === input.knowledgeUnitID);

    if (progressIndex === -1) {
        return createProgress({
            knowledgeUnitID: input.knowledgeUnitID,
            teaching: input.teaching ?? CompletedScore.ZERO,
            assessment: input.assessment ?? CompletedScore.ZERO,
        });
    }

    const updatedProgress = existingProgress.map((item) =>
        item.knowledgeUnitID === input.knowledgeUnitID
            ? {
                ...item,
                ...input,
                teaching: input.teaching ?? item.teaching ?? CompletedScore.ZERO,
                assessment: input.assessment ?? item.assessment ?? CompletedScore.ZERO,
            }
            : item
    );

    persistProgress(updatedProgress);
    return updatedProgress;
}

export function getProgressTotal(): { score: number; teaching: number; assessment: number } {
    const progress = getProgress();
    const teaching = progress.reduce((total, item) => total + (item.teaching ?? CompletedScore.ZERO), 0);
    const assessment = progress.reduce((total, item) => total + (item.assessment ?? CompletedScore.ZERO), 0);

    return {
        score: teaching + assessment,
        teaching,
        assessment,
    };
}

export function getAssessmentProgressTotal(): number {
    return getProgressTotal().assessment;
}

export function getTeachingProgressTotal(): number {
    return getProgressTotal().teaching;
}
