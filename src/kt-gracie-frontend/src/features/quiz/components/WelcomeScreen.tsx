import { motion, type Variants } from 'framer-motion';

interface WelcomeScreenProps {
	onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.2, delayChildren: 0.3 },
		},
	};

	const itemVariants: Variants = {
		hidden: { opacity: 0, y: -20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6, ease: 'easeOut' },
		},
	};

	return (
		<motion.div
			className="flex flex-col items-center justify-center min-h-screen px-4"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			<motion.div
				className="w-full max-w-2xl mx-auto text-center"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				{/* Title */}
				<motion.div
					className="mb-8"
					variants={itemVariants}
					animate={{ y: [0, -10, 0] }}
					transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
				>
					<h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-500 via-indigo-700 to-purple-600 bg-clip-text text-transparent">
						🛡️ Gracie Quiz
					</h1>
				</motion.div>

				{/* Subtitle */}
				<motion.p
					className="text-lg md:text-xl text-gray-600 mb-12"
					variants={itemVariants}
				>
					Test your knowledge about transparency, integrity, and fighting
					corruption
				</motion.p>

				{/* Stats */}
				<motion.div
					className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl"
					variants={itemVariants}
				>
					{[
						{ value: '10', label: 'Questions' },
						{ value: 'MCQ & T/F', label: 'Question Types' },
						{ value: '5-10 min', label: 'Duration' },
					].map(({ value, label }) => (
						<div key={label} className="flex flex-col items-center">
							<span className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">
								{value}
							</span>
							<span className="text-gray-600 font-medium">{label}</span>
						</div>
					))}
				</motion.div>

				{/* Description */}
				<motion.p
					className="text-base md:text-lg text-gray-700 mb-12 leading-relaxed"
					variants={itemVariants}
				>
					Learn about anti-corruption principles through engaging questions. Each
					question has instant explanations to help you understand better.
				</motion.p>

				{/* Start Button */}
				<motion.button
					onClick={onStart}
					className="px-8 md:px-12 py-4 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 uppercase tracking-wide"
					variants={itemVariants}
					whileHover={{ scale: 1.05, y: -3 }}
					whileTap={{ scale: 0.98 }}
				>
					Start Quiz
				</motion.button>
			</motion.div>
		</motion.div>
	);
};

export default WelcomeScreen;
