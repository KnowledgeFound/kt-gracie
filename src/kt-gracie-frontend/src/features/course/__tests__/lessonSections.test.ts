import { describe, it, expect, vi } from "vitest";

// The sections come from the canister corpus; stand in for it with units
// that carry no authored text, plus one that does.
vi.mock("@/services/corpusService", () => ({
    getCorpus: vi.fn(async () => ({
        knowledgeUnits: [
            {
                id: "KU-001",
                teachings: [
                    {
                        id: 1,
                        sections: [
                            { id: "s1", title: "What is corruption?", markdown: "# What is corruption?\n\nAbuse of entrusted power." },
                            { id: "s2", title: "Why it matters", markdown: "# Why it matters\n\nIt erodes trust." },
                        ],
                    },
                ],
            },
        ],
    })),
}));
import { BookOpen } from "lucide-react";
import { AssessmentType, ContentType } from "@/ENUMS/enums";
import type { Module, ModuleAssessment } from "@/features/city/types";
import { getLessonSections } from "@/services/lessonContentService";

/** A knowledge unit the bundled corpus has no authored sections for. */
function moduleFixture(): Module {
    return {
        id: 3,
        kuId: "KU-003",
        name: "Youth Led",
        description: "Youth-led action against corruption.",
        audience: "Youth",
        icon: BookOpen,
        image: "",
        block: "central",
        objectives: ["Spot everyday corruption"],
        expectations: [],
        assessments: [],
        progress: null,
        lessons: 1,
        ktReward: 10,
        level: "Beginner",
        duration: "30 minutes",
    };
}

function teachingFixture(url: string, contentType = ContentType.VIDEO): ModuleAssessment {
    return {
        id: 1,
        title: "The Architect's blue print",
        kuId: "KU-001",
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
        content: {
            name: "The Architect's blue print",
            contentType,
            url,
            description: "A short film.",
            detailedDescription: "A short film about how corruption is designed out of a system.",
        },
    };
}

describe("getLessonSections", () => {
    const MP4 = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit1/Introduction__The_Scale_of_Decay.mp4";

    it("puts a compulsory video first when the teaching links to YouTube", async () => {
        const sections = await getLessonSections(
            moduleFixture(),
            teachingFixture("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
        );

        expect(sections[0].video).toEqual({
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            required: true,
        });
        // …and the written material still follows it.
        expect(sections.length).toBeGreaterThan(1);
        expect(sections[1].video).toBeUndefined();
    });

    it("puts a compulsory video first when the teaching links to a hosted MP4", async () => {
        const sections = await getLessonSections(moduleFixture(), teachingFixture(MP4));

        expect(sections[0].video).toEqual({ url: MP4, required: true });
        expect(sections[0].title).toBe("The Architect's blue print");
        expect(sections.length).toBeGreaterThan(1);
        expect(sections[1].video).toBeUndefined();
    });

    it("leaves a non-video source as text only", async () => {
        const url = "https://www.unodc.org/corruption/en/learn/what-is-corruption.html";
        const sections = await getLessonSections(
            moduleFixture(),
            teachingFixture(url, ContentType.ARTICLE),
        );

        expect(sections).toHaveLength(1);
        expect(sections[0].video).toBeUndefined();
        expect(sections[0].markdown).toContain("The Architect's blue print");
    });

    it("uses the sections authored for a unit that has them", async () => {
        const module = { ...moduleFixture(), id: 1, kuId: "KU-001", name: "Anti-Corruption" };
        const sections = await getLessonSections(
            module,
            teachingFixture("https://www.unodc.org/corruption/en/learn/what-is-corruption.html", ContentType.ARTICLE),
        );

        expect(sections.map((s) => s.id)).toEqual(["s1", "s2"]);
        expect(sections[0].markdown).toContain("corruption");
    });

    it("prepends the video to authored sections that do not embed one", async () => {
        const module = { ...moduleFixture(), id: 1, kuId: "KU-001", name: "Anti-Corruption" };
        const sections = await getLessonSections(module, teachingFixture(MP4));

        expect(sections.map((s) => s.id)).toEqual(["video", "s1", "s2"]);
        expect(sections[0].video?.url).toBe(MP4);
    });
});
