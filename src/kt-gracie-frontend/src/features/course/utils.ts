import type { MCQQuestion } from '@/features/quiz';
import type { QuizQuestion } from '@/types/types';

/**
 * Adapt a corpus question to the shape the quiz screens render. The corpus
 * carries no explanation, so it is built from the correct option plus the
 * question's hint.
 */
export function toQuizQuestion(q: QuizQuestion, index: number): MCQQuestion {
	const correct = q.options[q.correctAnswerIndex] ?? '';
	const explanation = [`The correct answer is “${correct}”.`, q.hint].filter(Boolean).join(' ');

	return {
		id: index + 1,
		type: 'mcq',
		question: q.questionText,
		options: q.options,
		correctAnswer: String.fromCharCode(65 + q.correctAnswerIndex),
		explanation,
	};
}

/**
 * An absolute `https://` link for a corpus URL, or null when there is nothing
 * usable. Corpus entries are authored by hand, so a link can arrive bare
 * ("www.unodc.org/…") or protocol-relative ("//unodc.org/…") — rendered as-is
 * those resolve against the app's own origin and 404. Anything that is not a
 * web address (a `javascript:` payload, say) is dropped rather than linked.
 */
export function absoluteUrl(url: string | undefined | null): string | null {
	const raw = url?.trim();
	if (!raw) return null;

	const candidate = raw.startsWith('//')
		? `https:${raw}`
		: /^[a-z][a-z0-9+.-]*:/i.test(raw)
			? raw
			: `https://${raw}`;

	try {
		const parsed = new URL(candidate);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:'
			? parsed.toString()
			: null;
	} catch {
		return null;
	}
}

/** Flatten lesson markdown to plain text a speech synthesiser can read. */
export function markdownToSpeech(md: string): string {
	return md
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/^#{1,3}\s*/gm, '')
		.replace(/^>\s?/gm, '')
		.replace(/^[-*]\s+/gm, '')
		.replace(/\*\*?([^*]+)\*\*?/g, '$1')
		.replace(/\n{2,}/g, '. \n')
		.replace(/\s+/g, ' ')
		.replace(/\.\s*\./g, '.')
		.trim();
}

/**
 * Where Continue goes from section `index`, once that section counts as done
 * (`completed` must already include it). Reading runs front to back, so the
 * next section comes first; from the last section anything skipped along the
 * way (via the outline) is still owed, so the learner is sent back to the first
 * such section. `null` means nothing is left: the lesson is finished.
 */
export function nextLessonStep(
	sections: { id: string }[],
	completed: string[],
	index: number,
): number | null {
	if (index < sections.length - 1) return index + 1;
	const skipped = sections.findIndex((s) => !completed.includes(s.id));
	return skipped >= 0 ? skipped : null;
}

/**
 * Whether pressing Continue on section `index` would finish the lesson — i.e.
 * it is the last section and every other one is already done. The button reads
 * "Finish lesson" only then; otherwise it reads "Continue" and moves on.
 */
export function isFinalLessonStep(
	sections: { id: string }[],
	completed: string[],
	index: number,
): boolean {
	const current = sections[index];
	if (!current) return false;
	return nextLessonStep(sections, [...completed, current.id], index) === null;
}
