import { describe, it, expect, beforeEach } from "vitest";
import { Gender, AgeBucket, Region } from "../../ENUMS/enums";
import { USER_STORAGE_KEY } from "../../commons/utilts";
import {
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateGracie,
    updateTokenBalance,
} from "../userServices";

beforeEach(() => {
    localStorage.clear();
});

describe("createUser", () => {
    it("creates a user and stores in localStorage", () => {
        const user = createUser({
            firstName: "Alice",
            ageBucket: AgeBucket.AGE_20_22,
            gender: Gender.FEMALE,
        });

        expect(user.anonymousId).toBeTruthy();
        expect(user.anonymousId).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
        expect(user.firstName).toBe("Alice");
        expect(user.ageBucket).toBe(AgeBucket.AGE_20_22);
        expect(user.gender).toBe(Gender.FEMALE);
        //expect(user.region).toBe(Region.CARIBBEAN);
        expect(user.country).toBe("");
        expect(user.tokenBalance).toBe(0);
        expect(user.createdAt).toBeTruthy();
        expect(user.gracie.ageBand).toBe("youngAdult");
        expect(user.city.health).toBe(100);

        const stored = JSON.parse(localStorage.getItem(USER_STORAGE_KEY)!);
        expect(stored.anonymousId).toBe(user.anonymousId);
    });

    it("NFC-normalizes the firstName", () => {
        // é as combining sequence (e + combining acute) vs precomposed
        const combining = "e\u0301";
        const user = createUser({
            firstName: combining,
            ageBucket: AgeBucket.AGE_17_19,
            gender: Gender.MALE,
        });
        expect(user.firstName).toBe("\u00e9"); // precomposed é
    });

    it("throws if user already exists", () => {
        createUser({
            firstName: "Alice",
            ageBucket: AgeBucket.AGE_20_22,
            gender: Gender.FEMALE,
        });

        expect(() =>
            createUser({
                firstName: "Bob",
                ageBucket: AgeBucket.AGE_17_19,
                gender: Gender.MALE,
            })
        ).toThrow("User already exists");
    });
});

describe("getUser", () => {
    it("returns null when no user exists", () => {
        expect(getUser()).toBeNull();
    });

    it("returns the user after creation", () => {
        createUser({
            firstName: "Alice",
            ageBucket: AgeBucket.AGE_20_22,
            gender: Gender.FEMALE,
        });

        const user = getUser();
        expect(user).not.toBeNull();
        expect(user!.firstName).toBe("Alice");
    });
});

describe("updateUser", () => {
    it("merges updates and preserves identity", () => {
        const original = createUser({
            firstName: "Alice",
            ageBucket: AgeBucket.AGE_20_22,
            gender: Gender.FEMALE,
        });

        const updated = updateUser({ firstName: "Alicia" });
        expect(updated.firstName).toBe("Alicia");
        expect(updated.anonymousId).toBe(original.anonymousId);
        expect(updated.createdAt).toBe(original.createdAt);
        // updatedAt is refreshed (may match if within same ms, so just check it exists)
        expect(updated.updatedAt).toBeTruthy();
    });

    it("NFC-normalizes updated firstName", () => {
        createUser({
            firstName: "Alice",
            ageBucket: AgeBucket.AGE_20_22,
            gender: Gender.FEMALE,
        });

        const updated = updateUser({ firstName: "e\u0301" });
        expect(updated.firstName).toBe("\u00e9");
    });

    it("persists to localStorage", () => {
        createUser({
            firstName: "Alice",
            ageBucket: AgeBucket.AGE_20_22,
            gender: Gender.FEMALE,
        });

        updateUser({ country: "Kenya" });

        const stored = JSON.parse(localStorage.getItem(USER_STORAGE_KEY)!);
        expect(stored.country).toBe("Kenya");
    });

    it("throws when no user exists", () => {
        expect(() => updateUser({ firstName: "Bob" })).toThrow("No user found");
    });
});

describe("deleteUser", () => {
    it("removes user from localStorage", () => {
        createUser({
            firstName: "Alice",
            ageBucket: AgeBucket.AGE_20_22,
            gender: Gender.FEMALE,
        });

        deleteUser();
        expect(getUser()).toBeNull();
        expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
    });

    it("does not throw when no user exists", () => {
        expect(() => deleteUser()).not.toThrow();
    });
});

describe("updateGracie", () => {
    it("merges gracie updates", () => {
        createUser({
            firstName: "Alice",
            ageBucket: AgeBucket.AGE_20_22,
            gender: Gender.FEMALE,
        });

        const updated = updateGracie({
            mood: "concerned",
            tone: "formal",
        });

        expect(updated.gracie.mood).toBe("concerned");
        expect(updated.gracie.tone).toBe("formal");
        // untouched fields stay
        expect(updated.gracie.pace).toBe("standard");
    });

    it("throws when no user exists", () => {
        expect(() => updateGracie({ mood: "neutral" })).toThrow(
            "No user found"
        );
    });
});

describe("updateTokenBalance", () => {
    it("updates the cached token balance and persists it", () => {
        createUser({
            firstName: "Alice",
            ageBucket: AgeBucket.AGE_20_22,
            gender: Gender.FEMALE,
        });

        const updated = updateTokenBalance(120);
        expect(updated.tokenBalance).toBe(120);

        const stored = JSON.parse(localStorage.getItem(USER_STORAGE_KEY)!);
        expect(stored.tokenBalance).toBe(120);
    });

    it("supports a negative balance (debt allowed)", () => {
        createUser({
            firstName: "Alice",
            ageBucket: AgeBucket.AGE_20_22,
            gender: Gender.FEMALE,
        });

        const updated = updateTokenBalance(-30);
        expect(updated.tokenBalance).toBe(-30);
    });

    it("throws when no user exists", () => {
        expect(() => updateTokenBalance(10)).toThrow("No user found");
    });
});
