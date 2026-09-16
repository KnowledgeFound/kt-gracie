import { classify } from './classify';
import { engineLoaded, generate } from './engine';
import { blendedMessages, textMessages } from './prompts';
import { guardReply, leadSentence, scriptedReply, templateReply } from './replies';
import { shapeReply, usableNudge } from './shape';
import type { GracieMode, GracieReply, LearnerFacts } from './types';

/**
 * Answers one learner turn.
 *
 * The order here is the whole design: classify first, answer from data or a
 * guard where possible, and only reach the model for the turns where wording
 * is the actual work. Anything the model returns is then shaped, and rejected
 * back to scripted copy if it strayed.
 */
export async function askGracie(
	ask: string,
	facts: LearnerFacts,
	opts: { mode: GracieMode; onToken?: (soFar: string) => void } = { mode: 'robot' },
): Promise<GracieReply> {
	const route = classify(ask, facts);

	if (route.mode === 'guard') {
		return { text: guardReply(route.kind, facts), source: 'guard', route: `guard:${route.kind}` };
	}

	if (route.mode === 'template') {
		const text = templateReply(route.kind, facts);
		if (text) return { text, source: 'data', route: `template:${route.kind}` };
	}

	const canGenerate = opts.mode === 'intelligence' && engineLoaded();
	if (!canGenerate) {
		return {
			text:
				route.mode === 'text'
					? scriptedDeflection(facts, opts.mode === 'intelligence')
					: scriptedReply(facts),
			source: 'scripted',
			route: `${route.mode}:scripted`,
		};
	}

	if (route.mode === 'blended') {
		const lead = leadSentence(facts);
		const out = await generate(blendedMessages(facts), {
			maxTokens: 60,
			onToken: (soFar) => opts.onToken?.(`${lead} ${soFar}`),
		});
		const nudge = usableNudge(out.text, facts.name);
		if (!nudge) {
			return { text: scriptedReply(facts), source: 'scripted', route: 'blended:rejected' };
		}
		return {
			text: `${lead} ${nudge}`,
			source: 'blended',
			route: 'blended:city',
			elapsedMs: out.elapsedMs,
			tokensPerSecond: out.tokensPerSecond ?? undefined,
		};
	}

	const out = await generate(textMessages(ask, facts), {
		maxTokens: 96,
		onToken: opts.onToken,
	});
	const text = shapeReply(out.text, { name: facts.name, maxSentences: 3 });
	if (!text) {
		return { text: scriptedDeflection(facts, true), source: 'scripted', route: 'text:empty' };
	}
	return {
		text,
		source: 'model',
		route: 'text:teach',
		elapsedMs: out.elapsedMs,
		tokensPerSecond: out.tokensPerSecond ?? undefined,
	};
}

/**
 * What Gracie says to an open question she cannot generate an answer to. She
 * says plainly why rather than improvising — and the two reasons are different
 * enough that telling a learner in Intelligence mode they are "in Robot mode"
 * would simply be wrong.
 */
function scriptedDeflection(f: LearnerFacts, intelligenceOn: boolean): string {
	return intelligenceOn
		? `${f.name}, my brain isn't loaded yet, so I can't talk that one through. Give it a moment and ask me again, or open the module material for the answer.`
		: `${f.name}, I can't talk that one through in Robot mode. Open the module material for the answer, or switch on Intelligence mode in Settings and ask me again.`;
}
