import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'corpus');

/**
 * Loads every corpus file and flattens it to one probe list.
 *
 * Category-level `defaultMustNot` is merged into each probe rather than kept
 * separate: the scorer should never have to know which level a pattern came
 * from, and a probe that overrides it is stating something specific about
 * itself.
 */
export function loadCorpus() {
	const files = readdirSync(DIR)
		.filter((f) => f.endsWith('.json'))
		.sort();

	const probes = [];
	const categories = [];

	for (const file of files) {
		const c = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
		categories.push({
			category: c.category,
			description: c.description,
			count: c.probes.length,
			file,
		});
		for (const p of c.probes) {
			probes.push({
				...p,
				category: c.category,
				// A probe's own mustNot replaces the category default when present.
				mustNot: p.mustNot ?? c.defaultMustNot ?? c.mustNot ?? [],
				signpostPatterns: c.signpostPatterns ?? [],
				figurePattern: c.figurePattern ?? null,
				turns: p.turns ?? [p.ask],
				ask: p.ask ?? p.turns[p.turns.length - 1],
				multiTurn: Boolean(p.turns),
			});
		}
	}

	return { probes, categories };
}

export const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

/** Learner state the router and prompts are given. A mid-course profile. */
export const FACTS = {
	name: 'Amara',
	score: 42,
	band: 'Developing Town',
	modulesDone: 2,
	modulesTotal: 5,
	tokens: 400,
	// Left unset, matching LearnerFacts: the quiz and token templates are gated
	// on these being present, and a learner mid-module has no fresh result.
	lastModule: 'Types of Corruption',
	subject: 'the United Nations Convention against Corruption',
};
