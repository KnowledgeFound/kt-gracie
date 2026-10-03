import { describe, it, expect } from "vitest";
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

// describe("getLessonSections", () => {
//     it("puts a compulsory video first when the teaching links to YouTube", () => {
//         const sections = getLessonSections(
//             moduleFixture(),
//             teachingFixture("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
//         );

//         expect(sections[0].video).toEqual({
//             url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
//             required: true,
//         });
//         // …and the written material still follows it.
//         expect(sections.length).toBeGreaterThan(1);
//         expect(sections[1].video).toBeUndefined();
//     });

//     it("leaves a non-video source as a read-more link instead", () => {
//         const url = "https://www.unodc.org/corruption/en/learn/what-is-corruption.html";
//         const sections = getLessonSections(
//             moduleFixture(),
//             teachingFixture(url, ContentType.ARTICLE),
//         );

//         expect(sections.every((s) => !s.video)).toBe(true);
//         expect(sections[0].markdown).toContain(url);
//     });

//     it("uses the sections authored for a unit that has them", () => {
//         const module = { ...moduleFixture(), id: 1, kuId: "KU-001", name: "Anti-Corruption" };
//         const sections = getLessonSections(
//             module,
//             teachingFixture("https://www.unodc.org/corruption/en/learn/what-is-corruption.html"),
//         );

//         expect(sections.length).toBeGreaterThan(1);
//         expect(sections[0].markdown).toContain("corruption");
//     });
// });
