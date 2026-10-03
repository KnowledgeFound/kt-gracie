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
        kuId : "kU_001",
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

    it("has no toggle on a text section — Continue marks it done", () => {
        renderLesson([textSection]);

        expect(screen.queryByRole("switch")).toBeNull();
        expect(screen.queryByText("Section completed")).toBeNull();
        expect(screen.queryByText("Video completed")).toBeNull();
    });

    it("has no toggle on an embed section, but keeps the link out to the file", () => {
        renderLesson([embedSection]);

        expect(screen.queryByRole("switch")).toBeNull();
        expect(screen.getByText(/Open in Drive/)).toBeTruthy();
    });

    it("reports the video section's state and reports a flip once", () => {
        const onToggleComplete = vi.fn();
        renderLesson([videoSection], { completedSections: ["video"], onToggleComplete });

        const toggle = screen.getByRole("switch");
        expect(toggle.getAttribute("aria-checked")).toBe("true");

        toggle.click();
        expect(onToggleComplete).toHaveBeenCalledTimes(1);
        expect(onToggleComplete).toHaveBeenCalledWith("video");
    });

    it.each([
        ["video", videoSection, 1],
        ["text", textSection, 0],
        ["embed", embedSection, 0],
    ])("offers %i toggle(s) on a %s section", (_kind, section, count) => {
        renderLesson([section as LessonSection]);
        expect(screen.queryAllByRole("switch")).toHaveLength(count as number);
    });
});

describe("LessonScreen continue button", () => {
    afterEach(cleanup);

    const three: LessonSection[] = [
        textSection,
        { ...textSection, id: "s2", title: "Two" },
        { ...textSection, id: "s3", title: "Three" },
    ];

    it("reads Continue on a middle section", () => {
        renderLesson(three, { sectionIndex: 1, completedSections: ["s1"] });
        expect(screen.getByText("Continue")).toBeTruthy();
        expect(screen.queryByText("Finish lesson")).toBeNull();
    });

    it("reads Continue on the last section while earlier ones are still to do", () => {
        // Jumped straight to the end via the outline: sections 1 and 2 untouched.
        renderLesson(three, { sectionIndex: 2, completedSections: [] });
        expect(screen.getByText("Continue")).toBeTruthy();
        expect(screen.queryByText("Finish lesson")).toBeNull();
    });

    it("reads Finish lesson on the last section once every other one is done", () => {
        renderLesson(three, { sectionIndex: 2, completedSections: ["s1", "s2"] });
        expect(screen.getByText("Finish lesson")).toBeTruthy();
    });

    it("does not need the last section itself to be ticked first", () => {
        renderLesson(three, { sectionIndex: 2, completedSections: ["s1", "s2", "s3"] });
        expect(screen.getByText("Finish lesson")).toBeTruthy();
    });
});
