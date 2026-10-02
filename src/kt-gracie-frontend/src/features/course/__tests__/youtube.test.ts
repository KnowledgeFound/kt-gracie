import { describe, it, expect } from "vitest";
import { isEndedMessage, isWatchedMessage, youtubeEmbedUrl, youtubeId } from "../youtube";

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

describe("youtubeEmbedUrl", () => {
    it("asks the player to report back, from this page's origin", () => {
        const url = new URL(youtubeEmbedUrl("dQw4w9WgXcQ"));
        expect(url.pathname).toBe("/embed/dQw4w9WgXcQ");
        expect(url.searchParams.get("enablejsapi")).toBe("1");
        expect(url.searchParams.get("playsinline")).toBe("1");
        expect(url.searchParams.get("origin")).toBe(window.location.origin);
    });
});

describe("isWatchedMessage", () => {
    it("counts a finished video", () => {
        expect(isWatchedMessage(JSON.stringify({ event: "onStateChange", info: 0 }))).toBe(true);
    });

    it("counts a video scrubbed to within the last 5%", () => {
        const near = { event: "infoDelivery", info: { currentTime: 96, duration: 100 } };
        const middle = { event: "infoDelivery", info: { currentTime: 50, duration: 100 } };
        expect(isWatchedMessage(near)).toBe(true);
        expect(isWatchedMessage(middle)).toBe(false);
    });

    it("ignores a player that has not reported a duration yet", () => {
        expect(isWatchedMessage({ event: "infoDelivery", info: { currentTime: 0, duration: 0 } })).toBe(false);
        expect(isWatchedMessage("nope")).toBe(false);
    });
});
