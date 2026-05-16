import { Gender, AgeBucket, Region } from "../ENUMS/enums";

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
}

// --- Progression sub-object shape (owned by Amanda — #20) ---

export interface ContentRecord {
    contentId: string;
    subjectId: string;
    type: "video" | "lecture" | "tutorial" | "reading";
    completedAt: string;
}

export interface AssessmentResult {
    assessmentId: string;
    subjectId: string;
    type: "quiz" | "exam" | "flashcard" | "chatQA";
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

export interface Progression {
    subjectsStarted: string[];
    subjectsCompleted: string[];
    contentCompleted: ContentRecord[];
    assessmentResults: AssessmentResult[];
    achievements: Achievement[];
    currentSubjectId: string | null;
    currentContentId: string | null;
    streakDays: number;
    lastActivityDate: string;
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
    progression: Progression;
    city: City;
    tokenBalance: number;
}

// --- Input types for CRUD operations ---

export interface CreateUserInput {
    firstName: string;
    ageBucket: AgeBucket;
    gender: Gender;
}

export type UpdateUserInput = Partial<
    Pick<User, "firstName" | "ageBucket" | "gender" | "region" | "country">
>;
