import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import classnames from 'classnames';
import {
	Check,
	CheckCircle2,
	XCircle,
	X,
	RotateCcw,
	ChevronDown,
	ChevronUp,
	CircleQuestionMark,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Question, UserAnswer } from '../types';
import { CITY_BG } from '../constants';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResultsScreenProps {
	score: number;
	totalQuestions: number;
	questions: Question[];
	userAnswers: UserAnswer[];
	onRetake: () => void;
	/** Legacy prop — kept for API compatibility */
	onReview?: () => void;
	/** Elapsed quiz time in seconds */
	timeTaken?: number;
}

// ─── Rank helpers ─────────────────────────────────────────────────────────────

type Rank = { label: string; emoji: string; color: string; bg: string };

function getRank(pct: number): Rank {
	if (pct === 100)
		return {
			label: 'CHAMPION',
			emoji: '🏆',
			color: 'text-amber-700',
			bg: 'bg-amber-50   border-amber-200',
		};
	if (pct >= 80)
		return {
			label: 'EXPERT',
			emoji: '⭐',
			color: 'text-yellow-700',
			bg: 'bg-yellow-50  border-yellow-200',
		};
	if (pct >= 60)
		return {
			label: 'SCHOLAR',
			emoji: '📚',
			color: 'text-brand-700',
			bg: 'bg-brand-50   border-brand-200',
		};
	if (pct >= 40)
		return {
			label: 'LEARNER',
			emoji: '🎓',
			color: 'text-brand-600',
			bg: 'bg-brand-50   border-brand-200',
		};
	return {
		label: 'NOVICE',
		emoji: '🌱',
		color: 'text-emerald-700',
		bg: 'bg-emerald-50 border-emerald-200',
	};
}

