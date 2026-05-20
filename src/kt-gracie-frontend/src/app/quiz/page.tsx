import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
	useQuiz,
	WelcomeScreen,
	QuizScreen,
	ResultsScreen,
	ExplanationScreen,
} from '@/features/quiz';
import { Button } from '@/components/ui';

/**
 * Quiz route — thin page wrapper.
 * All state and logic lives in useQuiz(); this file only wires props.
 */
export default function QuizPage() {
	const navigate = useNavigate();
	const quiz = useQuiz();

	if (quiz.loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-gray-100">
				<p className="text-2xl font-bold text-indigo-600 animate-pulse">
					Loading questions…
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-gray-100 relative overflow-hidden">
			{/* Decorative background blobs */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-float" />
				<div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-float-reverse" />
				<div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-float-slow" />
			</div>

			<div className="relative z-10">
				{/* Quit button — only visible during an active quiz */}
				{quiz.screen !== 'welcome' && (
					<div className="absolute top-4 right-4 z-50">
						<Button variant="danger" size="sm" onClick={() => navigate('/')}>
							✕ Quit
						</Button>
					</div>
				)}

				<AnimatePresence mode="wait">
					{quiz.screen === 'welcome' && (
						<WelcomeScreen key="welcome" onStart={quiz.startQuiz} />
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
						/>
					)}

					{quiz.screen === 'results' && (
						<ResultsScreen
							key="results"
							score={quiz.score}
							totalQuestions={quiz.quizQuestions.length}
							onRetake={quiz.retakeQuiz}
							onReview={quiz.viewAnswers}
						/>
					)}

					{quiz.screen === 'explanation' && quiz.reviewQuestion && (
						<ExplanationScreen
							key="explanation"
							question={quiz.reviewQuestion}
							userAnswer={quiz.userAnswers[quiz.reviewIndex] ?? null}
							correctAnswer={quiz.reviewQuestion.correctAnswer}
							currentIndex={quiz.reviewIndex}
							totalQuestions={quiz.quizQuestions.length}
							onPrevious={quiz.previousExplanation}
							onNext={quiz.nextExplanation}
							onBack={quiz.backToResults}
						/>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
