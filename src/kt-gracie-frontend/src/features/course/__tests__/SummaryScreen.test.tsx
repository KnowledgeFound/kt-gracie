import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { ContentType } from "@/ENUMS/enums";
import type { Module } from "@/features/city/types";
import type { SummarySection } from "@/types/types";
import SummaryScreen from "../components/SummaryScreen";

function moduleFixture(): Module {
    return {
        id: 1,
        kuId: "KU-001",
        name: "Anti-Corruption",
        description: "",
        audience: "",
        icon: BookOpen,
        image: "",
        block: "leftUp",
        objectives: [],
        expectations: [],
        assessments: [],
        progress: null,
        lessons: 0,
        ktReward: 0,
        level: "Beginner",
        duration: "30 minutes",
    };
}

function summaryFixture(overrides: Partial<SummarySection> = {}): SummarySection {
    const content = (name: string, url: string, contentType: ContentType) => ({
        name,
        contentType,
        url,
        description: `About ${name}`,
        detailedDescription: "",
    });

    return {
        id: 1,
        sequenceNo: 4,
        inforgraphic: content(
            "Corruption Overview",
            "https://www.unodc.org/documents/corruption/infographics/Corruption_Overview.png",
            ContentType.INFORGRAPHIC,
        ),
        slideDeck: content(
            "Understanding Corruption",
            "www.unodc.org/documents/corruption/slide_decks/Understanding_Corruption.pptx",
            ContentType.SLIDEDECK,
        ),
        podcast: null,
        ...overrides,
    };
}

function renderScreen(summarySection: SummarySection | null) {
    return render(
        <MemoryRouter>
            <SummaryScreen
                module={moduleFixture()}
                activities={[]}
                isDone={() => false}
                percent={100}
                nextModule={null}
                onOpen={vi.fn()}
                onChoose={vi.fn()}
                summarySection={summarySection}
            />
        </MemoryRouter>,
    );
}

describe("SummaryScreen", () => {
    afterEach(cleanup);

    it("links each summary resource to its absolute address, in a new tab", () => {
        renderScreen(summaryFixture());

        const infographic = screen.getByRole("link", { name: /Corruption Overview/ });
        expect(infographic).toHaveProperty(
            "href",
            "https://www.unodc.org/documents/corruption/infographics/Corruption_Overview.png",
        );
        expect(infographic.getAttribute("target")).toBe("_blank");

        // A bare host in the corpus is still rendered as an absolute link.
        expect(screen.getByRole("link", { name: /Understanding Corruption/ })).toHaveProperty(
            "href",
            "https://www.unodc.org/documents/corruption/slide_decks/Understanding_Corruption.pptx",
        );

        // The podcast has no entry at all, so it is not listed.
        expect(screen.queryByText("Podcast")).toBeNull();
    });

    it("splits into two columns only when there is a second column to show", () => {
        const { container: withResources } = renderScreen(summaryFixture());
        expect(withResources.firstElementChild?.className).toContain("md:grid-cols-2");
        cleanup();

        const { container: bare } = renderScreen(null);
        expect(bare.firstElementChild?.className).not.toContain("md:grid-cols-2");
    });

    it("leaves out a resource whose address cannot be linked", () => {
        renderScreen(
            summaryFixture({
                inforgraphic: {
                    name: "Sketchy",
                    contentType: ContentType.INFORGRAPHIC,
                    url: "javascript:alert(1)",
                    description: "",
                    detailedDescription: "",
                },
            }),
        );

        expect(screen.queryByRole("link", { name: /Sketchy/ })).toBeNull();
    });
});
