/** Fisher-Yates shuffle — returns a new array, does not mutate the input. */
export function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

export function calcScore(
	questions: { correctAnswer: string | boolean }[],
	answers: (string | boolean | null)[],
): number {
	return questions.reduce(
		(acc, q, i) => (answers[i] === q.correctAnswer ? acc + 1 : acc),
		0,
	);
}
