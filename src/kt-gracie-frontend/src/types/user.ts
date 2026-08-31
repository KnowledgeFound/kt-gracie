import { Gender, AgeBucket, Region, CompletedScore, AssessmentType } from "../ENUMS/enums";

// --- Gracie sub-object shape (owned by Gracie contributor) ---

export type AgeBand = "child" | "teen" | "youngAdult" | "adult";
export type Tone = "playful" | "neutral" | "formal";
export type Pace = "slow" | "standard" | "brisk";
export type Mood = "encouraging" | "neutral" | "concerned";

export interface GracieConfig {
    variantId: string;
    ageBand: AgeBand;
    tone: Tone;
    pace: Pace;
    mood: Mood;
    createdAt: string;
    /** Gracie character name chosen by the user */
	name: string;
	/** Gracie avatar variant */
	avatarId: string;
	/** Integrity score 0–100 */
	integrityScore: number;
	/** Total interactions with Gracie */
	interactionCount: number;
}

export interface ContentRecord {
    contentId: string;
    subjectId: string;
    type: "video" | "lecture" | "tutorial" | "reading";
    completedAt: string;
}

export interface AssessmentResult {
    assessmentId: string;
    type: AssessmentType;
    score: number;
    maxScore: number;
    passed: boolean;
    takenAt: string;
}

export interface Achievement {
    achievementId: string;
    title: string;
    earnedAt: string;
}
// --- City sub-object shape (owned by Agape — #21) ---

export type CityTier = "pristine" | "healthy" | "fading" | "neglected" | "ruined";

export interface City {
    health: number;
    tier: CityTier;
    updatedAt: string;
    lastDeclineAt: string | null;
}

// --- User (root model — this issue #19) ---

export interface User {
    anonymousId: string;
    firstName: string;
    ageBucket: AgeBucket;
    gender: Gender;
    region: Region;
    country: string; // local-only, never sent to canister
    createdAt: string;
    updatedAt: string;
    lastActiveAt: string;
    gracie: GracieConfig;
    city: City;
    tokenBalance: number;
}

// --- Input types for CRUD operations ---

export interface CreateUserInput {
    firstName: string;
    ageBucket: AgeBucket;
    gender: Gender;
    region?: Region;
    country?: string;
}

export type UpdateUserInput = Partial<
    Pick<User, "firstName" | "ageBucket" | "gender" | "region" | "country">
>;

//-------------------- Progress ----------------------//

export type ProgressContainer = {
    arr_progress: Progress[];
};

export type Progress = {
    knowledgeUnitID: string;
    teaching: CompletedScore | null; // amount of teaching progress completed (0–100)
    assessment: CompletedScore | null; // amount of assessment progress completed (0–100)
    subProgress: SubProgress[]; // for each assessment within the KnowledgeUnit
    completed: boolean; // indicates if the knowledge unit is fully completed
    achievments: Achievement[]; // list of achievements earned by the user
};

// contains details about each assessment
export type SubProgress = {
    assessmentID: number;
    assessmentType: AssessmentType;
    score: number;
    maxScore: number;
    pointScore: number;
    completed: boolean; 
};


