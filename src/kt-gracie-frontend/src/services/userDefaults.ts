import { AgeBucket } from "../ENUMS/enums";
import type { AgeBand, GracieConfig, Progression, City } from "../types/user";

const AGE_BUCKET_TO_BAND: Record<AgeBucket, AgeBand> = {
    [AgeBucket.AGE_17_19]: "teen",
    [AgeBucket.AGE_20_22]: "youngAdult",
    [AgeBucket.AGE_23_25]: "adult",
    [AgeBucket.AGE_UNDISCLOSED]: "youngAdult",
};

export function createDefaultGracie(ageBucket: AgeBucket): GracieConfig {
    const ageBand = AGE_BUCKET_TO_BAND[ageBucket];
    return {
        variantId: `default-${ageBand}`,
        ageBand,
        tone: ageBand === "teen" ? "playful" : "neutral",
        pace: "standard",
        mood: "encouraging",
        createdAt: new Date().toISOString(),
        name: "Gracie",
        avatarId: `default-${ageBand}-avatar`,
        integrityScore: 100,
        interactionCount: 0,
    };
}

export function createDefaultProgression(): Progression {
    return {
        subjectsStarted: [],
        subjectsCompleted: [],
        contentCompleted: [],
        assessmentResults: [],
        achievements: [],
        currentSubjectId: null,
        currentContentId: null,
        streakDays: 0,
        lastActivityDate: new Date().toISOString(),
        quizzesCompleted: 0,
        totalCorrect: 0,
        totalAnswered: 0,
        highScore: 0,
    };
}

export function createDefaultCity(): City {
    return {
        health: 100,
        tier: "pristine",
        updatedAt: new Date().toISOString(),
        lastDeclineAt: null,
    };
}
