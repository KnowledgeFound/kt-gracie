import { getLocalStorage, setLocalStorage } from "../commons/utilts";
import { ProgressContainer, Progress, Achievement, SubProgress, CourseResume } from "@/types/user";
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

/**
 * Progress persisted by an earlier release may predate a field (for example
 * `subProgressTeachings` was added after `subProgress`). Fill any missing
 * arrays so the score helpers never call `.reduce` or read `.length` of
 * `undefined`.
 */
function normalizeProgress(progress: Partial<Progress>): Progress {
    return {
        ...progress,
        subProgress: Array.isArray(progress.subProgress) ? progress.subProgress : [],
        subProgressTeachings: Array.isArray(progress.subProgressTeachings) ? progress.subProgressTeachings : [],
        achievments: Array.isArray(progress.achievments) ? progress.achievments : [],
    } as Progress;
}

export function getProgressContainer(): ProgressContainer | null {
    const storedProgressContainer = getLocalStorage(getProgressContainerStorageKey());

    if (
        storedProgressContainer &&
        typeof storedProgressContainer === "object" &&
        Array.isArray(storedProgressContainer.arr_progress)
    ) {
        return {
            ...storedProgressContainer,
            arr_progress: storedProgressContainer.arr_progress
                .filter((p: unknown) => p && typeof p === "object")
                .map((p: Partial<Progress>) => normalizeProgress(p)),
        } as ProgressContainer;
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

    // console.log("Progress Container:", progressContainer);

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
 * Returns the total score accumulated across all assessments and teachings in the progress container.
 */
export function getTotalScore(): number {
    const progressContainer = getProgressContainer();

    if (progressContainer) {
        return progressContainer.arr_progress.reduce((total, p) => {
            return total + (p.subProgress.reduce((subTotal, sp) => subTotal + sp.score, 0)) +
                (p.subProgressTeachings.reduce((subTotal, sp) => subTotal + (sp.completed ? getPointScoreForTeachings() : 0), 0));
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

export function getPointScoreForTeachings(): number {
    const progressContainer = getProgressContainer();

    if(progressContainer) {
        const numOfTeachings = getTotalNumberOfTeachings();

        return 50 / numOfTeachings;
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
        encouragementMessage = "Solid effort — you have got real momentum!";
    }
    else if (percentage >= 80 && percentage <= 89) {   
        encouragementMessage = "Awesome work! You really know your stuff!";
    }
    else if (percentage >= 90) {
        encouragementMessage = "Outstanding! Master of the game!";
    }

    return { currentScore, maxScore, percentage, encouragementMessage };
}

export function getEncouragementMessage(percentage: number): string {

    let encouragementMessage = "";

    if (percentage <= 25) {
        encouragementMessage = "Every expert was once a beginner!";
    } else if (percentage >= 26 && percentage <= 49) {
        encouragementMessage = "You are laying the groundwork!";
    } else if (percentage >= 50 && percentage <= 69) {
        encouragementMessage = "More than halfway there!";
    } else if (percentage >= 70 && percentage <= 79) {
        encouragementMessage = "Solid effort — you have got real momentum!";
    }
    else if (percentage >= 80 && percentage <= 89) {   
        encouragementMessage = "Awesome work! You really know your stuff!";
    }
    else if (percentage >= 90) {
        encouragementMessage = "Outstanding! Master of the game!";
    }

    return encouragementMessage;
}

export function getCompletionPercentage(): number {
    const completedAssessments = getNumberOfAssessmentsCompleted();
    const completedTeachings = getNumberOfTeachingsCompleted();
    const totalAssessments = getTotalNumberOfAssessments();
    const totalTeachings = getTotalNumberOfTeachings();

    return Math.round(((completedAssessments + completedTeachings) / (totalAssessments + totalTeachings)) * 100);
}

export function getMaxScore(): number {
    const progressContainer = getProgressContainer();
    if (progressContainer) {
        return progressContainer.arr_progress.reduce((max, p) => {
            return max + (p.subProgress.reduce((subMax, sp) => subMax + sp.maxScore, 0)) +
                (p.subProgressTeachings.length);
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


// ─── Course resume & per-unit completion ──────────────────────────────────────

function saveProgress(progress: Progress): void {
    addProgressToContainer(progress);
}

export function getResume(knowledgeUnitID: string): CourseResume | null {
    return getProgressFromContainer(knowledgeUnitID)?.resume ?? null;
}

/** Merge a partial resume position into the unit's progress (creates the progress if missing). */
export function saveResume(
    knowledgeUnitID: string,
    patch: Partial<CourseResume> & Pick<CourseResume, "activityId" | "activityType">,
): void {
    const progress = getProgressFromContainer(knowledgeUnitID) ?? createProgress(knowledgeUnitID, [], []);
    const now = new Date().toISOString();
    const sameActivity =
        progress.resume?.activityId === patch.activityId &&
        progress.resume?.activityType === patch.activityType;
    const base: CourseResume = sameActivity && progress.resume
        ? progress.resume
        : { sectionIndex: 0, questionIndex: 0, answers: [], startedAt: now, ...patch, updatedAt: now };

    progress.resume = { ...base, ...patch, updatedAt: now };
    saveProgress(progress);
}

export function clearResume(knowledgeUnitID: string): void {
    const progress = getProgressFromContainer(knowledgeUnitID);
    if (!progress?.resume) return;
    delete progress.resume;
    saveProgress(progress);
}

export function isTeachingCompleted(knowledgeUnitID: string, teachingID: number): boolean {
    return !!getProgressFromContainer(knowledgeUnitID)?.subProgressTeachings
        .find(t => t.teachingID === teachingID)?.completed;
}

export function isAssessmentCompleted(knowledgeUnitID: string, assessmentID: number, type: AssessmentType): boolean {
    return !!getProgressFromContainer(knowledgeUnitID)?.subProgress
        .find(a => a.assessmentID === assessmentID && a.assessmentType === type)?.completed;
}

export function markTeachingCompleted(knowledgeUnitID: string, teachingID: number, topic = "", ktMax = 0): void {
    const progress = getProgressFromContainer(knowledgeUnitID) ?? createProgress(knowledgeUnitID, [], []);
    const existing = progress.subProgressTeachings.find(t => t.teachingID === teachingID);

    if (existing) {
        existing.completed = true;
        existing.ktEarned = existing.ktMax;
    } else {
        progress.subProgressTeachings.push({
            teachingID, topic, difficulty: "", completed: true, ktMax, ktEarned: ktMax,
        });
    }
    saveProgress(refreshTotals(progress));
}

/** Record a finished quiz / flashcard run. Keeps the best score. */
export function markAssessmentCompleted(
    knowledgeUnitID: string,
    assessmentID: number,
    type: AssessmentType,
    score: number,
    maxScore: number,
    ktEarned = 0,
    ktMax = 0,
): void {
    const progress = getProgressFromContainer(knowledgeUnitID) ?? createProgress(knowledgeUnitID, [], []);
    const existing = progress.subProgress.find(a => a.assessmentID === assessmentID && a.assessmentType === type);

    if (existing) {
        existing.completed = true;
        existing.score = Math.max(existing.score, score);
        existing.maxScore = maxScore || existing.maxScore;
        existing.ktEarned = Math.max(existing.ktEarned, ktEarned);
    } else {
        progress.subProgress.push({
            assessmentID, assessmentType: type, score, maxScore, pointScore: 1,
            completed: true, ktMax, ktEarned,
        });
    }
    saveProgress(refreshTotals(progress));
}

/** Recompute the unit's teaching/assessment percentages and `completed` flag. */
function refreshTotals(progress: Progress): Progress {
    const pct = (done: number, total: number) => (total === 0 ? 0 : Math.round((done / total) * 100));
    const t = progress.subProgressTeachings;
    const a = progress.subProgress;
    const teachingPct = pct(t.filter(x => x.completed).length, t.length);
    const assessmentPct = pct(a.filter(x => x.completed).length, a.length);

    progress.teaching = (Math.round(teachingPct / 10) * 10) as Progress["teaching"];
    progress.assessment = (Math.round(assessmentPct / 10) * 10) as Progress["assessment"];
    progress.completed =
        t.length + a.length > 0 && t.every(x => x.completed) && a.every(x => x.completed);
    return progress;
}

/** 0–100 completion for one unit, or 0 if never started. */
export function getUnitCompletionPercentage(knowledgeUnitID: string): number {
    const p = getProgressFromContainer(knowledgeUnitID);
    if (!p) return 0;
    const total = p.subProgress.length + p.subProgressTeachings.length;
    if (total === 0) return 0;
    const done =
        p.subProgress.filter(x => x.completed).length +
        p.subProgressTeachings.filter(x => x.completed).length;
    return Math.round((done / total) * 100);
}

/** The unit the learner touched most recently that isn't finished yet. */
export function getContinueTarget(): { knowledgeUnitID: string; updatedAt: string } | null {
    const container = getProgressContainer();
    if (!container) return null;

    const candidates = container.arr_progress
        .filter(p => p.resume && !p.completed)
        .sort((x, y) => (y.resume!.updatedAt).localeCompare(x.resume!.updatedAt));

    return candidates.length
        ? { knowledgeUnitID: candidates[0].knowledgeUnitID, updatedAt: candidates[0].resume!.updatedAt }
        : null;
}
