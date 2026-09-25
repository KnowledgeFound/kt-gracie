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
