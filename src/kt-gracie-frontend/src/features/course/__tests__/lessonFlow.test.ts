import { describe, it, expect } from "vitest";
import { isFinalLessonStep, nextLessonStep } from "../utils";

const sections = [{ id: "a" }, { id: "b" }, { id: "c" }];

describe("nextLessonStep", () => {
    it("moves to the next section from anywhere but the end", () => {
        expect(nextLessonStep(sections, ["a"], 0)).toBe(1);
        expect(nextLessonStep(sections, ["a", "b"], 1)).toBe(2);
    });

    it("moves on even when the next section is already done (review)", () => {
        expect(nextLessonStep(sections, ["a", "b", "c"], 0)).toBe(1);
    });

    it("finishes from the last section once every section is done", () => {
        expect(nextLessonStep(sections, ["a", "b", "c"], 2)).toBeNull();
    });

    it("sends the learner back to the first skipped section instead of finishing", () => {
        // Jumped to the end via the outline; a and b never visited.
        expect(nextLessonStep(sections, ["c"], 2)).toBe(0);
        expect(nextLessonStep(sections, ["a", "c"], 2)).toBe(1);
    });

    it("finishes a one-section lesson straight away", () => {
        expect(nextLessonStep([{ id: "only" }], ["only"], 0)).toBeNull();
    });
});

describe("isFinalLessonStep", () => {
    it("is false before the last section", () => {
        expect(isFinalLessonStep(sections, ["a", "b", "c"], 1)).toBe(false);
    });

    it("is false on the last section while something earlier is still to do", () => {
        expect(isFinalLessonStep(sections, [], 2)).toBe(false);
        expect(isFinalLessonStep(sections, ["a"], 2)).toBe(false);
    });

    it("is true on the last section once the others are done — ticked or not", () => {
        expect(isFinalLessonStep(sections, ["a", "b"], 2)).toBe(true);
        expect(isFinalLessonStep(sections, ["a", "b", "c"], 2)).toBe(true);
    });

    it("is false for an index with no section", () => {
        expect(isFinalLessonStep([], [], 0)).toBe(false);
    });
});
