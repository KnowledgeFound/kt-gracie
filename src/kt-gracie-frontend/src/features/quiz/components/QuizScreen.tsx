import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import classnames from 'classnames';
import type { Question, UserAnswer } from '../types';
import { Button } from '@/components/ui';
import {
	Clock,
	ChevronLeft,
	X,
	Zap,
	CircleQuestionMark,
	CheckCircle2,
	XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CITY_BG } from '../constants';

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuizScreenProps {
	question: Question;
	currentIndex: number;
	totalQuestions: number;
	selectedAnswer: UserAnswer;
	onSelectOption: (value: UserAnswer) => void;
	onPrevious: () => void;
	onNext: () => void;
	canGoPrevious: boolean;
	score: number;
	/** Live elapsed seconds from useQuiz hook */
	elapsed?: number;
}

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, staggerChildren: 0.08, delayChildren: 0.1 },
	},
	exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
};

const itemVariants: Variants = {
	hidden: { opacity: 0, x: -16 },
	visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

const optionVariants: Variants = {
	hidden: { opacity: 0, x: -8 },
	visible: { opacity: 1, x: 0 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatElapsed(s: number): string {
	const m = Math.floor(s / 60);
	const sec = s % 60;
	return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const QuizScreen = ({
	question,
	currentIndex,
	totalQuestions,
	selectedAnswer,
	onSelectOption,
	onNext,
	score,
	elapsed = 0,
}: QuizScreenProps) => {
	const navigate = useNavigate();

	/** Whether the user has clicked "Confirm Answer" for the current question */
	const [confirmed, setConfirmed] = useState(false);

	// Reset confirmed state when the question changes
	// (framer-motion re-mounts the whole screen on question change via key,
	//  but if it doesn't, this guard keeps state clean)
	const typeIsMCQ = question.type === 'mcq';
	const optionsList = typeIsMCQ ? question.options : ['True', 'False'];
	const progress = ((currentIndex + 1) / totalQuestions) * 100;

	const getOptionValue = (index: number): UserAnswer =>
		typeIsMCQ ? String.fromCharCode(65 + index) : index === 0;

	function handleConfirm() {
		if (selectedAnswer === null) return;
		setConfirmed(true);
	}

	function handleNext() {
		setConfirmed(false);
		onNext();
	}

	// Per-option appearance after confirmation
	function getOptionStyle(optionValue: UserAnswer) {
		const base =
			'w-full p-3.5 text-left rounded-xl font-medium text-sm md:text-base transition-all duration-200 flex items-center gap-3';

		if (!confirmed) {
			const isSelected = selectedAnswer === optionValue;
			return classnames(
				base,
				isSelected
					? 'bg-brand-50 border-2 border-brand-500 text-brand-800 shadow-sm cursor-default'
					: 'bg-gray-50 border-2 border-gray-200 text-ink-mid hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer',
			);
		}

		const isCorrect = optionValue === question.correctAnswer;
		const isSelected = selectedAnswer === optionValue;

		if (isCorrect)
			return `${base} bg-emerald-50 border-2 border-emerald-400 text-emerald-800 cursor-default`;
		if (isSelected && !isCorrect)
			return `${base} bg-rose-50 border-2 border-rose-400 text-rose-800 cursor-default`;
		return `${base} bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-default opacity-60`;
	}

	function getLetterStyle(optionValue: UserAnswer) {
		const base =
			'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black';

		if (!confirmed) {
			const isSelected = selectedAnswer === optionValue;
			return classnames(
				base,
				isSelected ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-500',
			);
		}
		const isCorrect = optionValue === question.correctAnswer;
		const isSelected = selectedAnswer === optionValue;
		if (isCorrect) return `${base} bg-emerald-500 text-white`;
		if (isSelected && !isCorrect) return `${base} bg-rose-500 text-white`;
		return `${base} bg-gray-200 text-gray-400`;
	}

	return (
		<motion.div
			className="min-h-[100dvh] flex flex-col justify-center relative bg-cover bg-center bg-fixed"
			style={{ backgroundImage: `url(${CITY_BG})` }}
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
		>
			{/* Overlay */}
			<div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" />

			{/* Close */}
			<Button
				variant="ghost"
				size="sm"
				className="p-1.5 absolute top-4 right-4 z-10 text-white/70 hover:text-white rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
				onClick={() => navigate('/city')}
				aria-label="Close quiz"
			>
				<X className="size-4" />
			</Button>

			{/* Help */}
			<button
				className="absolute bottom-4 right-4 z-10 p-1.5 rounded-full bg-white/10 border border-white/20 text-white/60 hover:text-white hover:bg-white/20 transition-colors"
				aria-label="Help"
			>
				<CircleQuestionMark className="size-4" />
			</button>

			{/* ── Main content ─────────────────────────────────────────── */}
			<motion.div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-16 md:px-6 md:py-8 space-y-3">
				{/* ── Top bar ──────────────────────────────────────────── */}
				<motion.div
					className="flex items-center justify-between"
					variants={itemVariants}
				>
					<div className="flex items-center gap-2">
						{/* Quit */}
						<button
							className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
							onClick={() => navigate('/')}
						>
							<ChevronLeft className="size-4" />
							Quit
						</button>

						{/* Score */}
						<span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white/80">
							Score: <span className="text-amber-400 font-bold">{score}</span>
						</span>
					</div>

					{/* Timer */}
					<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-bold">
						<Clock className="size-4 text-brand-300" />
						<span>{formatElapsed(elapsed)}</span>
					</div>
				</motion.div>

				{/* ── Progress bar ──────────────────────────────────────── */}
				<motion.div variants={itemVariants}>
					<div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
						<motion.div
							className="h-full bg-gradient-to-r from-brand-400 to-purple-400 rounded-full"
							initial={{ width: 0 }}
							animate={{ width: `${progress}%` }}
							transition={{ duration: 0.5, ease: 'easeOut' }}
						/>
					</div>
				</motion.div>

				{/* ── Question card ─────────────────────────────────────── */}
				<motion.div
					className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden"
					variants={itemVariants}
				>
					{/* Card header */}
					<div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
						<span className="text-xs font-bold text-ink-subtle tracking-widest uppercase">
							Q{String(currentIndex + 1).padStart(2, '0')} /{' '}
							{String(totalQuestions).padStart(2, '0')}
						</span>
						<div className="flex items-center gap-2">
							<span
								className={classnames(
									'px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border',
									typeIsMCQ
										? 'bg-emerald-50 border-emerald-200 text-emerald-700'
										: 'bg-purple-50 border-purple-200 text-purple-600',
								)}
							>
								{typeIsMCQ ? 'Easy' : 'T / F'}
							</span>
							<span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-50 border border-amber-200 text-amber-600">
								<Zap className="size-3" /> +50
							</span>
						</div>
					</div>

					{/* Question text */}
					<div className="px-5 pt-5 pb-4">
						<motion.h2
							className="text-lg md:text-xl font-bold text-ink-deep leading-snug mb-5"
							variants={optionVariants}
						>
							{question.question}
						</motion.h2>

						{/* Options */}
						<motion.div
							className="space-y-2.5"
							variants={containerVariants}
							initial="hidden"
							animate="visible"
						>
							{optionsList.map((option, index) => {
								const optionValue = getOptionValue(index);
								const isCorrect = optionValue === question.correctAnswer;
								const isSelected = selectedAnswer === optionValue;
								const letter = typeIsMCQ
									? String.fromCharCode(65 + index)
									: index === 0
										? 'T'
										: 'F';

								return (
									<motion.button
										key={index}
										onClick={() => !confirmed && onSelectOption(optionValue)}
										disabled={confirmed}
										className={getOptionStyle(optionValue)}
										variants={optionVariants}
										transition={{ delay: index * 0.06 }}
										whileHover={!confirmed ? { x: 2 } : {}}
										whileTap={!confirmed ? { scale: 0.99 } : {}}
									>
										{/* Letter badge */}
										<span className={getLetterStyle(optionValue)}>
											{letter}
										</span>

										<span className="flex-1">{option}</span>

										{/* Post-confirm icon */}
										{confirmed && isCorrect && (
											<CheckCircle2 className="flex-shrink-0 size-5 text-emerald-400" />
										)}
										{confirmed && isSelected && !isCorrect && (
											<XCircle className="flex-shrink-0 size-5 text-rose-400" />
										)}
									</motion.button>
								);
							})}
						</motion.div>
					</div>

					{/* ── Footer ───────────────────────────────────────────── */}
					<div className="px-5 pb-5 pt-1">
						<AnimatePresence mode="wait">
							{!confirmed ? (
								/* Confirm Answer button — disabled until an option is picked */
								<motion.button
									key="confirm"
									onClick={handleConfirm}
									disabled={selectedAnswer === null}
									className={classnames(
										'w-full py-3.5 px-6 font-bold text-sm rounded-xl transition-all duration-200 uppercase tracking-widest',
										selectedAnswer !== null
											? 'bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 text-white shadow-lg cursor-pointer'
											: 'bg-gray-100 border border-white/10 text-gray-400 cursor-not-allowed',
									)}
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -6 }}
									transition={{ duration: 0.2 }}
									whileHover={selectedAnswer !== null ? { scale: 1.01 } : {}}
									whileTap={selectedAnswer !== null ? { scale: 0.98 } : {}}
								>
									Confirm Answer
								</motion.button>
							) : (
								/* Next Question button — appears after confirmation */
								<motion.button
									key="next"
									onClick={handleNext}
									className="w-full py-3.5 px-6 font-bold text-sm rounded-xl uppercase tracking-widest text-white shadow-md bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 cursor-pointe"
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -6 }}
									transition={{ duration: 0.2 }}
									whileHover={{ scale: 1.01 }}
									whileTap={{ scale: 0.98 }}
								>
									{currentIndex === totalQuestions - 1
										? 'Submit Quiz →'
										: 'Next Question →'}
								</motion.button>
							)}
						</AnimatePresence>
					</div>
				</motion.div>
			</motion.div>
		</motion.div>
	);
};

export default QuizScreen;
