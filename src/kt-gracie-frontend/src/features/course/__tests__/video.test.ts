import { describe, it, expect } from "vitest";
import { ContentType } from "@/ENUMS/enums";
import { videoFileSrc, videoKind } from "../video";

describe("videoKind", () => {
    it("still recognises a YouTube link", () => {
        expect(videoKind("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("youtube");
        expect(videoKind("https://youtu.be/dQw4w9WgXcQ")).toBe("youtube");
    });

    it("treats the corpus's hosted MP4s as file videos", () => {
        expect(
            videoKind("https://media.knowledgefound.org/gracie/video/KnowledgeUnit1/Introduction__The_Scale_of_Decay.mp4"),
        ).toBe("file");
        expect(videoKind("https://cdn.example.org/clip.webm?token=abc")).toBe("file");
        expect(videoKind("https://cdn.example.org/clip.M4V")).toBe("file");
    });

    it("copes with a bare link the way the rest of the corpus does", () => {
        expect(videoKind("media.knowledgefound.org/gracie/video/x.mp4")).toBe("file");
        expect(videoFileSrc("media.knowledgefound.org/gracie/video/x.mp4")).toBe(
            "https://media.knowledgefound.org/gracie/video/x.mp4",
        );
    });

    it("trusts the corpus's VIDEO label when the link has no file extension", () => {
        expect(videoKind("https://stream.example.org/videos/12345", ContentType.VIDEO)).toBe("file");
        // …but not when the extension says otherwise.
        expect(videoKind("https://www.unodc.org/learn/what-is-corruption.html", ContentType.VIDEO)).toBeNull();
        // …and not for Drive, which has its own inline viewer.
        expect(
            videoKind("https://drive.google.com/file/d/1Rn7lFR-D8E5G35PN3J0SFa8KJT-J6W2J/view", ContentType.VIDEO),
        ).toBeNull();
    });

    it("is null for articles, PDFs, audio, placeholders and junk", () => {
        expect(videoKind("https://www.unodc.org/corruption/en/learn/what-is-corruption.html")).toBeNull();
        expect(videoKind("https://www.unodc.org/documents/x.pdf", ContentType.ARTICLE)).toBeNull();
        expect(videoKind("https://www.unodc.org/podcasts/corruption_podcast.mp3", ContentType.PODCAST)).toBeNull();
        expect(videoKind("#")).toBeNull();
        expect(videoKind("")).toBeNull();
        expect(videoKind(undefined)).toBeNull();
        expect(videoKind("javascript:alert(1)", ContentType.VIDEO)).toBeNull();
        expect(videoFileSrc("https://www.unodc.org/x.html")).toBeNull();
    });
});
