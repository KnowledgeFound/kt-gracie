import { useMemo } from 'react';
import { useUser } from '@/features/auth';
import { modules } from '@/features/city/constants';
import { bandFor } from '../tiers';
import type { LearnerFacts } from '../types';

/**
 * Assembles the learner state Gracie is allowed to talk about, from the same
 * stored profile the rest of the app reads. Nothing here is fetched, and
 * nothing here leaves the device.
 *
 * `overrides` lets a caller pin a fact for one turn — the assessment result
 * that was just submitted, or the tokens that were just awarded — without
 * writing it back to the profile first.
 */
export function useLearnerFacts(overrides?: Partial<LearnerFacts>): LearnerFacts {
	// City health comes from the City held in auth context, not from
	// `user.city.health` — the two can diverge, and the context copy is the one
	// the city header and health modal render (see fa7a693). Gracie must quote
	// the same number the learner is looking at.
	const { user, city } = useUser();

	return useMemo(() => {
		const modulesTotal = modules.length;
		const modulesDone = modules.filter(
			(m) => m.progress?.percentComplete === 100,
		).length;
		const score = Math.round(city?.getHealth() ?? 0);
		// The module they are part-way through, which is what "where was I" means.
		const inFlight = modules.find(
			(m) => m.progress && m.progress.startedAt !== null && m.progress.percentComplete < 100,
		);

		return {
			name: user?.firstName?.trim() || 'there',
			score,
			band: bandFor(score),
			modulesDone,
			modulesTotal,
			tokens: user?.tokenBalance ?? 0,
			lastModule: inFlight?.name,
			subject: inFlight?.name,
			...overrides,
		};
	}, [user, city, overrides]);
}
