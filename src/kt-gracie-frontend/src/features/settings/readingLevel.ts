import { useCallback, useMemo } from 'react';
import { useOptionalUser } from '@/features/auth';
import type { AgeBand } from '@/types/user';
import { useSettings } from './context';
import type { ReadingLevel, ReadingLevelSetting } from './types';

// ─── Leveled content ──────────────────────────────────────────────────────────

/**
 * One piece of content written three ways. Every user-facing paragraph that
 * teaches something (district blurbs, objectives, Gracie's lines, the city
 * health notes) is authored in this shape so the same screen can speak to a
 * learner still building their English and to a policy professional.
 */
export interface Leveled<T> {
	simple: T;
	standard: T;
	advanced: T;
}

/** Content that may or may not have been written per level yet. */
export type MaybeLeveled<T> = T | Leveled<T>;

/** Shorthand for authoring: `leveled('plain', 'normal', 'expert')`. */
export function leveled<T>(simple: T, standard: T, advanced: T): Leveled<T> {
	return { simple, standard, advanced };
}

function isLeveled<T>(value: MaybeLeveled<T>): value is Leveled<T> {
	return (
		typeof value === 'object' &&
		value !== null &&
		!Array.isArray(value) &&
		'standard' in value
	);
}

/**
 * The wording to show at `level`. Plain (un-leveled) content is returned as
 * is, so a screen can mix leveled and plain strings freely. A missing or
 * empty variant falls back to `standard`, so a half-written entry never shows
 * a blank.
 */
export function pickLevel<T>(value: MaybeLeveled<T>, level: ReadingLevel): T {
	if (!isLeveled(value)) return value;
	const chosen = value[level];
	if (chosen === undefined || chosen === null || chosen === '') {
		return value.standard;
	}
	return chosen;
}

// ─── Resolving the setting ────────────────────────────────────────────────────

/**
 * What `auto` means for each age band on the learner's profile. Younger
 * learners start on plain English; adults get the technical wording. Anyone
 * can override this in Settings → Learning.
 */
export const AUTO_LEVEL_BY_AGE_BAND: Record<AgeBand, ReadingLevel> = {
	child: 'simple',
	teen: 'standard',
	youngAdult: 'standard',
	adult: 'advanced',
};

/**
 * Turn the stored setting into a concrete level. Pure so it can be tested
 * without a profile or storage: pass the learner's age band when known.
 */
export function resolveReadingLevel(
	setting: ReadingLevelSetting,
	ageBand?: AgeBand | null,
): ReadingLevel {
	if (setting !== 'auto') return setting;
	return ageBand ? AUTO_LEVEL_BY_AGE_BAND[ageBand] : 'standard';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface ReadingLevelApi {
	/** The level actually in use (with `auto` already resolved). */
	level: ReadingLevel;
	/** The raw setting, so a panel can show whether `auto` is on. */
	setting: ReadingLevelSetting;
	/** Pick the wording for the current level: `t(module.description)`. */
	t: <T>(value: MaybeLeveled<T>) => T;
}

/**
 * The reading level for this learner and a `t()` that resolves leveled copy.
 * Works without a signed-in profile — `auto` then means `standard`.
 */
export function useReadingLevel(): ReadingLevelApi {
	const { settings } = useSettings();
	const user = useOptionalUser();
	const setting = settings.learning.readingLevel;
	const ageBand = user?.gracie.ageBand ?? null;

	const level = useMemo(
		() => resolveReadingLevel(setting, ageBand),
		[setting, ageBand],
	);
	const t = useCallback(
		<T,>(value: MaybeLeveled<T>) => pickLevel(value, level),
		[level],
	);

	return { level, setting, t };
}
