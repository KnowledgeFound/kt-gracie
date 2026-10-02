import { describe, it, expect } from "vitest";
import { absoluteUrl } from "../utils";

describe("absoluteUrl", () => {
    it("passes an already absolute link through", () => {
        const url = "https://www.unodc.org/documents/corruption/infographics/Corruption_Overview.png";
        expect(absoluteUrl(url)).toBe(url);
    });

    it("upgrades a bare or protocol-relative host to https", () => {
        expect(absoluteUrl("www.unodc.org/podcasts/corruption_podcast.mp3")).toBe(
            "https://www.unodc.org/podcasts/corruption_podcast.mp3",
        );
        expect(absoluteUrl("//unodc.org/deck.pptx")).toBe("https://unodc.org/deck.pptx");
    });

    it("keeps http as-is rather than silently rewriting it", () => {
        expect(absoluteUrl("http://unodc.org/deck.pptx")).toBe("http://unodc.org/deck.pptx");
    });

    it("drops anything that is not a web address", () => {
        expect(absoluteUrl("javascript:alert(1)")).toBeNull();
        expect(absoluteUrl("mailto:someone@unodc.org")).toBeNull();
        expect(absoluteUrl("   ")).toBeNull();
        expect(absoluteUrl(undefined)).toBeNull();
        expect(absoluteUrl(null)).toBeNull();
    });
});
