import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import CourseHeader from "../components/CourseHeader";

describe("CourseHeader", () => {
    afterEach(cleanup);

    it("sends the back arrow to the module's activity list, not out of the course", () => {
        const onBack = vi.fn();
        render(
            <CourseHeader
                title="Anti-Corruption: What is Corruption?"
                mode="lesson"
                activities={[]}
                onLesson={vi.fn()}
                onPractice={vi.fn()}
                onBack={onBack}
            />,
        );

        screen.getByRole("button", { name: "Back to activities" }).click();
        expect(onBack).toHaveBeenCalledTimes(1);
    });
});
