import { describe, it, expect, vi, afterEach } from "vitest";
import type { ComponentProps } from "react";
import { render, screen, cleanup, within } from "@testing-library/react";
import { AssessmentType } from "@/ENUMS/enums";
import type { ModuleAssessment } from "@/features/city/types";
import type { LessonSection } from "../types";
import LessonScreen from "../components/LessonScreen";

function teachingFixture(): ModuleAssessment {
    return {
        id: 1,
        title: "What is Corruption?",
        description: "",
        difficulty: "easy",
        questionCount: 0,
        durationLabel: "30 min",
        ktMax: 10,
        status: "available",
        cards: [],
        questions: [],
        type: AssessmentType.TEACHING,
        keywords: [],
        sequenceNo: 1,
    };
}

const videoSection: LessonSection = {
    id: "video",
    title: "Watch",
    markdown: "# Watch\n\nWatch this first.",
    video: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", required: true },
};

const textSection: LessonSection = {
    id: "s1",
    title: "What is corruption?",
    markdown: "# What is corruption?\n\nAbuse of entrusted power.",
};

const embedSection: LessonSection = {
    id: "s2",
    title: "Read the brief",
    markdown: "# Read the brief\n\nThe handbook, in full.",
    embed: {
        url: "https://drive.google.com/file/d/1Rn7lFR-D8E5G35PN3J0SFa8KJT-J6W2J/view",
        title: "Lesson 1 material",
    },
};

type LessonScreenProps = ComponentProps<typeof LessonScreen>;

function renderLesson(sections: LessonSection[], overrides: Partial<LessonScreenProps> = {}) {
    const props: LessonScreenProps = {
        teaching: teachingFixture(),
        sections,
        sectionIndex: 0,
        activities: [],
        activityIndex: 0,
        isDone: () => false,
        onSection: vi.fn(),
        onContinue: vi.fn(),
        onActivity: vi.fn(),
        onAsk: vi.fn(),
        isLastSection: false,
        watched: [],
        onWatched: vi.fn(),
        completedSections: [],
        onToggleComplete: vi.fn(),
        ...overrides,
    };
    return { ...render(<LessonScreen {...props} />), props };
}

describe("LessonScreen completion toggle", () => {
    afterEach(cleanup);

    it("puts the toggle beside the video on a video section", () => {
        renderLesson([videoSection]);

        expect(screen.getByText("Video completed")).toBeTruthy();
        expect(screen.queryByText("Section completed")).toBeNull();

        // The toggle sits in the same row as its label, right after the player.
        const row = screen.getByText("Video completed").parentElement!;
        expect(within(row).getByRole("switch")).toBeTruthy();
        expect(row.className).toContain("justify-end");
    });

    it("keeps the toggle at the foot of a text section", () => {
        renderLesson([textSection]);

        expect(screen.getByText("Section completed")).toBeTruthy();
        expect(screen.queryByText("Video completed")).toBeNull();
    });

    it("reports the section's state and reports a flip once", () => {
        const onToggleComplete = vi.fn();
        renderLesson([textSection], { completedSections: ["s1"], onToggleComplete });

        const toggle = screen.getByRole("switch");
        expect(toggle.getAttribute("aria-checked")).toBe("true");

        toggle.click();
        expect(onToggleComplete).toHaveBeenCalledTimes(1);
        expect(onToggleComplete).toHaveBeenCalledWith("s1");
    });

    it("puts the toggle beside the viewer on an embed section", () => {
        renderLesson([embedSection]);

        const row = screen.getByText("Section completed").parentElement!;
        expect(within(row).getByRole("switch")).toBeTruthy();
        // Alongside the link out to the file, not stranded at the bottom.
        expect(within(row.parentElement!).getByText(/Open in Drive/)).toBeTruthy();
    });

    it.each([
        ["video", videoSection],
        ["text", textSection],
        ["embed", embedSection],
    ])("offers exactly one toggle on a %s section", (_kind, section) => {
        renderLesson([section as LessonSection]);
        expect(screen.getAllByRole("switch")).toHaveLength(1);
    });
});
