import { Gender, Region } from "../ENUMS/enums";
import { getLocalStorage, setLocalStorage, USER_STORAGE_KEY } from "../commons/utilts";
import { regionForCountry } from "../features/auth/countries";
import { verifyPassword } from "../features/auth/password";
import type {
    User,
    CreateUserInput,
    UpdateUserInput,
    GracieConfig,
} from "../types/user";
import {
    createDefaultGracie,
    createDefaultCity,
} from "./userDefaults";

export const SESSION_STORAGE_KEY = "gracie_session";

export function createUser(input: CreateUserInput): User {
    const existing = getUser();
    // A profile from before accounts had passwords can be replaced; a real
    // account cannot — sign in instead.
    if (existing && existing.passwordHash) {
        throw new Error("An account already exists on this device. Sign in instead.");
    }

    const now = new Date().toISOString();
    const country = input.country?.trim() || "";
    const user: User = {
        anonymousId: crypto.randomUUID(),
        username: input.username.trim(),
        passwordHash: input.passwordHash,
        passwordSalt: input.passwordSalt,
        firstName: (input.firstName || input.username).trim().normalize("NFC"),
        ageBucket: input.ageBucket,
        gender: input.gender ?? Gender.UNDISCLOSED,
        region: input.region || regionForCountry(country) || Region.SOUTHERN_AFRICA,
        country,
        createdAt: now,
        updatedAt: now,
        lastActiveAt: now,
        gracie: createDefaultGracie(input.ageBucket),
        city: createDefaultCity(),
        tokenBalance: 0,
    };

    setLocalStorage(USER_STORAGE_KEY, user);
    signIn();
    return user;
}

export function getUser(): User | null {
    return getLocalStorage(USER_STORAGE_KEY) as User | null;
}

// ── Session ────────────────────────────────────────────────────────────────
// The account lives on this device; a session says whether its owner is
// signed in right now. Signing out keeps the account and its progress.

export function isSignedIn(): boolean {
    const user = getUser();
    if (!user) return false;
    // Profiles created before passwords existed are treated as signed in.
    if (!user.passwordHash) return true;
    return getLocalStorage(SESSION_STORAGE_KEY)?.username === user.username;
}

export function signIn(): void {
    const user = getUser();
    if (!user) return;
    setLocalStorage(SESSION_STORAGE_KEY, { username: user.username, signedInAt: new Date().toISOString() });
}

export function signOut(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Check credentials against the account on this device and open a session
 * when they match. Resolves false (never throws) on a mismatch.
 */
export async function login(username: string, password: string): Promise<boolean> {
    const user = getUser();
    if (!user || !user.passwordHash || !user.passwordSalt) return false;
    if (user.username.toLowerCase() !== username.trim().toLowerCase()) return false;
    const ok = await verifyPassword(password, user.passwordSalt, user.passwordHash);
    if (ok) {
        signIn();
        setLocalStorage(USER_STORAGE_KEY, { ...user, lastActiveAt: new Date().toISOString() });
    }
    return ok;
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
        ...(updates.country && !updates.region
            ? { region: regionForCountry(updates.country) ?? user.region }
            : {}),
        updatedAt: now,
        lastActiveAt: now,
    };

    setLocalStorage(USER_STORAGE_KEY, updated);
    return updated;
}

export function deleteUser(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
    signOut();
}


/**
 * Write the locally-cached token balance.
 *
 * The backend token canister is the source of truth for balances; `tokenBalance`
 * on the user is only a display cache so the UI can render a number without an
 * async call. This function is a plain cache write — the optimistic
 * credit/debit/reconcile orchestration against the backend lives in
 * `knowledgeTokenService`.
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
