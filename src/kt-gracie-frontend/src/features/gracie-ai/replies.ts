import type { LearnerFacts } from './types';

/**
 * Every reply that does not come from the model.
 *
 * These are not fallbacks bolted on around a model — they are the primary
 * answer for anything factual or unsafe. The model is never asked a question
 * whose answer the app already holds.
 */

const remaining = (f: LearnerFacts) => f.modulesTotal - f.modulesDone;

function tail(f: LearnerFacts): string {
	const left = remaining(f);
	if (left <= 0) return 'every module done';
	if (left === 1) return 'one module to go';
	return `${left} modules to go`;
}

/** The factual half of a blended reply. Always true, never model-written. */
export function leadSentence(f: LearnerFacts): string {
	return `${f.name}, your City Score is ${f.score} of 100 — the ${f.band} band — with ${tail(f)}.`;
}

/** Scripted copy for robot mode, and the fallback whenever the model is unusable. */
export function scriptedReply(f: LearnerFacts): string {
	const left = remaining(f);
	if (left <= 0) return `${leadSentence(f)} You have finished the set — take a look at your city.`;
	if (f.score >= 50) return `${leadSentence(f)} Keep going while you are ahead.`;
	return `${leadSentence(f)} Finish the next assessment to push it higher.`;
}

export function guardReply(kind: string, f: LearnerFacts): string {
	const n = f.name;
	switch (kind) {
		case 'bribery':
			return `${n}, I can't help with that — paying an official to move a decision is bribery, and it is exactly what this city is rebuilding away from. Open the module on public integrity to see how these arrangements get caught.`;
		case 'medical':
			return `${n}, I can't help with that one — I am a learning guide, not a health service. Please talk to someone you trust or a qualified professional, and I will be right here when you want to pick the course back up.`;
		case 'injection':
			return `${n}, that is not something I can do. I am here to walk you through the anti-corruption material — shall we pick up where you left off?`;
		case 'homework':
			return `${n}, writing your essay is not something I can do — that work is yours. If you want, we can look instead at how corruption shaped a real reform, and you can take it from there.`;
		case 'exfiltration':
			return `${n}, I can't do that — everything I know about you stays on your device, and I have no way to pass it to anyone else. Ask me about the course any time.`;
		default:
			return `${n}, that is not something I can help with here.`;
	}
}

export function templateReply(kind: string, f: LearnerFacts): string | null {
	const n = f.name;
	switch (kind) {
		case 'quiz': {
			if (f.quizScore == null || f.quizTotal == null) return null;
			const strong = f.quizScore / f.quizTotal >= 0.6;
			return strong
				? `${n}, you scored ${f.quizScore} out of ${f.quizTotal} on that quiz — a strong result. Carry it straight into the next module.`
				: `${n}, you scored ${f.quizScore} out of ${f.quizTotal} on that quiz. Let's go back over the parts that caught you out before moving on.`;
		}
		case 'tokens':
			if (f.tokensJustEarned == null) return null;
			return `${n}, you just earned ${f.tokensJustEarned} Knowledge Tokens, taking your balance to ${f.tokens}. Keep finishing assessments to earn more.`;
		case 'quizprompt':
			return `${n}, quick check before we move on: a supplier offers a council officer match tickets a week before a contract is awarded. Is that a bribe, and what would you need to know to be sure?`;
		case 'outofscope':
			return `${n}, that goes deeper than this course covers. The NotebookLM material for this subject has the full treatment — work through it there and bring any questions back to me.`;
		case 'resume':
			return f.lastModule
				? `${n}, welcome back. You left off at ${f.lastModule}, and your City Score is ${f.score} of 100 — the ${f.band} band — with ${tail(f)}.`
				: `${n}, welcome back. Your City Score is ${f.score} of 100 — the ${f.band} band — with ${tail(f)}.`;
		case 'progress':
			return `${n}, you have finished ${f.modulesDone} of ${f.modulesTotal} modules and your City Score is ${f.score} of 100 — the ${f.band} band. You are holding ${f.tokens} Knowledge Tokens.`;
		default:
			return null;
	}
}
