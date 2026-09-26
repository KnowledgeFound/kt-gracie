import { describe, it, expect } from "vitest";
import { driveEmbedUrl, driveFileId } from "../drive";

describe("drive helpers", () => {
    it("extracts the file id from share links", () => {
        expect(driveFileId("https://drive.google.com/file/d/1Rn7lFR-D8E5G35PN3J0SFa8KJT-J6W2J/view")).toBe("1Rn7lFR-D8E5G35PN3J0SFa8KJT-J6W2J");
        expect(driveFileId("https://drive.google.com/open?id=abc123")).toBe("abc123");
    });
    it("rejects non-Drive links", () => {
        expect(driveFileId("https://example.com/file/d/abc")).toBeNull();
        expect(driveFileId(undefined)).toBeNull();
    });
    it("builds the preview URL", () => {
        expect(driveEmbedUrl("abc")).toBe("https://drive.google.com/file/d/abc/preview");
    });
});
