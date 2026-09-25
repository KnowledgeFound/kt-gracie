import { describe, it, expect } from "vitest";
import { isEndedMessage, youtubeId } from "../youtube";

describe("youtubeId", () => {
    it.each([
        ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
        ["https://youtu.be/dQw4w9WgXcQ?t=5", "dQw4w9WgXcQ"],
        ["https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
        ["https://youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ])("parses %s", (url, id) => expect(youtubeId(url)).toBe(id));

    it("returns null for non-YouTube or malformed links", () => {
        expect(youtubeId("https://www.unodc.org/corruption/en/learn/what-is-corruption.html")).toBeNull();
        expect(youtubeId("https://www.youtube.com/watch?v=short")).toBeNull();
        expect(youtubeId("not a url")).toBeNull();
        expect(youtubeId(undefined)).toBeNull();
    });
});

describe("isEndedMessage", () => {
    it("detects both embed message shapes", () => {
        expect(isEndedMessage(JSON.stringify({ event: "onStateChange", info: 0 }))).toBe(true);
        expect(isEndedMessage({ event: "infoDelivery", info: { playerState: 0 } })).toBe(true);
    });
    it("ignores playing / junk messages", () => {
        expect(isEndedMessage(JSON.stringify({ event: "onStateChange", info: 1 }))).toBe(false);
        expect(isEndedMessage("nope")).toBe(false);
        expect(isEndedMessage(null)).toBe(false);
    });
});
