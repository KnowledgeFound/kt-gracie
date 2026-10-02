import { describe, it, expect, beforeEach } from "vitest";
import { AssessmentType } from "@/ENUMS/enums";
import type { ModuleAssessment } from "@/features/city/types";
import {
    addProgressToContainer,
    markAssessmentCompleted,
    markTeachingCompleted,
} from "@/services/progressContainerService";
import { createProgress } from "@/services/progressService";
import { isSummaryDone } from "../hooks/useCourse";

function activity(id: number, type: AssessmentType): ModuleAssessment {
    return {
        id,
        title: `${type} ${id}`,
        description: "",
        difficulty: "easy",
        questionCount: 0,
        durationLabel: "",
        ktMax: 10,
        status: "available",
        cards: [],
        questions: [],
        type,
        keywords: [],
        sequenceNo: id,
        kuId: "KU-001",
    };
}

const TEACHING = activity(1, AssessmentType.TEACHING);
const QUIZ = activity(2, AssessmentType.QUIZ);
const SUMMARY = activity(3, AssessmentType.SUMMARY);
const ALL = [TEACHING, QUIZ, SUMMARY];

describe("isSummaryDone", () => {
    beforeEach(() => {
        localStorage.clear();
        addProgressToContainer(createProgress("KU-1", [], []));
    });

    it("stays unticked while anything in the unit is outstanding", () => {
        expect(isSummaryDone("KU-1", ALL)).toBe(false);

        markTeachingCompleted("KU-1", TEACHING.id);
        expect(isSummaryDone("KU-1", ALL)).toBe(false);
    });

    it("ticks once the rest of the unit is finished", () => {
        markTeachingCompleted("KU-1", TEACHING.id);
        markAssessmentCompleted("KU-1", QUIZ.id, AssessmentType.QUIZ, 7, 7, 10, 10);

        expect(isSummaryDone("KU-1", ALL)).toBe(true);
    });

    it("does not tick for a unit whose only entry is the summary", () => {
        expect(isSummaryDone("KU-1", [SUMMARY])).toBe(false);
    });
});
