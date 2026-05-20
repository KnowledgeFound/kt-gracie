import type {
	User,
	CreateUserInput,
	UpdateUserInput,
	GracieConfig,
	Progression,
} from '../types';
import { STORAGE_KEY } from '../constants';
import { generateUUID, now, normaliseName } from '../utils';

// ─── Default sub-model factories ──────────────────────────────────────────────

function defaultGracie(): GracieConfig {
	return {
		name: 'Gracie',
		avatarId: 'default',
		integrityScore: 50,
		interactionCount: 0,
	};
}

function defaultProgression(): Progression {
	return {
		quizzesCompleted: 0,
		totalCorrect: 0,
		totalAnswered: 0,
		streakDays: 0,
		highScore: 0,
		badges: [],
	};
}

// ─── CRUD operations ──────────────────────────────────────────────────────────

/**
 * Creates a new User, persists it to localStorage, and returns it.
 * Throws if a user already exists — call deleteUser() first to replace.
 */
export function createUser(input: CreateUserInput): User {
	if (getUser() !== null) {
		throw new Error(
			'A user already exists. Call deleteUser() before creating a new one.',
		);
	}

	const timestamp = now();
	const user: User = {
		anonymousId: generateUUID(),
		firstName: normaliseName(input.firstName),
		ageBucket: input.ageBucket,
		gender: input.gender,
		region: input.region,
		country: input.country,
		createdAt: timestamp,
		updatedAt: timestamp,
		lastActiveAt: timestamp,
		gracie: defaultGracie(),
		progression: defaultProgression(),
		city: { tier: 1, health: 100, lastDecayAt: timestamp },
		tokenBalance: 0,
	};

	persist(user);
	return user;
}

/**
 * Returns the stored User, or null if none exists.
 */
export function getUser(): User | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as User;
	} catch {
		return null;
	}
}

/**
 * Merges shallow updates into the stored User and persists the result.
 * Throws if no user exists.
 */
export function updateUser(updates: UpdateUserInput): User {
	const user = requireUser();
	const updated: User = {
		...user,
		...updates,
		// Re-normalise name if it was updated
		...(updates.firstName
			? { firstName: normaliseName(updates.firstName) }
			: {}),
		updatedAt: now(),
		lastActiveAt: now(),
	};
	persist(updated);
	return updated;
}

/**
 * Removes the user from localStorage.
 */
export function deleteUser(): void {
	localStorage.removeItem(STORAGE_KEY);
}

/**
 * Replaces the user's progression object and persists.
 */
export function updateProgression(
	progression: Partial<Progression>,
): User {
	const user = requireUser();
	const updated: User = {
		...user,
		progression: { ...user.progression, ...progression },
		updatedAt: now(),
		lastActiveAt: now(),
	};
	persist(updated);
	return updated;
}

/**
 * Replaces the user's GracieConfig object and persists.
 */
export function updateGracie(gracie: Partial<GracieConfig>): User {
	const user = requireUser();
	const updated: User = {
		...user,
		gracie: { ...user.gracie, ...gracie },
		updatedAt: now(),
		lastActiveAt: now(),
	};
	persist(updated);
	return updated;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function persist(user: User): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function requireUser(): User {
	const user = getUser();
	if (!user) throw new Error('No user found. Call createUser() first.');
	return user;
}
