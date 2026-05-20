// ─── Enums ────────────────────────────────────────────────────────────────────

export type AgeBucket =
	| 'AGE_17_19'
	| 'AGE_20_22'
	| 'AGE_23_25'
	| 'AGE_UNDISCLOSED';

export type Gender = 'MALE' | 'FEMALE' | 'UNDISCLOSED';

/** UN sub-region enum — 19 values */
export type Region =
	| 'NORTHERN_AFRICA'
	| 'EASTERN_AFRICA'
	| 'MIDDLE_AFRICA'
	| 'SOUTHERN_AFRICA'
	| 'WESTERN_AFRICA'
	| 'CARIBBEAN'
	| 'CENTRAL_AMERICA'
	| 'SOUTH_AMERICA'
	| 'NORTHERN_AMERICA'
	| 'CENTRAL_ASIA'
	| 'EASTERN_ASIA'
	| 'SOUTH_EASTERN_ASIA'
	| 'SOUTHERN_ASIA'
	| 'WESTERN_ASIA'
	| 'EASTERN_EUROPE'
	| 'NORTHERN_EUROPE'
	| 'SOUTHERN_EUROPE'
	| 'WESTERN_EUROPE'
	| 'OCEANIA';

// ─── Sub-models ───────────────────────────────────────────────────────────────

export interface GracieConfig {
	/** Gracie character name chosen by the user */
	name: string;
	/** Gracie avatar variant */
	avatarId: string;
	/** Integrity score 0–100 */
	integrityScore: number;
	/** Total interactions with Gracie */
	interactionCount: number;
}

export interface Progression {
	/** Total quiz sessions completed */
	quizzesCompleted: number;
	/** Cumulative correct answers across all sessions */
	totalCorrect: number;
	/** Cumulative questions answered */
	totalAnswered: number;
	/** Current streak in days */
	streakDays: number;
	/** Highest single-session score */
	highScore: number;
	/** Badges / achievements earned */
	badges: string[];
}

export interface City {
	/** City tier level 1–5 */
	tier: number;
	/** Integrity health 0–100 — decays after 24 h of inactivity */
	health: number;
	/** ISO timestamp of last health update */
	lastDecayAt: string;
}

// ─── Core User model ──────────────────────────────────────────────────────────

export interface User {
	/** UUIDv4 — generated client-side, no identity link */
	anonymousId: string;
	/** NFC-normalised first name only */
	firstName: string;
	ageBucket: AgeBucket;
	gender: Gender;
	region: Region;
	/** Local-only, never sent to canister */
	country: string;
	createdAt: string;
	updatedAt: string;
	lastActiveAt: string;
	gracie: GracieConfig;
	progression: Progression;
	city: City;
	tokenBalance: number;
}

// ─── Partial update shapes ────────────────────────────────────────────────────

export type CreateUserInput = {
	firstName: string;
	ageBucket: AgeBucket;
	gender: Gender;
	region: Region;
	country: string;
};

export type UpdateUserInput = Partial<
	Pick<User, 'firstName' | 'ageBucket' | 'gender' | 'region' | 'country'>
>;
