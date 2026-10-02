import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import VideoPlayer from "../components/VideoPlayer";

const URL_UNDER_TEST = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

/** Post a message to the page the way the embed does, from inside the iframe. */
function postFromPlayer(payload: unknown) {
    const frame = document.querySelector("iframe") as HTMLIFrameElement;
    act(() => {
        window.dispatchEvent(
            new MessageEvent("message", {
                data: JSON.stringify(payload),
                source: frame.contentWindow,
            }),
        );
    });
}

describe("VideoPlayer", () => {
    afterEach(cleanup);

    it("embeds the video with the parameters the player needs to report back", () => {
        render(<VideoPlayer url={URL_UNDER_TEST} required watched={false} onWatched={() => {}} />);

        const src = new URL(screen.getByTitle("Lesson video").getAttribute("src")!);
        expect(src.pathname).toBe("/embed/dQw4w9WgXcQ");
        expect(src.searchParams.get("enablejsapi")).toBe("1");
        expect(src.searchParams.get("origin")).toBe(window.location.origin);
    });

    it("unlocks the lesson when the player reports the video ended", () => {
        const onWatched = vi.fn();
        render(<VideoPlayer url={URL_UNDER_TEST} required watched={false} onWatched={onWatched} />);

        postFromPlayer({ event: "infoDelivery", info: { currentTime: 10, duration: 213 } });
        expect(onWatched).not.toHaveBeenCalled();

        postFromPlayer({ event: "onStateChange", info: 0 });
        expect(onWatched).toHaveBeenCalled();
    });

    it("keeps asking the player to report until it answers", () => {
        vi.useFakeTimers();
        try {
            render(<VideoPlayer url={URL_UNDER_TEST} required watched={false} onWatched={() => {}} />);
            const frame = document.querySelector("iframe") as HTMLIFrameElement;
            const post = vi.fn();
            // jsdom gives no real player behind contentWindow; stand in for one.
            Object.defineProperty(frame, "contentWindow", { value: { postMessage: post } });

            act(() => void vi.advanceTimersByTime(1500));
            expect(post).toHaveBeenCalled();

            const calls = post.mock.calls.length;
            act(() => void vi.advanceTimersByTime(1000));
            expect(post.mock.calls.length).toBeGreaterThan(calls);
        } finally {
            vi.useRealTimers();
        }
    });

    it("offers a way out when the embed never reports anything", () => {
        vi.useFakeTimers();
        try {
            const onWatched = vi.fn();
            render(<VideoPlayer url={URL_UNDER_TEST} required watched={false} onWatched={onWatched} />);
            expect(screen.queryByText(/I’ve watched it/)).toBeNull();

            act(() => void vi.advanceTimersByTime(21_000));
            screen.getByText(/I’ve watched it/).click();
            expect(onWatched).toHaveBeenCalled();
        } finally {
            vi.useRealTimers();
        }
    });

    it("renders nothing for a link that is not a YouTube video", () => {
        const { container } = render(
            <VideoPlayer
                url="https://www.unodc.org/corruption/en/learn/what-is-corruption.html"
                required
                watched={false}
                onWatched={() => {}}
            />,
        );
        expect(container.innerHTML).toBe("");
    });
});
