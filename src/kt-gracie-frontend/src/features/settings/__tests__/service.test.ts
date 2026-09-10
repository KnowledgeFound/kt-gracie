import { beforeEach, describe, expect, it } from 'vitest';
import {
	DEFAULT_SETTINGS,
	INTRO_SEEN_STORAGE_KEY,
	SETTINGS_STORAGE_KEY,
} from '../constants';
import {
	clearIntroShown,
	clearSettings,
	getIntroLastShown,
	getIntroNextDue,
	isIntroDue,
	loadSettings,
	markIntroShown,
	saveSettings,
} from '../service';

describe('settings service', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('returns the defaults when nothing is stored', () => {
		expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
	});

	it('round-trips saved settings', () => {
		const saved = {
			...DEFAULT_SETTINGS,
			appearance: { ...DEFAULT_SETTINGS.appearance, theme: 'dark' as const },
			guide: { ...DEFAULT_SETTINGS.guide, audio: true, volume: 0.4 },
		};
		saveSettings(saved);

		expect(loadSettings()).toEqual(saved);
	});

	it('fills in sections and keys missing from an older blob', () => {
		localStorage.setItem(
			SETTINGS_STORAGE_KEY,
			JSON.stringify({ appearance: { theme: 'dark' } }),
		);

		const loaded = loadSettings();

		expect(loaded.appearance.theme).toBe('dark');
		// Untouched key in a partial section
		expect(loaded.appearance.accent).toBe(DEFAULT_SETTINGS.appearance.accent);
		// Section absent entirely
		expect(loaded.city).toEqual(DEFAULT_SETTINGS.city);
	});

	it('falls back to the defaults when the stored blob is not an object', () => {
		localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify('nonsense'));
		expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
	});

	it('clears the stored blob', () => {
		saveSettings(DEFAULT_SETTINGS);
		clearSettings();
		expect(localStorage.getItem(SETTINGS_STORAGE_KEY)).toBeNull();
	});

	it('maps a pre-frequency autoIntro:false onto "never"', () => {
		localStorage.setItem(
			SETTINGS_STORAGE_KEY,
			JSON.stringify({ guide: { autoIntro: false, volume: 0.3 } }),
		);

		const loaded = loadSettings();

		expect(loaded.guide.introFrequency).toBe('never');
		expect(loaded.guide.volume).toBe(0.3);
	});

	it('keeps the default schedule when the old autoIntro was on', () => {
		localStorage.setItem(
			SETTINGS_STORAGE_KEY,
			JSON.stringify({ guide: { autoIntro: true } }),
		);

		expect(loadSettings().guide.introFrequency).toBe(
			DEFAULT_SETTINGS.guide.introFrequency,
		);
	});
});

describe('intro schedule', () => {
	const NOW = new Date('2026-08-13T10:00:00');

	beforeEach(() => {
		localStorage.clear();
	});

	it('is due when it has never played, whatever the schedule', () => {
		for (const freq of ['always', 'daily', 'weekly', 'once'] as const) {
			expect(isIntroDue(freq, null, NOW)).toBe(true);
		}
	});

	it('never plays on "never", even on a first visit', () => {
		expect(isIntroDue('never', null, NOW)).toBe(false);
	});

	it('replays every visit on "always"', () => {
		expect(isIntroDue('always', new Date('2026-08-13T09:59:00'), NOW)).toBe(true);
	});

	it('plays once per calendar day on "daily"', () => {
		// Earlier the same day — already seen.
		expect(isIntroDue('daily', new Date('2026-08-13T01:00:00'), NOW)).toBe(false);
		// Late last night — a new day, so it is due again.
		expect(isIntroDue('daily', new Date('2026-08-12T23:30:00'), NOW)).toBe(true);
	});

	it('waits seven days on "weekly"', () => {
		expect(isIntroDue('weekly', new Date('2026-08-07T10:00:00'), NOW)).toBe(false);
		expect(isIntroDue('weekly', new Date('2026-08-06T09:00:00'), NOW)).toBe(true);
	});

	it('never repeats on "once"', () => {
		expect(isIntroDue('once', new Date('2020-01-01T00:00:00'), NOW)).toBe(false);
	});

	it('reports the next run only for recurring schedules that are not due', () => {
		const yesterdayLate = new Date('2026-08-13T01:00:00');

		expect(getIntroNextDue('daily', yesterdayLate, NOW)).toEqual(
			new Date('2026-08-14T00:00:00'),
		);
		expect(getIntroNextDue('always', yesterdayLate, NOW)).toBeNull();
		expect(getIntroNextDue('once', yesterdayLate, NOW)).toBeNull();
		// Due right now — there is nothing to schedule.
		expect(getIntroNextDue('daily', new Date('2026-08-01T10:00:00'), NOW)).toBeNull();
	});

	it('round-trips the last-shown stamp', () => {
		expect(getIntroLastShown()).toBeNull();

		markIntroShown(NOW);
		expect(getIntroLastShown()?.toISOString()).toBe(NOW.toISOString());

		clearIntroShown();
		expect(getIntroLastShown()).toBeNull();
	});

	it('ignores an unparseable stamp', () => {
		localStorage.setItem(INTRO_SEEN_STORAGE_KEY, 'not-a-date');
		expect(getIntroLastShown()).toBeNull();
	});

	it('survives a settings reset — the stamp lives outside the settings blob', () => {
		markIntroShown(NOW);
		clearSettings();
		expect(getIntroLastShown()?.toISOString()).toBe(NOW.toISOString());
	});
});
