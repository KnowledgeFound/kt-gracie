import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AssessmentType } from '@/ENUMS/enums';
import { useUser } from '@/features/auth';
import type { Module, ModuleAssessment } from '@/features/city/types';
import type { MCQQuestion, UserAnswer } from '@/features/quiz';
import { getModule } from '@/services/corpusService';
import { getLessonSections } from '@/services/lessonContentService';
import {
	getProgressFromContainer,
	getResume,
	isAssessmentCompleted,
	isTeachingCompleted,
	markAssessmentCompleted,
	markTeachingCompleted,
	saveResume,
	getUnitCompletionPercentage,
	addProgressToContainer,
	createAndPersistProgressContainer,
} from '@/services/progressContainerService';
import { createProgress } from '@/services/progressService';
import type { CourseScreen, LessonSection } from '../types';
import { toQuizQuestion } from '../utils';

/** Activity kinds the course can run, in the order the corpus sequences them. */
const PLAYABLE = new Set<AssessmentType>([
	AssessmentType.TEACHING,
	AssessmentType.QUIZ,
	AssessmentType.FLASHCARD,
	AssessmentType.SUMMARY,
]);

function isDone(kuId: string, a: ModuleAssessment): boolean {
	if (a.type === AssessmentType.TEACHING) return isTeachingCompleted(kuId, a.id);
	if (a.type === AssessmentType.SUMMARY) return false;
	return isAssessmentCompleted(kuId, a.id, a.type);
}

/**
 * Course state machine for one module: lesson → quiz (with explanations) →
 * flashcards → summary. Position is saved to the unit's progress after every
 * step, so leaving and coming back resumes at the same section / question.
 */
