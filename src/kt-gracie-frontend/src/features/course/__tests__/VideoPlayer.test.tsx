import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, act, fireEvent } from "@testing-library/react";
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
            expect(screen.queryByText(/I have watched it/)).toBeNull();

            act(() => void vi.advanceTimersByTime(21_000));
            screen.getByText(/I have watched it/).click();
            expect(onWatched).toHaveBeenCalled();
        } finally {
            vi.useRealTimers();
        }
    });

    describe("hosted media file", () => {
        const FILE_URL = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit1/Introduction__The_Scale_of_Decay.mp4";

        /** Fire a media event on the <video> with the given playback position. */
        function playTo(currentTime: number, duration: number, event: "timeupdate" | "ended") {
            const video = screen.getByTitle("Lesson video") as HTMLVideoElement;
            Object.defineProperty(video, "currentTime", { value: currentTime, configurable: true });
            Object.defineProperty(video, "duration", { value: duration, configurable: true });
            act(() => void fireEvent(video, new Event(event)));
        }

        it("plays an MP4 link in the browser's own player", () => {
            render(<VideoPlayer url={FILE_URL} required watched={false} onWatched={() => {}} />);

            const video = screen.getByTitle("Lesson video");
            expect(video.tagName).toBe("VIDEO");
            expect(video.getAttribute("src")).toBe(FILE_URL);
            expect(video.hasAttribute("controls")).toBe(true);
            expect(document.querySelector("iframe")).toBeNull();
        });

        it("unlocks the lesson when the file finishes playing", () => {
            const onWatched = vi.fn();
            render(<VideoPlayer url={FILE_URL} required watched={false} onWatched={onWatched} />);

            playTo(10, 213, "timeupdate");
            expect(onWatched).not.toHaveBeenCalled();

            playTo(213, 213, "ended");
            expect(onWatched).toHaveBeenCalledTimes(1);
        });

        it("counts a file scrubbed to within the last 5% as watched", () => {
            const onWatched = vi.fn();
            render(<VideoPlayer url={FILE_URL} required watched={false} onWatched={onWatched} />);

            playTo(96, 100, "timeupdate");
            expect(onWatched).toHaveBeenCalledTimes(1);
        });

        it("does not report again once the section is already watched", () => {
            const onWatched = vi.fn();
            render(<VideoPlayer url={FILE_URL} required watched onWatched={onWatched} />);

            playTo(100, 100, "ended");
            expect(onWatched).not.toHaveBeenCalled();
            expect(screen.getByText(/Video watched/)).toBeTruthy();
        });
    });

    it("renders nothing for a link that is not a video", () => {
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