function formatTime(seconds: number): string {
	if (seconds < 60) return `${seconds}s`;
	return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function getCorrectText(question: Question): string {
	if (question.type === 'mcq') {
		const idx =
			typeof question.correctAnswer === 'string'
				? question.correctAnswer.charCodeAt(0) - 65
				: -1;
		return question.options[idx] ?? String(question.correctAnswer);
	}
	return question.correctAnswer ? 'True' : 'False';
}

function getUserAnswerText(question: Question, answer: UserAnswer): string {
	if (answer === null) return '—';
	if (question.type === 'mcq') {
		const idx = typeof answer === 'string' ? answer.charCodeAt(0) - 65 : -1;
		return question.options[idx] ?? String(answer);
	}
	return answer ? 'True' : 'False';
}

// ─── Answer strip ─────────────────────────────────────────────────────────────

function AnswerStrip({
	questions,
	userAnswers,
}: {
	questions: Question[];
	userAnswers: UserAnswer[];
}) {
	return (
		<div className="flex gap-1">
			{questions.map((q, i) => {
				const correct = userAnswers[i] === q.correctAnswer;
				return (
					<div
						key={i}
						title={`Q${i + 1}: ${correct ? 'Correct' : 'Incorrect'}`}
						className={`h-2 flex-1 min-w-[14px] rounded-sm ${correct ? 'bg-emerald-400' : 'bg-rose-400'}`}
					/>
				);
			})}
		</div>
	);
}

// ─── Question review card ─────────────────────────────────────────────────────

interface QuestionCardProps {
	question: Question;
	index: number;
	userAnswer: UserAnswer;
	isExpanded: boolean;
	onToggle: () => void;
}

function QuestionCard({
	question,
	index,
	userAnswer,
	isExpanded,
	onToggle,
}: QuestionCardProps) {
	const isCorrect = userAnswer === question.correctAnswer;
	const correctText = getCorrectText(question);
	const userText = getUserAnswerText(question, userAnswer);
	const topic = question.type === 'mcq' ? 'Multiple Choice' : 'True / False';

	return (
		<motion.div
			className={classnames(
				'rounded-xl border overflow-hidden transition-colors duration-200',
				isCorrect
					? 'border-emerald-200 bg-emerald-50'
					: 'border-rose-200/50 bg-rose-50',
			)}
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.04, duration: 0.3 }}
		>
			{/* ── Collapsed header (always visible, clickable) ── */}
			<button
				onClick={onToggle}
				className="w-full text-left p-4 flex items-start gap-3"
				aria-expanded={isExpanded}
			>
				{/* Correct/wrong icon */}
				<span className="flex-shrink-0 mt-0.5">
					{isCorrect ? (
						<CheckCircle2 className="size-5 text-emerald-500" />
					) : (
						<XCircle className="size-5 text-rose-500" />
					)}
				</span>

				<div className="flex-1 min-w-0">
					<div className="flex flex-wrap items-center gap-2 mb-1">
						<span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
							Q{index + 1}
						</span>
						<span
							className={classnames(
								'inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border truncate max-w-[140px]',
								isCorrect
									? 'bg-emerald-100 border-emerald-200 text-emerald-700'
									: 'bg-brand-50 border-brand-200 text-brand-600',
							)}
						>
							{topic}
						</span>
					</div>
					<p className="text-sm text-ink-deep leading-snug font-medium line-clamp-2">
						{question.question}
					</p>
					{/* Correct answer preview when collapsed and wrong */}
					{!isExpanded && !isCorrect && (
						<p className="text-xs font-semibold text-emerald-700 mt-1 truncate">
							✓ {correctText}
						</p>
					)}
				</div>

				{/* Expand/collapse toggle */}
				<span
					className={classnames(
						'flex-shrink-0 ml-2 transition-colors',
						isCorrect ? 'text-emerald-400' : 'text-rose-400',
					)}
				>
					{isExpanded ? (
						<ChevronUp className="size-4" />
					) : (
						<ChevronDown className="size-4" />
					)}
				</span>
			</button>

			{/* ── Expanded explanation ── */}
			<AnimatePresence>
				{isExpanded && (
					<motion.div
						key="explanation"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.25, ease: 'easeInOut' }}
						className="overflow-hidden"
					>
						<div
							className={classnames(
								'px-4 pb-4 pt-0 border-t space-y-3',
								isCorrect ? 'border-emerald-200' : 'border-rose-200',
							)}
						>
							{/* Your answer */}
							<div className="pt-3">
								<p className="text-[10px] font-bold tracking-widest text-ink-subtle uppercase mb-1">
									Your Answer
								</p>
								<p
									className={classnames(
										'text-sm font-semibold',
										isCorrect ? 'text-emerald-800' : 'text-rose-800',
									)}
								>
									{userText}
								</p>
							</div>

							{/* Correct answer (only when wrong) */}
							{!isCorrect && (
								<div>
									<p className="text-[10px] font-bold tracking-widest text-ink-subtle uppercase mb-1">
										Correct Answer
									</p>
									<p className="text-sm font-semibold text-emerald-700">
										{correctText}
									</p>
								</div>
							)}

							{/* Explanation */}
							<div>
								<p className="text-[10px] font-bold tracking-widest text-ink-subtle uppercase mb-1">
									Explanation
								</p>
								<p className="text-sm text-ink-mid leading-relaxed">
									{question.explanation}
								</p>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

// ─── Main component ───────────────────────────────────────────────────────────

const ResultsScreen = ({
	score,
	totalQuestions,
	questions,
	userAnswers,
	onRetake,
	timeTaken = 0,
}: ResultsScreenProps) => {
	const navigate = useNavigate();
	const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

	const percentage = Math.round((score / totalQuestions) * 100);
	const rank = getRank(percentage);
	const missedCount = questions.filter(
		(q, i) => userAnswers[i] !== q.correctAnswer,
	).length;
	const ktEarned = Math.round((score / totalQuestions) * 350);

	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.08, delayChildren: 0.1 },
		},
	};
	const itemVariants: Variants = {
		hidden: { opacity: 0, y: 10 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.4, ease: 'easeOut' },
		},
	};

	function toggleExpanded(i: number) {
		setExpandedIndex((prev) => (prev === i ? null : i));
	}

	return (
		<motion.div
			className="flex items-center justify-center min-h-screen relative bg-cover bg-center bg-fixed"
			style={{ backgroundImage: `url(${CITY_BG})` }}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			{/* Light blur overlay — city still clearly visible */}
			<div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />

			{/* Close */}
			<button
				onClick={() => navigate('/city')}
				className="absolute top-5 right-5 z-10 p-1.5 rounded-full bg-white/80 border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-white transition-colors shadow-sm"
				aria-label="Close"
			>
				<X className="size-4" />
			</button>
			{/* Quetion and Tips */}
			<button
				onClick={() => navigate('/city')}
				className="absolute bottom-5 right-5 z-10 p-1.5 rounded-full bg-white/80 border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-white transition-colors shadow-sm"
				aria-label="Info"
			>
				<CircleQuestionMark className="size-4" />
			</button>

			{/* Modal */}
			<motion.div
				className="relative z-10 w-full max-w-4xl max-h-[70vh] flex flex-col md:flex-row overflow-hidden bg-transparent md:gap-2"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				{/* ── LEFT PANEL — Summary ──────────────────────────────── */}
				<motion.div
					className="flex-1 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:rounded-2xl border-gray-100 bg-white"
					variants={itemVariants}
				>
					{/* Badge */}
					<div className="mb-6 ">
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-[10px] font-bold tracking-widest text-brand-600 uppercase">
							<Check className="size-3" />
							Assessment Complete
						</span>
					</div>

					{/* Rank emoji */}
					<motion.div
						className="text-6xl mb-3 select-none"
						initial={{ scale: 0 }}
						animate={{ scale: [0, 1.2, 1] }}
						transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
					>
						{rank.emoji}
					</motion.div>

					{/* Rank label */}
					<motion.div className="text-center mb-6" variants={itemVariants}>
						<p className="text-[10px] font-bold tracking-widest text-ink-subtle uppercase mb-1">
							Rank Achieved
						</p>
						<div className={`inline-block px-4 py-1.5`}>
							<h2
								className={`text-2xl font-black tracking-widest ${rank.color}`}
							>
								{rank.label}
							</h2>
						</div>
					</motion.div>

					{/* KT earned */}
					<motion.div
						className="w-full rounded-xl border border-amber-200 bg-amber-50 py-4 px-5 text-center mb-6"
						variants={itemVariants}
					>
						<p className="text-4xl font-black text-amber-600">◎ {ktEarned}</p>
						<p className="text-[10px] font-bold tracking-widest text-amber-600/70 uppercase mb-1">
							Knowledge Tokens Earned
						</p>
					</motion.div>

					{/* Stats grid */}
					<motion.div
						className="w-full grid grid-cols-3 gap-2 mb-6"
						variants={itemVariants}
					>
						{[
							{
								value: `${score}/${totalQuestions}`,
								label: 'CORRECT',
								color: 'text-brand-600',
							},
							{
								value: `${percentage}%`,
								label: 'ACCURACY',
								color: 'text-brand-600',
							},
							{
								value: formatTime(timeTaken),
								label: 'TIME',
								color: 'text-amber-600',
							},
						].map(({ value, label, color }) => (
							<div
								key={label}
								className="flex flex-col items-center rounded-xl bg-gray-50 border border-gray-200 py-3"
							>
								<span
									className={`text-base font-black leading-none mb-1 ${color}`}
								>
									{value}
								</span>
								<span className="text-[9px] font-bold tracking-widest text-ink-subtle uppercase">
									{label}
								</span>
							</div>
						))}
					</motion.div>

					{/* Answer strip */}
					<motion.div className="w-full mb-6" variants={itemVariants}>
						<AnswerStrip questions={questions} userAnswers={userAnswers} />
					</motion.div>

					{/* Retake */}
					<motion.button
						onClick={onRetake}
						className="w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase text-white flex items-center justify-center gap-2 shadow-md bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800"
						whileHover={{
							scale: 1.02,
							boxShadow: '0 6px 24px rgba(74,152,212,0.35)',
						}}
						whileTap={{ scale: 0.98 }}
						variants={itemVariants}
					>
						<RotateCcw className="size-4" />
						Retake Assessment
					</motion.button>
				</motion.div>

				{/* ── RIGHT PANEL — All questions ───────────────────────── */}
				<motion.div
					className="flex-1 flex flex-col overflow-hidden bg-surface-page rounded-2xl border border-gray-100"
					variants={itemVariants}
				>
					{/* Header */}
					<div className="px-6 pt-6 pb-4 border-b border-gray-100">
						<p className="text-[11px] font-bold tracking-widest text-ink-mid uppercase">
							All Questions
							{missedCount > 0 && (
								<span className="ml-1 text-rose-500">
									— {missedCount} Missed
								</span>
							)}
							{missedCount === 0 && (
								<span className="ml-1 text-emerald-500">— All Correct 🎉</span>
							)}
						</p>
						<p className="text-xs text-ink-muted mt-0.5">
							Click any question to see the explanation.
						</p>
					</div>

					{/* Question list */}
					<div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
						{questions.map((q, i) => (
							<QuestionCard
								key={q.id}
								question={q}
								index={i}
								userAnswer={userAnswers[i] ?? null}
								isExpanded={expandedIndex === i}
								onToggle={() => toggleExpanded(i)}
							/>
						))}
					</div>

					{/* Bottom nav */}
					<div className="px-6 py-4 border-t border-gray-100 bg-white">
						<button
							onClick={() => navigate('/city')}
							className="w-full py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-ink-mid text-sm font-semibold hover:bg-gray-100 hover:text-ink-deep transition-colors"
						>
							← Back to City
						</button>
					</div>
				</motion.div>
			</motion.div>
		</motion.div>
	);
};

export default ResultsScreen;
