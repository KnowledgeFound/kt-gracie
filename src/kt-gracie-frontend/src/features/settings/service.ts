import { getLocalStorage, setLocalStorage } from '@/commons/utilts';
import {
	DEFAULT_SETTINGS,
	INTRO_SEEN_STORAGE_KEY,
	SETTINGS_STORAGE_KEY,
} from './constants';
import type { AppSettings, IntroFrequency } from './types';

/**
 * Merge a stored blob over the defaults, one section deep.
 *
 * Settings live on the device and outlive releases, so anything unknown or
 * missing (a key added in a later version, a hand-edited value) falls back to
 * the default rather than reaching the UI as `undefined`.
 */
function mergeWithDefaults(stored: unknown): AppSettings {
	if (!stored || typeof stored !== 'object') return DEFAULT_SETTINGS;

	const blob = stored as Partial<Record<keyof AppSettings, unknown>>;
	const merged = {} as AppSettings;

	for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof AppSettings)[]) {
		const section = blob[key];
		// Indexed write — TS can't narrow `merged[key]` and the section together.
		(merged as unknown as Record<string, unknown>)[key] = {
			...DEFAULT_SETTINGS[key],
			...(section && typeof section === 'object' ? section : {}),
		};
	}

	return migrate(merged, stored as Record<string, unknown>);
}

/**
 * Carry forward settings written by an earlier release.
 *
 * `guide.autoIntro` (a boolean) became `guide.introFrequency`. A user who had
 * switched the intro off must not get it back just because the key was renamed.
 */
function migrate(settings: AppSettings, stored: Record<string, unknown>): AppSettings {
	const storedGuide = stored.guide as Record<string, unknown> | undefined;
	const hasFrequency = typeof storedGuide?.introFrequency === 'string';

	if (!hasFrequency && storedGuide?.autoIntro === false) {
		return {
			...settings,
			guide: { ...settings.guide, introFrequency: 'never' },
		};
	}

	return settings;
}

export function loadSettings(): AppSettings {
	try {
		return mergeWithDefaults(getLocalStorage(SETTINGS_STORAGE_KEY));
	} catch {
		// Corrupt JSON — start clean rather than blocking the app from booting.
		return DEFAULT_SETTINGS;
	}
}

export function saveSettings(settings: AppSettings): void {
	setLocalStorage(SETTINGS_STORAGE_KEY, settings);
}

export function clearSettings(): void {
	localStorage.removeItem(SETTINGS_STORAGE_KEY);
}

// ─── Intro walkthrough schedule ───────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

/** When the intro last finished playing, or null if it never has. */
export function getIntroLastShown(): Date | null {
	const raw = localStorage.getItem(INTRO_SEEN_STORAGE_KEY);
	if (!raw) return null;

	const date = new Date(raw);
	return Number.isNaN(date.getTime()) ? null : date;
}

export function markIntroShown(when: Date = new Date()): void {
	localStorage.setItem(INTRO_SEEN_STORAGE_KEY, when.toISOString());
}

/** Forget that the intro ever played, so it runs again on the next visit. */
export function clearIntroShown(): void {
	localStorage.removeItem(INTRO_SEEN_STORAGE_KEY);
}

function isSameLocalDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

/**
 * Whether the intro should play right now.
 *
 * Pure so the schedule can be tested without touching storage or the clock:
 * `lastShown` is the stored stamp (null if it has never run) and `now` is the
 * current time.
 */
export function isIntroDue(
	frequency: IntroFrequency,
	lastShown: Date | null,
	now: Date = new Date(),
): boolean {
	if (frequency === 'never') return false;
	if (frequency === 'always') return true;
	if (!lastShown) return true;

	switch (frequency) {
		case 'once':
			return false;
		case 'daily':
			// Calendar day, not a rolling 24 hours — "once a day" should mean the
			// first visit of the day, whatever time yesterday's visit was.
			return !isSameLocalDay(lastShown, now);
		case 'weekly':
			return now.getTime() - lastShown.getTime() >= 7 * DAY_MS;
	}
}

/**
 * When the intro will next play, given the schedule and the last run.
 * Null when there is nothing to announce (it is due now, or never runs).
 */
export function getIntroNextDue(
	frequency: IntroFrequency,
	lastShown: Date | null,
	now: Date = new Date(),
): Date | null {
	// Only the recurring schedules have a "next" worth showing, and only while
	// the intro is not already due.
	if (frequency !== 'daily' && frequency !== 'weekly') return null;
	if (!lastShown || isIntroDue(frequency, lastShown, now)) return null;

	if (frequency === 'daily') {
		const next = new Date(lastShown);
		next.setHours(0, 0, 0, 0);
		next.setDate(next.getDate() + 1);
		return next;
	}

	return new Date(lastShown.getTime() + 7 * DAY_MS);
}
