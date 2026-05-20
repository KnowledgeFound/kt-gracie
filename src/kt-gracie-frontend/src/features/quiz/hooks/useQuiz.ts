import { useState, useEffect } from 'react';
import type { Question, UserAnswer, QuizScreen } from '../types';
import { shuffleArray, calcScore } from '../utils';
import { QUIZ_QUESTION_COUNT } from '../constants';
import data from '@/lib/gracie-qa-corpus.json';

export function useQuiz() {
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
		const selected = shuffleArray(questions).slice(0, QUIZ_QUESTION_COUNT);
		// Set all derived state before switching screen so the first render
		// after setScreen('quiz') always has a valid currentQuestion.
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
		setScore(calcScore(quizQuestions, userAnswers));
		setScreen('results');
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
		// state
		screen,
		loading,
		score,
		currentIndex,
		reviewIndex,
		quizQuestions,
		userAnswers,
		currentQuestion: quizQuestions[currentIndex] ?? null,
		reviewQuestion: quizQuestions[reviewIndex] ?? null,
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
