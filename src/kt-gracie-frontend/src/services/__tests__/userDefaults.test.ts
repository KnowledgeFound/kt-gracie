import { describe, it, expect, beforeEach } from "vitest";
import { AgeBucket } from "../../ENUMS/enums";
import {
    createDefaultGracie,
    createDefaultCity,
} from "../userDefaults";

describe("createDefaultGracie", () => {
    it("maps AGE_17_19 to teen with playful tone", () => {
        const gracie = createDefaultGracie(AgeBucket.AGE_17_19);
        expect(gracie.ageBand).toBe("teen");
        expect(gracie.tone).toBe("playful");
        expect(gracie.pace).toBe("standard");
        expect(gracie.mood).toBe("encouraging");
        expect(gracie.variantId).toBe("default-teen");
        expect(gracie.createdAt).toBeTruthy();
    });

    it("maps AGE_20_22 to youngAdult with neutral tone", () => {
        const gracie = createDefaultGracie(AgeBucket.AGE_20_22);
        expect(gracie.ageBand).toBe("youngAdult");
        expect(gracie.tone).toBe("neutral");
    });

    it("maps AGE_23_25 to adult", () => {
        const gracie = createDefaultGracie(AgeBucket.AGE_23_25);
        expect(gracie.ageBand).toBe("adult");
        expect(gracie.tone).toBe("neutral");
    });

    it("maps AGE_UNDISCLOSED to youngAdult", () => {
        const gracie = createDefaultGracie(AgeBucket.AGE_UNDISCLOSED);
        expect(gracie.ageBand).toBe("youngAdult");
    });
});

describe("createDefaultCity", () => {
    it("returns pristine city at full health", () => {
        const city = createDefaultCity();
        expect(city.health).toBe(100);
        expect(city.tier).toBe("pristine");
        expect(city.updatedAt).toBeTruthy();
        expect(city.lastDeclineAt).toBeNull();
    });
});
