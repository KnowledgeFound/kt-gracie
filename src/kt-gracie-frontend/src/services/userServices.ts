import { Region } from "../ENUMS/enums";
import { getLocalStorage, setLocalStorage, USER_STORAGE_KEY } from "../commons/utilts";
import type {
    User,
    CreateUserInput,
    UpdateUserInput,
    Progression,
    GracieConfig,
} from "../types/user";
import {
    createDefaultGracie,
    createDefaultProgression,
    createDefaultCity,
} from "./userDefaults";

export function createUser(input: CreateUserInput): User {
    const existing = getUser();
    if (existing) {
        throw new Error("User already exists. Delete first.");
    }

    const now = new Date().toISOString();
    const user: User = {
        anonymousId: crypto.randomUUID(),
        firstName: input.firstName.normalize("NFC"),
        ageBucket: input.ageBucket,
        gender: input.gender,
        region: input.region || Region.SOUTHERN_AFRICA,
        country: input.country || "Global Citizen",
        createdAt: now,
        updatedAt: now,
        lastActiveAt: now,
        gracie: createDefaultGracie(input.ageBucket),
        progression: createDefaultProgression(),
        city: createDefaultCity(),
        tokenBalance: 0,
    };

    setLocalStorage(USER_STORAGE_KEY, user);
    return user;
}

export function getUser(): User | null {
    return getLocalStorage(USER_STORAGE_KEY) as User | null;
}

export function updateUser(updates: UpdateUserInput): User {
    const user = getUser();
    if (!user) {
        throw new Error("No user found.");
    }

    const now = new Date().toISOString();
    const updated: User = {
        ...user,
        ...updates,
        ...(updates.firstName
            ? { firstName: updates.firstName.normalize("NFC") }
            : {}),
        updatedAt: now,
        lastActiveAt: now,
    };

    setLocalStorage(USER_STORAGE_KEY, updated);
    return updated;
}

export function deleteUser(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
}

export function updateProgression(updates: Partial<Progression>): User {
    const user = getUser();
    if (!user) {
        throw new Error("No user found.");
    }

    const now = new Date().toISOString();
    const updated: User = {
        ...user,
        progression: { ...user.progression, ...updates },
        updatedAt: now,
        lastActiveAt: now,
    };

    setLocalStorage(USER_STORAGE_KEY, updated);
    return updated;
}

/**
 * Sync the locally-cached token balance from the backend.
 *
 * The backend token canister is the source of truth for balances; `tokenBalance`
 * on the user is only a display cache so the UI can render a number without an
 * async call. Call this after a credit/debit (or on load) with the balance the
 * backend returned.
 */
export function updateTokenBalance(tokenBalance: number): User {
    const user = getUser();
    if (!user) {
        throw new Error("No user found.");
    }

    const now = new Date().toISOString();
    const updated: User = {
        ...user,
        tokenBalance,
        updatedAt: now,
        lastActiveAt: now,
    };

    setLocalStorage(USER_STORAGE_KEY, updated);
    return updated;
}

export function updateGracie(updates: Partial<GracieConfig>): User {
    const user = getUser();
    if (!user) {
        throw new Error("No user found.");
    }

    const now = new Date().toISOString();
    const updated: User = {
        ...user,
        gracie: { ...user.gracie, ...updates },
        updatedAt: now,
        lastActiveAt: now,
    };

    setLocalStorage(USER_STORAGE_KEY, updated);
    return updated;
}
