import { AnimatePresence } from 'framer-motion';
import {
	useQuiz,
	WelcomeScreen,
	QuizScreen,
	ResultsScreen,
	ExplanationScreen,
} from '@/features/quiz';
import { MainLayout } from '@/components/layout';

/**
 * Quiz route — thin page wrapper.
 * All state and logic lives in useQuiz(); this file only wires props.
 */
export default function QuizPage() {
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
		<MainLayout>
			<div className="h-full w-full relative overflow-hidden">
				<div className="relative z-10">
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
		</MainLayout>
	);
}
