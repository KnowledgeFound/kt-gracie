import { describe, it, expect, beforeEach } from "vitest";
import { toQuizQuestion } from "../utils";
import { AssessmentType } from "@/ENUMS/enums";
import {
    addProgressToContainer,
    clearResume,
    getContinueTarget,
    getResume,
    getUnitCompletionPercentage,
    markAssessmentCompleted,
    markTeachingCompleted,
    saveResume,
} from "@/services/progressContainerService";
import { createProgress } from "@/services/progressService";

describe("toQuizQuestion", () => {
    it("maps the correct index to a letter and builds an explanation from the hint", () => {
        const q = toQuizQuestion(
            { questionText: "Q?", options: ["a", "b", "c"], correctAnswerIndex: 1, hint: "Think b." },
            0,
        );
        expect(q.correctAnswer).toBe("B");
        expect(q.explanation).toContain("“b”");
        expect(q.explanation).toContain("Think b.");
    });

    it("copes with a missing hint", () => {
        const q = toQuizQuestion({ questionText: "Q?", options: ["a"], correctAnswerIndex: 0, hint: null }, 2);
        expect(q.id).toBe(3);
        expect(q.explanation).toBe("The correct answer is “a”.");
    });
});

describe("course resume", () => {
    beforeEach(() => {
        localStorage.clear();
        addProgressToContainer(
            createProgress(
                "KU-1",
                [{ assessmentID: 2, assessmentType: AssessmentType.QUIZ, score: 0, maxScore: 7, pointScore: 1, completed: false, ktMax: 10, ktEarned: 0 }],
                [{ teachingID: 1, topic: "T", difficulty: "EASY", completed: false, ktMax: 10, ktEarned: 0 }],
            ),
        );
    });

    it("saves and merges the position within the same activity", () => {
        saveResume("KU-1", { activityId: 1, activityType: AssessmentType.TEACHING, sectionIndex: 2 });
        saveResume("KU-1", { activityId: 1, activityType: AssessmentType.TEACHING, questionIndex: 0 });
        expect(getResume("KU-1")?.sectionIndex).toBe(2);
    });

    it("resets the position when the activity changes", () => {
        saveResume("KU-1", { activityId: 1, activityType: AssessmentType.TEACHING, sectionIndex: 3 });
        saveResume("KU-1", { activityId: 2, activityType: AssessmentType.QUIZ });
        expect(getResume("KU-1")?.sectionIndex).toBe(0);
        expect(getResume("KU-1")?.activityId).toBe(2);
    });

    it("tracks completion percent and completes the unit", () => {
        expect(getUnitCompletionPercentage("KU-1")).toBe(0);
        markTeachingCompleted("KU-1", 1);
        expect(getUnitCompletionPercentage("KU-1")).toBe(50);
        markAssessmentCompleted("KU-1", 2, AssessmentType.QUIZ, 5, 7, 7, 10);
        expect(getUnitCompletionPercentage("KU-1")).toBe(100);
    });

    it("keeps the best quiz score", () => {
        markAssessmentCompleted("KU-1", 2, AssessmentType.QUIZ, 6, 7, 8, 10);
        markAssessmentCompleted("KU-1", 2, AssessmentType.QUIZ, 3, 7, 4, 10);
        const sub = JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.startsWith("progress_container"))!)!)
            .arr_progress[0].subProgress[0];
        expect(sub.score).toBe(6);
        expect(sub.ktEarned).toBe(8);
    });

    it("offers the last touched unfinished unit and drops it once cleared", () => {
        expect(getContinueTarget()).toBeNull();
        saveResume("KU-1", { activityId: 1, activityType: AssessmentType.TEACHING });
        expect(getContinueTarget()?.knowledgeUnitID).toBe("KU-1");
        clearResume("KU-1");
        expect(getContinueTarget()).toBeNull();
    });
});
