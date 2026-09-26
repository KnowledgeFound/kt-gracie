import { AssessmentDifficulty } from "@/features/city/types";

export function mapDuration(duration: number): string {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    let durationString = "";

    if (hours > 0) {
        durationString += `${hours} hour${hours > 1 ? "s" : ""}`;
    }

    if (minutes > 0) {
        if (hours > 0) {
            durationString += " ";
        }
        durationString += `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }

    return durationString;
}

export function mapAssessmentDifficulty(difficulty: string): AssessmentDifficulty {
    switch (difficulty.toLowerCase()) {
        case 'easy':
            return 'easy';
        case 'medium':
            return 'medium';
        case 'hard':
            return 'hard';
        default:
            return 'medium'; // default to medium if unknown
    }
}