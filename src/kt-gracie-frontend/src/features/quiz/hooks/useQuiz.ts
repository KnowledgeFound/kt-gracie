import { useState, useEffect } from 'react';
import type { Question, UserAnswer, QuizScreen } from '../types';
import { shuffleArray, calcScore } from '../utils';
import { QUIZ_QUESTION_COUNT } from '../constants';
import { useUser } from '@/features/auth';
import { useSubjectById } from '@/features/subject';
import data from '@/lib/gracie-qa-corpus.json';

/**
 * Core quiz state machine.
 *
 * @param subjectId  Optional route param from /quiz/:id.
 *                   When provided, the subject is fetched and shown on the
 *                   welcome screen. Questions are still drawn from the local
 *                   corpus and shuffled randomly — subject context is display-only
 *                   until the backend serves per-subject questions.
 */
export function useQuiz(subjectId?: string) {
	const { updateProgression, user } = useUser();

	// Fetch the subject when an id is present — skip otherwise
	const subjectQuery = useSubjectById(subjectId);

	const [screen, setScreen] = useState<QuizScreen>('welcome');
	const [questions, setQuestions] = useState<Question[]>([]);
	const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
	const [score, setScore] = useState(0);
	const [reviewIndex, setReviewIndex] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		try {
			setQuestions(data.questions as Question[]);
		} catch (err) {
			console.error('Failed to load quiz questions:', err);
		} finally {
			setLoading(false);
		}
	}, []);

	const startQuiz = () => {
		if (questions.length === 0) return;
		// Always shuffle so every session is different
		const selected = shuffleArray(questions).slice(0, QUIZ_QUESTION_COUNT);
		setQuizQuestions(selected);
		setUserAnswers(new Array(selected.length).fill(null));
		setCurrentIndex(0);
		setScore(0);
		setScreen('quiz');
	};

	const selectOption = (value: UserAnswer) => {
		setUserAnswers((prev) => {
			const next = [...prev];
			next[currentIndex] = value;
			return next;
		});
	};

	const nextQuestion = () => {
		if (currentIndex === quizQuestions.length - 1) {
			submitQuiz();
		} else {
			setCurrentIndex((i) => i + 1);
		}
	};

	const previousQuestion = () => {
		if (currentIndex > 0) setCurrentIndex((i) => i - 1);
	};

	const submitQuiz = () => {
		const finalScore = calcScore(quizQuestions, userAnswers);
		setScore(finalScore);
		setScreen('results');

		if (user) {
			const prev = user.progression;
			updateProgression({
				quizzesCompleted: prev.quizzesCompleted + 1,
				totalCorrect: prev.totalCorrect + finalScore,
				totalAnswered: prev.totalAnswered + quizQuestions.length,
				highScore: Math.max(prev.highScore, finalScore),
			});
		}
	};

	const retakeQuiz = () => {
		setScreen('welcome');
		setCurrentIndex(0);
		setUserAnswers([]);
		setScore(0);
	};

	const viewAnswers = () => {
		setReviewIndex(0);
		setScreen('explanation');
	};

	const nextExplanation = () => {
		if (reviewIndex < quizQuestions.length - 1) {
			setReviewIndex((i) => i + 1);
		} else {
			setScreen('results');
		}
	};

	const previousExplanation = () => {
		if (reviewIndex > 0) setReviewIndex((i) => i - 1);
	};

	return {
		// quiz state
		screen,
		loading: loading || subjectQuery.isLoading,
		score,
		currentIndex,
		reviewIndex,
		quizQuestions,
		userAnswers,
		currentQuestion:  quizQuestions[currentIndex]  ?? null,
		reviewQuestion:   quizQuestions[reviewIndex]   ?? null,
		// subject context (null when no subjectId given)
		subject:          subjectQuery.data ?? null,
		subjectLoading:   subjectQuery.isLoading,
		// actions
		startQuiz,
		selectOption,
		nextQuestion,
		previousQuestion,
		retakeQuiz,
		viewAnswers,
		nextExplanation,
		previousExplanation,
		backToResults: () => setScreen('results'),
	};
}
