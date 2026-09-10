import { useState, useEffect, useRef, useCallback } from 'react';
import type { Question, UserAnswer, QuizScreen } from '../types';
import { shuffleArray } from '../utils';
import { QUIZ_QUESTION_COUNT } from '../constants';
import { useUser } from '@/features/auth';
import { useSubjectById } from '@/features/subject';
import { getModule } from '@/features/city/constants';
import type { Module } from '@/features/city/types';
import data from '@/lib/gracie-qa-corpus.json';

/**
 * Core quiz state machine.
 *
 * @param moduleId  Optional route param from /quiz/:id.
 *                  When provided, the module is looked up from city constants
 *                  and passed to WelcomeScreen for dynamic content.
 *                  The subject is also fetched from the backend (display-only
 *                  until per-module questions are served).
 */
export function useQuiz(moduleId?: string) {

	// Numeric module id
	const numericId = moduleId ? Number(moduleId) : undefined;

	// Rich module data from city constants (objectives, assessments, progress)
	const module: Module | null = numericId ? (getModule(numericId) ?? null) : null;

	// Backend subject fetch (display-only for now)
	const subjectQuery = useSubjectById(moduleId);

	// ── Question state ──────────────────────────────────────────────
	const [screen, setScreen]               = useState<QuizScreen>('welcome');
	const [questions, setQuestions]         = useState<Question[]>([]);
	const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
	const [currentIndex, setCurrentIndex]   = useState(0);
	const [userAnswers, setUserAnswers]     = useState<UserAnswer[]>([]);
	const [reviewIndex, setReviewIndex]     = useState(0);
	const [loading, setLoading]             = useState(true);

	// Derived live score — count of answered questions that match correctAnswer
	const score = quizQuestions.reduce(
		(acc, q, i) => (userAnswers[i] === q.correctAnswer ? acc + 1 : acc),
		0,
	);

	// ── Timer state ─────────────────────────────────────────────────
	const [elapsed, setElapsed] = useState(0);      // seconds ticked up
	const [timeTaken, setTimeTaken] = useState(0);  // frozen at submit
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const startTimer = useCallback(() => {
		setElapsed(0);
		if (timerRef.current) clearInterval(timerRef.current);
		timerRef.current = setInterval(() => {
			setElapsed(s => s + 1);
		}, 1000);
	}, []);

	const stopTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	// Clean up on unmount
	useEffect(() => () => stopTimer(), [stopTimer]);

	// ── Load corpus ─────────────────────────────────────────────────
	useEffect(() => {
		try {
			setQuestions(data.questions as Question[]);
		} catch (err) {
			console.error('Failed to load quiz questions:', err);
		} finally {
			setLoading(false);
		}
	}, []);

	// ── Actions ─────────────────────────────────────────────────────

	const startQuiz = () => {
		if (questions.length === 0) return;
		const selected = shuffleArray(questions).slice(0, QUIZ_QUESTION_COUNT);
		setQuizQuestions(selected);
		setUserAnswers(new Array(selected.length).fill(null));
		setCurrentIndex(0);
		setScreen('quiz');
		startTimer();
	};

	const selectOption = (value: UserAnswer) => {
		setUserAnswers(prev => {
			const next = [...prev];
			next[currentIndex] = value;
			return next;
		});
	};

	const nextQuestion = () => {
		if (currentIndex === quizQuestions.length - 1) {
			submitQuiz();
		} else {
			setCurrentIndex(i => i + 1);
		}
	};

	const previousQuestion = () => {
		if (currentIndex > 0) setCurrentIndex(i => i - 1);
	};

	const submitQuiz = () => {
		stopTimer();
		setTimeTaken(elapsed);
		setScreen('results');
	};

	const retakeQuiz = () => {
		stopTimer();
		setScreen('welcome');
		setCurrentIndex(0);
		setUserAnswers([]);
		setElapsed(0);
		setTimeTaken(0);
	};

	const viewAnswers = () => {
		setReviewIndex(0);
		setScreen('explanation');
	};

	const nextExplanation = () => {
		if (reviewIndex < quizQuestions.length - 1) {
			setReviewIndex(i => i + 1);
		} else {
			setScreen('results');
		}
	};

	const previousExplanation = () => {
		if (reviewIndex > 0) setReviewIndex(i => i - 1);
	};

	return {
		// screens
		screen,
		loading: loading || subjectQuery.isLoading,
		// score / answers
		score,
		currentIndex,
		reviewIndex,
		quizQuestions,
		userAnswers,
		currentQuestion:  quizQuestions[currentIndex] ?? null,
		reviewQuestion:   quizQuestions[reviewIndex]  ?? null,
		// timer
		elapsed,      // live seconds — use in QuizScreen
		timeTaken,    // frozen value — use in ResultsScreen
		// module / subject context
		module,
		subject:        subjectQuery.data ?? null,
		subjectLoading: subjectQuery.isLoading,
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
