import { motion, type Variants } from 'framer-motion';

interface ResultsScreenProps {
	score: number;
	totalQuestions: number;
	onRetake: () => void;
	onReview: () => void;
}

const containerVariants: Variants = {
	hidden: { opacity: 0, scale: 0.9 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.5, staggerChildren: 0.15, delayChildren: 0.2 },
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function getResultCopy(percentage: number): { title: string; message: string } {
	if (percentage === 100)
		return {
			title: '🎉 Perfect Score!',
			message: "Absolutely outstanding! You're a corruption-fighting champion!",
		};
	if (percentage >= 80)
		return {
			title: '⭐ Excellent!',
			message:
				'Great job! You have strong knowledge about anti-corruption principles.',
		};
	if (percentage >= 60)
		return {
			title: '✅ Good Job!',
			message:
				'Well done! You understand many anti-corruption concepts. Review the answers to learn more.',
		};
	if (percentage >= 40)
		return {
			title: '📚 Keep Learning!',
			message:
				'You have basic knowledge. Review the answers and try again to improve.',
		};
	return {
		title: '💪 Keep Going!',
		message:
			"Don't worry! Take time to review the answers and learn. Try again later.",
	};
}

const ResultsScreen = ({
	score,
	totalQuestions,
	onRetake,
	onReview,
}: ResultsScreenProps) => {
	const percentage = Math.round((score / totalQuestions) * 100);
	const { title, message } = getResultCopy(percentage);

	return (
		<motion.div
			className="min-h-screen flex items-center justify-center pb-10 px-4"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			exit={{ opacity: 0 }}
		>
			<motion.div className="w-full max-w-2xl mx-auto text-center">
				{/* Score circle */}
				<motion.div className="mb-10" variants={itemVariants}>
					<motion.div
						className="w-48 h-48 md:w-56 md:h-56 mx-auto rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 flex flex-col items-center justify-center text-white shadow-2xl"
						initial={{ scale: 0 }}
						animate={{ scale: [0, 1.1, 1] }}
						transition={{ duration: 0.6, ease: 'easeOut' }}
					>
						<div className="text-6xl md:text-7xl font-bold">{score}</div>
						<div className="text-2xl md:text-3xl">/{totalQuestions}</div>
					</motion.div>
				</motion.div>

				<motion.h2
					className="text-3xl md:text-4xl font-bold text-indigo-600 mb-4"
					variants={itemVariants}
				>
					{title}
				</motion.h2>

				<motion.p
					className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed"
					variants={itemVariants}
				>
					{message}
				</motion.p>

				{percentage >= 60 && (
					<motion.div
						className="flex justify-center mb-10"
						variants={itemVariants}
					>
						<motion.div
							className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-400 flex items-center justify-center text-5xl shadow-lg"
							animate={{ rotate: 360 }}
							transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
						>
							{percentage === 100 ? '🏆' : '⭐'}
						</motion.div>
					</motion.div>
				)}

				{/* Breakdown */}
				<motion.div
					className="grid grid-cols-2 gap-4 md:gap-6 p-6 md:p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl mb-10"
					variants={itemVariants}
				>
					<div className="flex flex-col">
						<span className="text-gray-600 text-sm md:text-base mb-2">
							Correct Answers
						</span>
						<span className="text-2xl md:text-3xl font-bold text-indigo-600">
							{score}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-gray-600 text-sm md:text-base mb-2">
							Accuracy
						</span>
						<span className="text-2xl md:text-3xl font-bold text-indigo-600">
							{percentage}%
						</span>
					</div>
				</motion.div>

				{/* Actions */}
				<motion.div
					className="flex flex-col md:flex-row gap-4 md:gap-6"
					variants={itemVariants}
				>
					<motion.button
						onClick={onRetake}
						className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 uppercase tracking-wide"
						whileHover={{ scale: 1.05, y: -3 }}
						whileTap={{ scale: 0.98 }}
					>
						Try Again
					</motion.button>
					<motion.button
						onClick={onReview}
						className="flex-1 py-4 px-6 bg-gray-100 text-indigo-600 font-bold text-lg rounded-lg border-2 border-indigo-500 hover:bg-indigo-500 hover:text-white transition-all duration-300 uppercase tracking-wide"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.98 }}
					>
						Review Answers
					</motion.button>
				</motion.div>
			</motion.div>
		</motion.div>
	);
};

export default ResultsScreen;