export function useCourse(moduleId?: string) {
	const { creditTokens, refreshCity } = useUser();

	const [module, setModule] = useState<Module | null>(null);
	const [loading, setLoading] = useState(true);

	const [activityIndex, setActivityIndex] = useState(0);
	const [sectionIndex, setSectionIndex] = useState(0);
	const [questionIndex, setQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<UserAnswer[]>([]);
	const [showResults, setShowResults] = useState(false);
	const [tokensCredited, setTokensCredited] = useState<number | null>(null);
	const [elapsed, setElapsed] = useState(0);
	const [percent, setPercent] = useState(0);
	const [watched, setWatched] = useState<string[]>([]);
	const [showWelcome, setShowWelcome] = useState(false);
	const [ready, setReady] = useState(false);

	const startedAt = useRef(Date.now());
	const hydrated = useRef(false);

	const kuId = module?.kuId ?? '';
	const activities = useMemo(
		() => (module?.assessments ?? []).filter((a) => PLAYABLE.has(a.type)),
		[module],
	);
	const activity: ModuleAssessment | null = activities[activityIndex] ?? null;

	// ── Load + hydrate ──────────────────────────────────────────────
	useEffect(() => {
		let cancelled = false;
		async function load() {
			try {
				const m = await getModule(Number(moduleId));
				if (!cancelled) setModule(m);
			} catch (err) {
				console.error('Failed to load module:', err);
				if (!cancelled) setModule(null);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [moduleId]);

	useEffect(() => {
		if (!module || hydrated.current) return;
		hydrated.current = true;

		const list = module.assessments.filter((a) => PLAYABLE.has(a.type));

		// The city page seeds progress for every unit; cover a direct visit to /course/:id.
		if (!getProgressFromContainer(module.kuId)) {
			createAndPersistProgressContainer();
			addProgressToContainer(
				createProgress(
					module.kuId,
					list
						.filter((a) => a.type === AssessmentType.QUIZ || a.type === AssessmentType.FLASHCARD)
						.map((a) => ({
							assessmentID: a.id,
							assessmentType: a.type,
							score: 0,
							maxScore: a.type === AssessmentType.QUIZ ? a.questions.length : a.cards.length,
							pointScore: 1,
							completed: false,
							ktMax: a.ktMax,
							ktEarned: 0,
						})),
					list
						.filter((a) => a.type === AssessmentType.TEACHING)
						.map((a) => ({
							teachingID: a.id,
							topic: a.title,
							difficulty: a.difficulty,
							completed: false,
							ktMax: a.ktMax,
							ktEarned: 0,
						})),
				),
			);
		}
		const resume = getResume(module.kuId);

		let idx = resume
			? list.findIndex((a) => a.id === resume.activityId && a.type === resume.activityType)
			: -1;
		if (idx < 0) idx = list.findIndex((a) => !isDone(module.kuId, a));
		if (idx < 0) idx = 0;

		setActivityIndex(idx);
		const pct = getUnitCompletionPercentage(module.kuId);
		setPercent(pct);

		// Chooser first for a brand-new learner or a finished module (review);
		// someone mid-course goes straight back to where they were.
		const hasContent = list.some((a) => a.type !== AssessmentType.SUMMARY);
		setShowWelcome(hasContent && ((!resume && pct === 0) || pct >= 100));

		if (resume && list[idx] && resume.activityId === list[idx].id) {
			setSectionIndex(resume.sectionIndex);
			setQuestionIndex(resume.questionIndex);
			setAnswers(resume.answers as UserAnswer[]);
			setWatched(resume.watched ?? []);
			// A quiz saved at its last question with every answer in was already submitted.
			const total = list[idx].questions.length;
			setShowResults(
				list[idx].type === AssessmentType.QUIZ && total > 0 && resume.questionIndex >= total,
			);
		}
		setReady(true);
	}, [module]);

	// Live timer while a quiz is being answered.
	const screen: CourseScreen = showWelcome
		? 'welcome'
		: !activity
		? 'summary'
		: activity.type === AssessmentType.TEACHING
			? 'lesson'
			: activity.type === AssessmentType.QUIZ
				? showResults
					? 'results'
					: 'quiz'
				: activity.type === AssessmentType.FLASHCARD
					? 'flashcards'
					: 'summary';

	useEffect(() => {
		if (screen !== 'quiz') return;
		const t = setInterval(() => setElapsed((s) => s + 1), 1000);
		return () => clearInterval(t);
	}, [screen]);

	// ── Derived content ─────────────────────────────────────────────
	const sections: LessonSection[] = useMemo(
		() =>
			module && activity?.type === AssessmentType.TEACHING
				? getLessonSections(module, activity)
				: [],
		[module, activity],
	);

	const quizQuestions: MCQQuestion[] = useMemo(
		() => (activity?.type === AssessmentType.QUIZ ? activity.questions.map(toQuizQuestion) : []),
		[activity],
	);

	const score = quizQuestions.reduce((n, q, i) => (answers[i] === q.correctAnswer ? n + 1 : n), 0);
	// KT this run is worth — derived from the score, so it survives a reload.
	const tokensEarned =
		activity?.type === AssessmentType.QUIZ && quizQuestions.length
			? Math.round((activity.ktMax * score) / quizQuestions.length)
			: 0;

	// ── Persistence helpers ─────────────────────────────────────────
	const persist = useCallback(
		(patch: { sectionIndex?: number; questionIndex?: number; answers?: UserAnswer[]; watched?: string[] }, a = activity) => {
			if (!a || !kuId) return;
			saveResume(kuId, { activityId: a.id, activityType: a.type, ...patch });
		},
		[activity, kuId],
	);

	const credit = (amount: number, a: ModuleAssessment) => {
		if (amount > 0) creditTokens(BigInt(amount), 'reward', `course-${kuId}-${a.type}-${a.id}`);
	};

	/** Move to another activity, resetting per-activity position. */
	const goToActivity = useCallback(
		(index: number) => {
			const next = activities[index];
			if (!next) return;
			setShowWelcome(false);
			setActivityIndex(index);
			setElapsed(0);
			setTokensCredited(null);

			// Coming back to the activity that was left half-done (e.g. quit a quiz
			// to the chooser) picks up where it stopped; anything else starts fresh.
			const saved = getResume(kuId);
			const same = saved?.activityId === next.id && saved?.activityType === next.type;
			setSectionIndex(same ? saved!.sectionIndex : 0);
			setQuestionIndex(same ? saved!.questionIndex : 0);
			setAnswers(same ? (saved!.answers as UserAnswer[]) : []);
			setWatched(same ? (saved!.watched ?? []) : []);
			setShowResults(
				same && next.type === AssessmentType.QUIZ && next.questions.length > 0 && saved!.questionIndex >= next.questions.length,
			);
			if (kuId && !same) saveResume(kuId, { activityId: next.id, activityType: next.type });
			setPercent(getUnitCompletionPercentage(kuId));
		},
		[activities, kuId],
	);

	const goToType = useCallback(
		(type: AssessmentType) => {
			const i = activities.findIndex((a) => a.type === type);
			if (i >= 0) goToActivity(i);
		},
		[activities, goToActivity],
	);

	const openWelcome = useCallback(() => setShowWelcome(true), []);

	const nextActivity = useCallback(() => {
		if (activityIndex < activities.length - 1) goToActivity(activityIndex + 1);
	}, [activityIndex, activities.length, goToActivity]);

	// ── Lesson ──────────────────────────────────────────────────────
	const goToSection = (i: number) => {
		const clamped = Math.max(0, Math.min(sections.length - 1, i));
		setSectionIndex(clamped);
		persist({ sectionIndex: clamped });
	};

	const markWatched = useCallback(
		(sectionId: string) => {
			if (watched.includes(sectionId)) return;
			const next = [...watched, sectionId];
			setWatched(next);
			persist({ watched: next });
		},
		[watched, persist],
	);

	/** Continue: next section, or finish the teaching and move on. */
	const continueLesson = () => {
		if (!activity) return;
		const current = sections[Math.min(sectionIndex, sections.length - 1)];
		if (
			current?.video &&
			current.video.required !== false &&
			!watched.includes(current.id) &&
			!isTeachingCompleted(kuId, activity.id)
		) {
			return; // compulsory video not finished yet
		}
		if (sectionIndex < sections.length - 1) {
			goToSection(sectionIndex + 1);
			return;
		}
		if (!isTeachingCompleted(kuId, activity.id)) {
			markTeachingCompleted(kuId, activity.id, activity.title, activity.ktMax);
			refreshCity();
			credit(activity.ktMax, activity);
		}
		nextActivity();
	};

	// ── Quiz ────────────────────────────────────────────────────────
	const selectOption = (value: UserAnswer) => {
		const next = [...answers];
		next[questionIndex] = value;
		setAnswers(next);
		persist({ answers: next, questionIndex });
	};

	const previousQuestion = () => {
		const i = Math.max(0, questionIndex - 1);
		setQuestionIndex(i);
		persist({ questionIndex: i });
	};

	const nextQuestion = () => {
		if (questionIndex < quizQuestions.length - 1) {
			const i = questionIndex + 1;
			setQuestionIndex(i);
			persist({ questionIndex: i });
			return;
		}
		submitQuiz();
	};

	const submitQuiz = () => {
		if (!activity) return;
		const total = quizQuestions.length;
		const earned = total ? Math.round((activity.ktMax * score) / total) : 0;
		const prior = getProgressFromContainer(kuId)?.subProgress.find(
			(s) => s.assessmentID === activity.id && s.assessmentType === AssessmentType.QUIZ,
		)?.ktEarned ?? 0;

		markAssessmentCompleted(kuId, activity.id, AssessmentType.QUIZ, score, total, earned, activity.ktMax);
		refreshCity();
		// Only pay out the improvement over the learner's best earlier run.
		credit(Math.max(0, earned - prior), activity);

		setTokensCredited(Math.max(0, earned - prior));
		setShowResults(true);
		persist({ questionIndex: total, answers });
		setPercent(getUnitCompletionPercentage(kuId));
	};

	const retakeQuiz = () => {
		setAnswers([]);
		setQuestionIndex(0);
		setShowResults(false);
		setElapsed(0);
		setTokensCredited(null);
		persist({ questionIndex: 0, answers: [] });
	};

	// ── Flashcards ──────────────────────────────────────────────────
	const goToCard = (i: number) => {
		setQuestionIndex(i);
		persist({ questionIndex: i });
	};

	const finishFlashcards = () => {
		if (!activity) return;
		const total = activity.cards.length;
		if (!isAssessmentCompleted(kuId, activity.id, AssessmentType.FLASHCARD)) {
			markAssessmentCompleted(kuId, activity.id, AssessmentType.FLASHCARD, total, total, activity.ktMax, activity.ktMax);
			credit(activity.ktMax, activity);
			refreshCity();
		}
		nextActivity();
	};

	return {
		loading: loading || (module !== null && !ready),
		showWelcome,
		openWelcome,
		watched,
		markWatched,
		module,
		activities,
		activity,
		activityIndex,
		screen,
		percent,
		isDone: (a: ModuleAssessment) => isDone(kuId, a),
		// lesson
		sections,
		sectionIndex,
		goToSection,
		continueLesson,
		// quiz
		quizQuestions,
		questionIndex,
		answers,
		score,
		elapsed,
		tokensEarned,
		tokensCredited,
		selectOption,
		nextQuestion,
		previousQuestion,
		retakeQuiz,
		// flashcards
		cardIndex: questionIndex,
		goToCard,
		finishFlashcards,
		// navigation
		goToActivity,
		goToType,
		nextActivity,
		refreshPercent: () => setPercent(getUnitCompletionPercentage(kuId)),
	};
}
