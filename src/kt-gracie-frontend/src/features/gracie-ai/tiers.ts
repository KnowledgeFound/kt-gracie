/**
 * City health bands, as agreed at the 2026-05-02 standup.
 *
 * Note this is the four-tier scheme the team settled on, which is *not* the
 * five-tier `CityTier` still declared in `types/user.ts` — that one predates the
 * meeting. Gracie speaks in these bands so her wording matches what the city
 * header shows the learner.
 */
export const CITY_TIERS = [
	{ max: 29, name: 'Ghost Town' },
	{ max: 39, name: 'Struggling' },
	{ max: 49, name: 'Developing Town' },
	{ max: 100, name: 'Utopia' },
] as const;

export function bandFor(score: number): string {
	const clamped = Math.max(0, Math.min(100, Math.round(score)));
	return (CITY_TIERS.find((t) => clamped <= t.max) ?? CITY_TIERS[CITY_TIERS.length - 1]).name;
}
