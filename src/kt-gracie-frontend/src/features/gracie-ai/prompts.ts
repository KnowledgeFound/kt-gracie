import type { LearnerFacts } from './types';

/**
 * Prompts for the two branches the model actually handles.
 *
 * Two rules here were bought with measurements rather than taste:
 *
 *  1. The model is never shown the word "health". Every candidate model read
 *     "city health" as *medical* health and started prescribing exercise and
 *     stress management. The learner-facing UI can say City Health; the prompt
 *     says City Score.
 *  2. On the blended branch the model never sees a number. Left to describe a
 *     score, small models invert it — "37 shows your city is in good shape".
 *     It is told only the mood, and writes the closing sentence.
 */

const GAME =
	'GRACIE is a city-building learning game about anti-corruption, using official UNODC ' +
	'material. The learner rebuilds a virtual city by finishing lessons and assessments. ' +
	'City Score is a statistic about that virtual city only.';

const BAN =
	'Never mention health, illness, doctors, medical care, diet, nutrition, exercise or ' +
	"wellbeing. This is not about anyone's body.";

export interface ChatMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

/** Stops the model continuing into a replay of its own context. */
export const STOP = ['\nLearner:', 'Learner:', '\nCity Score:', 'City Score:', '\nGracie:'];

export function moodOf(score: number): string {
	if (score >= 50) return 'The learner is doing well; be congratulatory.';
	if (score >= 40) return 'The learner is midway; be steady and matter-of-fact.';
	return 'The learner is struggling; be supportive and gentle, never celebratory.';
}

/** Asks only for the closing encouragement — the app supplies every fact. */
export function blendedMessages(f: LearnerFacts): ChatMessage[] {
	return [
		{
			role: 'system',
			content:
				`You are Gracie, a guide in GRACIE. ${GAME} ${BAN}\n` +
				'Write ONE short encouraging sentence telling the learner what to do next. ' +
				'Never mention a number, a score, a band, or how many modules remain — those are ' +
				'shown separately. Do not greet them. Do not restate the question.',
		},
		{ role: 'user', content: `${moodOf(30)}\nWrite only the encouragement sentence.` },
		{ role: 'assistant', content: 'Take the next assessment and start turning it around.' },
		{ role: 'user', content: `${moodOf(88)}\nWrite only the encouragement sentence.` },
		{ role: 'assistant', content: 'Finish the set while you are on a roll.' },
		{ role: 'user', content: `${moodOf(f.score)}\nWrite only the encouragement sentence.` },
	];
}

/** Teaching and explaining, where the model does the real work. */
export function textMessages(ask: string, f: LearnerFacts, maxSentences = 3): ChatMessage[] {
	const subject = f.subject ?? 'the United Nations Convention against Corruption';
	return [
		{
			role: 'system',
			content:
				`You are Gracie, a guide in GRACIE. ${GAME} ${BAN}\n` +
				`The learner is currently studying: ${subject}.\n` +
				`Speak directly to the learner as "you". Write at most ${maxSentences} short sentences, then stop. ` +
				'Never restate the question. Do not invent statistics, dates or case details. ' +
				'If something is outside the course, say so and point to the NotebookLM material.',
		},
		{
			role: 'user',
			content: 'What does transparency actually mean in public procurement?',
		},
		{
			role: 'assistant',
			content:
				'It means the decisions and the reasons behind them are visible to people outside the room — who bid, what they offered, and why one was chosen. Where that record is missing, favours are very hard to spot after the fact.',
		},
		{ role: 'user', content: ask },
	];
}
