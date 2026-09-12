import { describe, expect, it } from 'vitest';
import {
	AUTO_LEVEL_BY_AGE_BAND,
	leveled,
	pickLevel,
	resolveReadingLevel,
} from '../readingLevel';

describe('resolveReadingLevel', () => {
	it('returns an explicit setting untouched, whatever the profile says', () => {
		expect(resolveReadingLevel('simple', 'adult')).toBe('simple');
		expect(resolveReadingLevel('advanced', 'child')).toBe('advanced');
		expect(resolveReadingLevel('standard', null)).toBe('standard');
	});

	it('maps auto through the age band', () => {
		expect(resolveReadingLevel('auto', 'child')).toBe('simple');
		expect(resolveReadingLevel('auto', 'teen')).toBe('standard');
		expect(resolveReadingLevel('auto', 'youngAdult')).toBe('standard');
		expect(resolveReadingLevel('auto', 'adult')).toBe('advanced');
		expect(resolveReadingLevel('auto', 'adult')).toBe(
			AUTO_LEVEL_BY_AGE_BAND.adult,
		);
	});

	it('falls back to standard for auto without a profile', () => {
		expect(resolveReadingLevel('auto')).toBe('standard');
		expect(resolveReadingLevel('auto', null)).toBe('standard');
	});
});

describe('pickLevel', () => {
	const copy = leveled('plain', 'normal', 'expert');

	it('returns the wording for the requested level', () => {
		expect(pickLevel(copy, 'simple')).toBe('plain');
		expect(pickLevel(copy, 'standard')).toBe('normal');
		expect(pickLevel(copy, 'advanced')).toBe('expert');
	});

	it('passes plain content straight through', () => {
		expect(pickLevel('just a string', 'advanced')).toBe('just a string');
		expect(pickLevel(['a', 'b'], 'simple')).toEqual(['a', 'b']);
		expect(pickLevel(42, 'simple')).toBe(42);
	});

	it('works for lists as well as strings', () => {
		const list = leveled(['one'], ['one', 'two'], ['one', 'two', 'three']);
		expect(pickLevel(list, 'simple')).toEqual(['one']);
		expect(pickLevel(list, 'advanced')).toHaveLength(3);
	});

	it('falls back to standard when a variant is empty', () => {
		const partial = { simple: '', standard: 'normal', advanced: 'expert' };
		expect(pickLevel(partial, 'simple')).toBe('normal');
	});
});
