import { motion, type Variants } from 'framer-motion';
import { BookOpen, Clock, Hash } from 'lucide-react';
import { useOptionalUser } from '@/features/auth';
import type { Subject } from '@/features/subject';

interface WelcomeScreenProps {
	onStart: () => void;
	/** Subject context — shown when quiz is launched from a subject page */
	subject?: Subject | null;
}

const WelcomeScreen = ({ onStart, subject }: WelcomeScreenProps) => {
	const user = useOptionalUser();

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
					className="mb-4"
					variants={itemVariants}
					animate={{ y: [0, -10, 0] }}
					transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
				>
					<h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-500 via-brand-700 to-brand-200 bg-clip-text text-transparent">
						🛡️ Gracie Quiz
					</h1>
				</motion.div>

				{/* Subject context banner */}
				{subject && (
					<motion.div
						className="mb-6 bg-gradient-to-r from-brand-500 to-quiz-600 rounded-card p-4 text-white text-left shadow-card"
						variants={itemVariants}
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
								<BookOpen className="w-5 h-5" />
							</div>
							<div className="min-w-0">
								<p className="font-bold text-lg leading-tight truncate">
									{subject.name}
								</p>
								<div className="flex items-center gap-3 mt-0.5 text-white/70 text-xs">
									<span className="flex items-center gap-1">
										<Hash className="w-3 h-3" />
										{subject.code}
									</span>
									<span className="flex items-center gap-1">
										<Clock className="w-3 h-3" />
										{subject.duration.toString()} hrs
									</span>
								</div>
							</div>
						</div>
						{subject.description && (
							<p className="mt-2 text-white/80 text-sm leading-relaxed line-clamp-2">
								{subject.description}
							</p>
						)}
					</motion.div>
				)}

				{/* Personalised greeting */}
				{user && (
					<motion.p
						className="text-2xl font-semibold text-brand-700 mb-4"
						variants={itemVariants}
					>
						Welcome back, {user.firstName}!
					</motion.p>
				)}

				{/* Progression summary */}
				{user && (
					<motion.div
						className="flex justify-center gap-6 mb-8"
						variants={itemVariants}
					>
						<Stat label="High Score" value={user.progression.highScore} />
						<Stat label="Quizzes"    value={user.progression.quizzesCompleted} />
						<Stat label="Streak"     value={`${user.progression.streakDays}d`} />
					</motion.div>
				)}

				{/* Subtitle */}
				<motion.p
					className="text-lg md:text-xl text-gray-600 mb-10"
					variants={itemVariants}
				>
					{subject
						? `Test your knowledge on ${subject.name}`
						: 'Test your knowledge about transparency, integrity, and fighting corruption'}
				</motion.p>

				{/* Quiz meta */}
				<motion.div
					className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-8 bg-gradient-to-r from-brand-50 to-purple-50 rounded-2xl"
					variants={itemVariants}
				>
					{[
						{ value: '10',        label: 'Questions' },
						{ value: 'MCQ & T/F', label: 'Question Types' },
						{ value: '5-10 min',  label: 'Duration' },
					].map(({ value, label }) => (
						<div key={label} className="flex flex-col items-center">
							<span className="text-3xl md:text-4xl font-bold text-brand-600 mb-2">
								{value}
							</span>
							<span className="text-gray-600 font-medium">{label}</span>
						</div>
					))}
				</motion.div>

				{/* Start Button */}
				<motion.button
					onClick={onStart}
					className="px-8 md:px-12 py-4 bg-gradient-to-r from-brand-500 to-brand-700 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 uppercase tracking-wide"
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

function Stat({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="flex flex-col items-center bg-white rounded-xl px-5 py-3 shadow-sm">
			<span className="text-xl font-bold text-brand-600">{value}</span>
			<span className="text-xs text-gray-500 mt-0.5">{label}</span>
		</div>
	);
}

export default WelcomeScreen;
