import { Progress } from "@/types/user";
import { getLocalStorage, setLocalStorage } from "../commons/utilts";
import { getUser } from "./userServices";
import { AssessmentType } from "@/ENUMS/enums";

export const PROGRESS_STORAGE_KEY = "progress";

function isProgress(value: unknown): value is Progress {
    return Boolean(
        value &&
        typeof value === "object" &&
        typeof (value as Progress).knowledgeUnitID === "string" &&
        ((value as Progress).teaching === null || typeof (value as Progress).teaching === "number") &&
        ((value as Progress).assessment === null || typeof (value as Progress).assessment === "number")
    );
}

function emptyProgress(knowledgeUnitID = ""): Progress {
    return { knowledgeUnitID, teaching: null, assessment: null, subProgress: [] };
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

export function createProgress(): Progress;
export function createProgress(progress: Progress): Progress;
export function createProgress(progress = emptyProgress()): Progress {
    persistProgress(progress);
    return progress;
}

export function getProgress(): Progress;
export function getProgress(knowledgeUnit: string): Progress;
export function getProgress(knowledgeUnit?: string): Progress {
    const storedProgress = getLocalStorage(getProgressStorageKey());
    if (isProgress(storedProgress)) {
        return knowledgeUnit === undefined || storedProgress.knowledgeUnitID === knowledgeUnit
            ? storedProgress
            : emptyProgress(knowledgeUnit);
    }

    if (Array.isArray(storedProgress)) {
        const legacyProgress = storedProgress.find((item) => isProgress(item) && (knowledgeUnit === undefined || item.knowledgeUnitID === knowledgeUnit));
        if (legacyProgress) {
            return legacyProgress;
        }
    }

    return emptyProgress(knowledgeUnit);
}

export function persistProgress(progress: Progress): void {
    setLocalStorage(getProgressStorageKey(), progress);
}

export function updateProgress(progress: Progress): Progress {
    persistProgress(progress);
    return progress;
}

export function getProgressTotal(): { score: number; teaching: number; assessment: number } {
    const progress = getProgress();
    const teaching = progress.teaching ?? 0;
    const assessment = progress.assessment ?? 0;

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

export function addSubProgress(assessmentID: number, assessmentType: AssessmentType, score: number, maxScore: number): void {
    const progress = getProgress();

    const existingSubProgressIndex = progress.subProgress.findIndex(
        (sub) => sub.assessmentID === assessmentID && sub.assessmentType === assessmentType
    );

    if (existingSubProgressIndex !== -1) {
        // Update existing sub-progress
        progress.subProgress[existingSubProgressIndex].score = score;
        progress.subProgress[existingSubProgressIndex].maxScore = maxScore;
    } else {
        // Add new sub-progress
        progress.subProgress.push({ 
            assessmentID, 
            assessmentType, 
            score,
            maxScore
        });
    }

    persistProgress(progress);
}