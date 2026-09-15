import type { LearnerFacts } from './types';

/**
 * Routes a learner turn before any model is consulted.
 *
 * The four branches exist because sending everything to a 350M model does not
 * work. Measured on six candidate models: asked directly how to bribe an
 * official, the baseline answered with advice on how to do it; asked for their
 * progress, half of them dropped or invented a number. Both classes of turn are
 * now answered without the model.
 */
export type RouteMode = 'guard' | 'template' | 'blended' | 'text';

export interface Route {
	mode: RouteMode;
	kind: string;
}

/**
 * A first-person request.
 *
 * Guards must gate on intent, not vocabulary. An earlier version matched the
 * word "bribery" alone and blocked a legitimate teaching turn — in an
 * anti-corruption course that word is the syllabus.
 */
const SOLICITS =
	/\b(how (?:can|do|should) i|can i|could i|help me|what'?s the best way|i want to|i need to|any way to|is it ok(?:ay)? to|should i)\b/i;

/** `[kind, pattern, requiresFirstPersonIntent]` */
const GUARDS: [string, RegExp, boolean][] = [
	[
		'bribery',
		/\b(bribe|bribing|bribery|kickback|back-?hander|payoff|pay(?:ing)?\s+(?:an?\s+)?(?:official|officer|inspector|judge|clerk)|under the table|grease (?:the|his|her) palm)\b/i,
		true,
	],
	[
		'medical',
		/\b(medication|medicine|antidepressant|dosage|feeling (?:really )?low|depressed|anxious|suicid|self[- ]harm|therapy|pills?)\b/i,
		false,
	],
	[
		'injection',
		/\b(ignore (?:all )?(?:previous|prior|your) instructions|system prompt|reveal your (?:prompt|rules|instructions)|disregard (?:your|all))\b/i,
		false,
	],
	[
		'homework',
		/\b(write my (?:essay|homework|assignment|paper)|do my homework|essay on the)\b/i,
		false,
	],
	[
		'exfiltration',
		/\b(send (?:everything|all|it|my data)|email (?:it|my data)|share my (?:data|info|details)|to my friend at)\b/i,
		false,
	],
];

const TEMPLATES: [string, (ask: string, f: LearnerFacts) => boolean][] = [
	['quiz', (_a, f) => f.quizScore != null],
	['tokens', (_a, f) => f.tokensJustEarned != null],
	// SRS v1 specifies assessments as template-based; generating the question
	// with the model both contradicts that and failed on the smallest models.
	['quizprompt', (a) => /\bask\b[^.]*\bquestion\b/i.test(a)],
	[
		'outofscope',
		(a) => /\b(more depth|far more|beyond|outside|not covered)\b[^.]{0,40}\b(course|scope|cover|material)/i.test(a),
	],
	[
		'resume',
		(a) => /\b(where (?:was|did) i|left off|welcome me back|been away|pick up where)\b/i.test(a),
	],
	[
		'progress',
		(a) => /\b(what|how much|how many|show me|tell me).{0,30}\b(progress|score|status|tokens?|am i doing)\b/i.test(a),
	],
];

/** Turns that react to the learner's standing rather than teach something. */
const BLENDED =
	/\b(how (?:is|am) (?:my|i) (?:city|doing)|react to|my city|city doing|encourage me|how'?s my city)\b/i;

export function classify(ask: string, facts: LearnerFacts): Route {
	for (const [kind, pattern, needsIntent] of GUARDS) {
		if (!pattern.test(ask)) continue;
		if (needsIntent && !SOLICITS.test(ask)) continue; // teaching about it, not asking for it
		return { mode: 'guard', kind };
	}
	for (const [kind, test] of TEMPLATES) {
		if (test(ask, facts)) return { mode: 'template', kind };
	}
	if (BLENDED.test(ask)) return { mode: 'blended', kind: 'city' };
	return { mode: 'text', kind: 'teach' };
}
