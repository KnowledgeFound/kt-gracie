import { motion, type Variants } from 'framer-motion';
import classnames from 'classnames';
import type { Question, UserAnswer } from '../types';
import { BackMenu } from '@/components/ui';
import { CheckCircle2, XCircle } from 'lucide-react';

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
	hidden:  { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, staggerChildren: 0.08, delayChildren: 0.1 },
	},
};

const itemVariants: Variants = {
	hidden:  { opacity: 0, x: -16 },
	visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
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
		: userAnswer ? 'True' : 'False';

	const correctAnswerText = typeIsMCQ
		? (question.options[
				typeof correctAnswer === 'string'
					? correctAnswer.charCodeAt(0) - 65
					: -1
			] ?? '—')
		: correctAnswer ? 'True' : 'False';

	return (
		<motion.div
			className="min-h-screen bg-surface-page flex flex-col"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			exit={{ opacity: 0 }}
		>
			{/* Header */}
			<motion.div
				className="w-full max-w-3xl mx-auto px-4 pt-8 md:pt-10 pb-2"
				variants={itemVariants}
			>
				<BackMenu to="/" />
				<div className="flex items-center justify-between mt-4 mb-2">
					<h2 className="text-xl md:text-2xl font-bold text-ink-deep">
						Question {currentIndex + 1}
						<span className="text-ink-subtle font-normal text-base ml-1">
							of {totalQuestions}
						</span>
					</h2>
					<span className={classnames(
						'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border',
						isCorrect
							? 'bg-emerald-50 border-emerald-200 text-emerald-700'
							: 'bg-rose-50 border-rose-200 text-rose-700',
					)}>
						{isCorrect
							? <><CheckCircle2 className="size-4" /> Correct</>
							: <><XCircle className="size-4" /> Incorrect</>
						}
					</span>
				</div>
			</motion.div>

			{/* Card */}
			<motion.div
				className="flex-1 w-full max-w-3xl mx-auto px-4 pb-4 flex flex-col gap-3"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				{/* Question */}
				<motion.div
					className="bg-white rounded-2xl shadow-card border border-gray-100 p-6"
					variants={itemVariants}
				>
					<p className="text-base md:text-lg font-semibold text-ink-deep leading-relaxed">
						{question.question}
					</p>
				</motion.div>

				{/* Your answer */}
				<motion.div
					className={classnames(
						'rounded-2xl border p-5',
						isCorrect
							? 'bg-emerald-50 border-emerald-200'
							: 'bg-rose-50 border-rose-200',
					)}
					variants={itemVariants}
				>
					<p className="text-[10px] font-bold tracking-widest uppercase mb-1.5 text-ink-subtle">
						Your Answer
					</p>
					<p className={classnames(
						'text-base font-semibold',
						isCorrect ? 'text-emerald-800' : 'text-rose-800',
					)}>
						{userAnswerText}
					</p>
				</motion.div>

				{/* Correct answer (only when wrong) */}
				{!isCorrect && (
					<motion.div
						className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5"
						variants={itemVariants}
						initial={{ opacity: 0, scale: 0.97 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 22 }}
					>
						<p className="text-[10px] font-bold tracking-widest uppercase mb-1.5 text-ink-subtle">
							Correct Answer
						</p>
						<p className="text-base font-semibold text-emerald-800">
							{correctAnswerText}
						</p>
					</motion.div>
				)}

				{/* Explanation */}
				<motion.div
					className="bg-white rounded-2xl shadow-card border border-gray-100 p-6"
					variants={itemVariants}
				>
					<p className="text-[10px] font-bold tracking-widest uppercase mb-2 text-ink-subtle">
						Explanation
					</p>
					<p className="text-sm md:text-base text-ink-mid leading-relaxed">
						{question.explanation}
					</p>
				</motion.div>
			</motion.div>

			{/* Navigation */}
			<motion.div
				className="w-full max-w-3xl mx-auto px-4 pb-8 pt-2"
				variants={itemVariants}
			>
				<div className="flex gap-3">
					<button
						onClick={onBack}
						className="px-5 py-3 bg-white border-2 border-brand-500 text-brand-600 font-bold text-sm rounded-xl hover:bg-brand-50 transition-colors uppercase tracking-wide"
					>
						← Results
					</button>

					<button
						onClick={onPrevious}
						disabled={currentIndex === 0}
						className={classnames(
							'px-5 py-3 font-bold text-sm rounded-xl transition-colors uppercase tracking-wide border-2',
							currentIndex === 0
								? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
								: 'border-gray-200 bg-white text-ink-mid hover:bg-gray-50 hover:text-ink-deep',
						)}
					>
						← Prev
					</button>

					<motion.button
						onClick={onNext}
						className="flex-1 py-3 px-6 bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 text-white font-bold text-sm rounded-xl shadow-md uppercase tracking-wide transition-all"
						whileHover={{ scale: 1.01, y: -1 }}
						whileTap={{ scale: 0.98 }}
					>
						{currentIndex === totalQuestions - 1 ? 'Back to Results →' : 'Next →'}
					</motion.button>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default ExplanationScreen;
