import { motion, type Variants } from 'framer-motion';
import classnames from 'classnames';
import type { Question, UserAnswer } from '../types';

interface ExplanationScreenProps {
	question: Question;
	userAnswer: UserAnswer;
	correctAnswer: UserAnswer;
	currentIndex: number;
	totalQuestions: number;
	onPrevious: () => void;
	onNext: () => void;
	onBack: () => void;
}

const containerVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, staggerChildren: 0.1, delayChildren: 0.2 },
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, x: -20 },
	visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

const ExplanationScreen = ({
	question,
	userAnswer,
	correctAnswer,
	currentIndex,
	totalQuestions,
	onPrevious,
	onNext,
	onBack,
}: ExplanationScreenProps) => {
	const typeIsMCQ = question.type === 'mcq';
	const isCorrect = userAnswer === correctAnswer;

	const userAnswerText = typeIsMCQ
		? (question.options[
				typeof userAnswer === 'string' ? userAnswer.charCodeAt(0) - 65 : -1
			] ?? '—')
		: userAnswer
			? 'True'
			: 'False';

	const correctAnswerText = typeIsMCQ
		? (question.options[
				typeof correctAnswer === 'string'
					? correctAnswer.charCodeAt(0) - 65
					: -1
			] ?? '—')
		: correctAnswer
			? 'True'
			: 'False';

	return (
		<motion.div
			className="min-h-screen flex flex-col justify-between pb-10"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			exit={{ opacity: 0 }}
		>
			{/* Header */}
			<motion.div
				className="w-full max-w-3xl mx-auto px-4 pt-8 md:pt-12"
				variants={itemVariants}
			>
				<h2 className="text-2xl md:text-3xl font-bold text-indigo-600 mb-6">
					Question {currentIndex + 1} of {totalQuestions}
				</h2>
			</motion.div>

			{/* Card */}
			<motion.div className="w-full max-w-3xl mx-auto px-4 flex-1 flex flex-col justify-center">
				<motion.div
					className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
					variants={itemVariants}
				>
					<div className="p-6 md:p-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
						<p className="text-lg md:text-xl font-semibold text-gray-900">
							{question.question}
						</p>
					</div>

					<motion.div
						className="p-6 md:p-8 border-b border-gray-200"
						variants={itemVariants}
						transition={{ delay: 0.1 }}
					>
						<h3 className="text-lg font-bold text-gray-900 mb-3">
							Your Answer
						</h3>
						<p className="text-base md:text-lg text-gray-700 mb-4">
							{userAnswerText}
						</p>
						<motion.span
							className={classnames(
								'inline-block px-4 py-2 rounded-lg font-bold text-sm md:text-base',
								{
									'bg-green-100 text-green-700': isCorrect,
									'bg-red-100 text-red-700': !isCorrect,
								},
							)}
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.3, type: 'spring' }}
						>
							{isCorrect ? '✓ Correct' : '✗ Incorrect'}
						</motion.span>
					</motion.div>

					<motion.div
						className="p-6 md:p-8 border-b border-gray-200"
						variants={itemVariants}
						transition={{ delay: 0.2 }}
					>
						<h3 className="text-lg font-bold text-gray-900 mb-3">
							Explanation
						</h3>
						<p className="text-base md:text-lg text-gray-700 leading-relaxed">
							{question.explanation}
						</p>
					</motion.div>

					{!isCorrect && (
						<motion.div
							className="p-6 md:p-8 bg-green-50"
							variants={itemVariants}
							transition={{ delay: 0.3 }}
						>
							<h3 className="text-lg font-bold text-green-900 mb-3">
								Correct Answer
							</h3>
							<p className="text-base md:text-lg text-green-800">
								{correctAnswerText}
							</p>
						</motion.div>
					)}
				</motion.div>
			</motion.div>

			{/* Navigation */}
			<motion.div
				className="w-full max-w-3xl mx-auto px-4 mt-8"
				variants={itemVariants}
			>
				<div className="flex gap-4 md:gap-6 flex-col md:flex-row">
					<motion.button
						onClick={onBack}
						className="flex-1 py-3 md:py-4 px-6 bg-gray-100 text-indigo-600 font-bold text-lg rounded-lg border-2 border-indigo-500 hover:bg-indigo-500 hover:text-white transition-all duration-300 uppercase tracking-wide"
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						← Back to Results
					</motion.button>

					<motion.button
						onClick={onPrevious}
						disabled={currentIndex === 0}
						className={classnames(
							'flex-1 py-3 md:py-4 px-6 font-bold text-lg rounded-lg transition-all duration-300 uppercase tracking-wide',
							{
								'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50':
									currentIndex === 0,
								'bg-gray-100 text-gray-700 hover:bg-gray-200': currentIndex > 0,
							},
						)}
						whileHover={currentIndex > 0 ? { scale: 1.02 } : {}}
						whileTap={currentIndex > 0 ? { scale: 0.98 } : {}}
					>
						← Previous
					</motion.button>

					<motion.button
						onClick={onNext}
						className="flex-1 py-3 md:py-4 px-6 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-bold text-lg rounded-lg hover:shadow-lg transition-all duration-300 uppercase tracking-wide"
						whileHover={{ scale: 1.02, y: -3 }}
						whileTap={{ scale: 0.98 }}
					>
						{currentIndex === totalQuestions - 1
							? 'Back to Results'
							: 'Next Answer →'}
					</motion.button>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default ExplanationScreen;
