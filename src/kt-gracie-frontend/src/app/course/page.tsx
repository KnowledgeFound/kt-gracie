import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { AssessmentType } from '@/ENUMS/enums';
import { QuizScreen, ResultsScreen } from '@/features/quiz';
import { GracieChat, GracieFeedback } from '@/features/gracie-ai';
import {
	CourseHeader,
	FlashcardsScreen,
	LessonScreen,
	SummaryScreen,
	WelcomeScreen,
	useCourse,
} from '@/features/course';
import type { Module } from '@/features/city/types';
import { getAllModules } from '@/services/corpusService';

/**
 * Course route — /course/:moduleId
 *
 * Learn (lesson sections) → check (quiz, then explanations) → recall
 * (flashcards) → summary. Progress is saved after every step, so opening the
 * same module again continues where the learner left off.
 */
export default function CoursePage() {
	const { moduleId } = useParams<{ moduleId: string }>();
	const course = useCourse(moduleId);
	const [nextModule, setNextModule] = useState<Module | null>(null);
	const [chatOpen, setChatOpen] = useState(false);

	useEffect(() => {
		if (!course.module) return;
		getAllModules()
			.then((all) =>
				setNextModule(all.find((m) => m.id === course.module!.id + 1) ?? null),
			)
			.catch(() => setNextModule(null));
	}, [course.module]);

	if (course.loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-surface-page">
				<p className="text-xl font-bold text-brand-600 animate-pulse">
					Loading…
				</p>
			</div>
		);
	}

	if (!course.module) {
		return (
			<div className="flex min-h-screen w-full items-center justify-center p-4">
				<div className="rounded-2xl border border-red-200/50 bg-white/80 p-6 text-center shadow-xl">
					<p className="text-base font-semibold text-gray-800">
						Something went wrong
					</p>
					<p className="mt-1 text-sm text-gray-500">
						Failed to fetch Module Data
					</p>
				</div>
			</div>
		);
	}

	const { module, activity, screen } = course;
	const fullScreen =
		screen === 'quiz' || screen === 'results' || screen === 'welcome';
	const lastActivity = course.activityIndex >= course.activities.length - 1;

	return (
		<div
			className="min-h-screen relative overflow-hidden bg-surface-page bg-cover bg-center bg-fixed"
			style={
				module.image ? { backgroundImage: `url(${module.image})` } : undefined
			}
		>
			{/* Module artwork behind every step; the scrim keeps the cards readable */}
			<div className="fixed inset-0 bg-black/25 backdrop-blur-[2px] pointer-events-none" />
			<div className="relative z-10">
				{!fullScreen && (
					<CourseHeader
						title={
							activity && screen !== 'summary'
								? `${module.name}: ${activity.title}`
								: module.name
						}
						mode={screen === 'flashcards' ? 'practice' : 'lesson'}
						activities={course.activities}
						onLesson={() => course.goToType(AssessmentType.TEACHING)}
						onPractice={course.goToType}
					/>
				)}

				{/* {screen === 'results' && (
					<div className="mx-auto max-w-3xl px-4 pb-10">
						<GracieFeedback
							title="Gracie's read"
							ask={`I scored ${course.score} out of ${course.quizQuestions.length} on the quiz.`}
							facts={{
								quizScore: course.score,
								quizTotal: course.quizQuestions.length,
							}}
						/>
					</div>
				)} */}
				<AnimatePresence mode="wait">
					{screen === 'welcome' && (
						<WelcomeScreen
							key="welcome"
							module={module}
							activities={course.activities}
							isDone={course.isDone}
							percent={course.percent}
							onStart={course.goToActivity}
						/>
					)}

					{screen === 'lesson' && activity && (
						<LessonScreen
							key={`lesson-${activity.id}`}
							teaching={activity}
							sections={course.sections}
							sectionIndex={course.sectionIndex}
							activities={course.activities}
							activityIndex={course.activityIndex}
							isDone={course.isDone}
							onSection={course.goToSection}
							onContinue={course.continueLesson}
							onActivity={course.goToActivity}
							onAsk={() => setChatOpen(true)}
							isLastSection={course.sectionIndex >= course.sections.length - 1}
							watched={course.watched}
							onWatched={course.markWatched}
						/>
					)}

					{screen === 'quiz' && course.quizQuestions[course.questionIndex] && (
						<QuizScreen
							key={`quiz-${course.questionIndex}`}
							question={course.quizQuestions[course.questionIndex]}
							currentIndex={course.questionIndex}
							totalQuestions={course.quizQuestions.length}
							selectedAnswer={course.answers[course.questionIndex] ?? null}
							onSelectOption={course.selectOption}
							onPrevious={course.previousQuestion}
							onNext={course.nextQuestion}
							canGoPrevious={course.questionIndex > 0}
							onQuit={course.openWelcome}
							score={course.score}
							elapsed={course.elapsed}
							module={module}
						/>
					)}

					{screen === 'results' && (
						<ResultsScreen
							key="results"
							score={course.score}
							totalQuestions={course.quizQuestions.length}
							questions={course.quizQuestions}
							userAnswers={course.answers}
							tokensEarned={course.tokensEarned}
							ktMax={activity?.ktMax}
							ktCredited={course.tokensCredited}
							onRetake={course.retakeQuiz}
							timeTaken={course.elapsed}
							module={module}
							onContinue={lastActivity ? undefined : course.nextActivity}
							continueLabel="Continue"
						/>
					)}

					{screen === 'flashcards' && activity && (
						<FlashcardsScreen
							key={`cards-${activity.id}`}
							cards={activity.cards}
							index={course.cardIndex}
							onIndex={course.goToCard}
							onFinish={course.finishFlashcards}
						/>
					)}

					{screen === 'summary' && (
						<SummaryScreen
							key="summary"
							module={module}
							activities={course.activities}
							isDone={course.isDone}
							percent={course.percent}
							nextModule={nextModule}
							onOpen={course.goToActivity}
							onChoose={course.openWelcome}
						/>
					)}
				</AnimatePresence>
			</div>

			<GracieChat open={chatOpen} onClose={() => setChatOpen(false)} />
		</div>
	);
}
