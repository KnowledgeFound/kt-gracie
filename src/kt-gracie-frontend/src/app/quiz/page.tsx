import { AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import {
	useQuiz,
	WelcomeScreen,
	QuizScreen,
	ResultsScreen,
} from '@/features/quiz';

/**
 * Quiz route — /quiz/:id
 *
 * When :id is present the quiz is launched in the context of a module:
 *   - Module data (name, objectives, assessments, progress) comes from city constants
 *   - Questions are randomly drawn from the local corpus
 *
 * When there is no :id (standalone quiz) the welcome screen shows generic branding.
 */
export default function QuizPage() {
	const { id } = useParams<{ id: string }>();
	const quiz = useQuiz(id);

	if (quiz.loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-surface-page">
				<p className="text-xl font-bold text-brand-600 animate-pulse">Loading…</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-surface-page relative overflow-hidden">
			{/* Decorative blobs */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-0 left-0 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl animate-float" />
				<div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-100/20 rounded-full blur-3xl animate-float-reverse" />
				<div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-float-slow" />
			</div>

			<div className="relative z-10">
				<AnimatePresence mode="wait">
					{quiz.screen === 'welcome' && (
						<WelcomeScreen
							key="welcome"
							onStart={quiz.startQuiz}
							module={quiz.module}
						/>
					)}

					{quiz.screen === 'quiz' && quiz.currentQuestion && (
						<QuizScreen
							key="quiz"
							question={quiz.currentQuestion}
							currentIndex={quiz.currentIndex}
							totalQuestions={quiz.quizQuestions.length}
							selectedAnswer={quiz.userAnswers[quiz.currentIndex] ?? null}
							onSelectOption={quiz.selectOption}
							onPrevious={quiz.previousQuestion}
							onNext={quiz.nextQuestion}
							canGoPrevious={quiz.currentIndex > 0}
							score={quiz.score}
							elapsed={quiz.elapsed}
						/>
					)}

					{(quiz.screen === 'results' || quiz.screen === 'explanation') && (
						<ResultsScreen
							key="results"
							score={quiz.score}
							totalQuestions={quiz.quizQuestions.length}
							questions={quiz.quizQuestions}
							userAnswers={quiz.userAnswers}
							onRetake={quiz.retakeQuiz}
							timeTaken={quiz.timeTaken}
						/>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
