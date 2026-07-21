import { motion, type Variants } from 'framer-motion';
import { useState } from 'react';
import {
	CheckCircle2,
	Circle,
	Lock,
	X,
	ChevronRight,
	Medal,
	Hash,
	Zap,
	CircleQuestionMark,
} from 'lucide-react';
import { useOptionalUser } from '@/features/auth';
import type {
	Module,
	ModuleAssessment,
	AssessmentStatus,
	AssessmentDifficulty,
} from '@/features/city/types';
import { useNavigate } from 'react-router-dom';
import { CITY_BG } from '../constants';

// ─── Props ────────────────────────────────────────────────────────────────────

interface WelcomeScreenProps {
	onStart: () => void;
	/** Rich module data from city constants */
	module?: Module | null;
}

// ─── Config maps ──────────────────────────────────────────────────────────────

const difficultyConfig: Record<
	AssessmentDifficulty,
	{ label: string; color: string; bg: string }
> = {
	easy: {
		label: 'EASY',
		color: 'text-emerald-700',
		bg: 'bg-emerald-50 border-emerald-200',
	},
	medium: {
		label: 'MEDIUM',
		color: 'text-amber-700',
		bg: 'bg-amber-50   border-amber-200',
	},
	hard: {
		label: 'HARD',
		color: 'text-rose-700',
		bg: 'bg-rose-50    border-rose-200',
	},
};

const statusConfig: Record<AssessmentStatus, { label: string; color: string }> =
	{
		completed: { label: '✓ COMPLETED', color: 'text-emerald-600' },
		in_progress: { label: '• IN PROGRESS', color: 'text-amber-600' },
		available: { label: '', color: '' },
		locked: { label: 'LOCKED', color: 'text-gray-400' },
	};

// ─── Sub-components ───────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: AssessmentDifficulty }) {
	const { label, color, bg } = difficultyConfig[difficulty];
	return (
		<span
			className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-widest border rounded-full ${color} ${bg}`}
		>
			{label}
		</span>
	);
}

interface AssessmentCardProps {
	assessment: ModuleAssessment;
	index: number;
	selected: boolean;
	onSelect: () => void;
	onStart: () => void;
}

function AssessmentCard({
	assessment,
	index,
	selected,
	onSelect,
	onStart,
}: AssessmentCardProps) {
	const isLocked = assessment.status === 'locked';
	const isCompleted = assessment.status === 'completed';
	const statusInfo = statusConfig[assessment.status];

	return (
		<motion.button
			onClick={() => {
				if (isLocked) return;
				onSelect();
			}}
			disabled={isLocked}
			className={`
				w-full text-left p-4 rounded-xl border transition-all duration-200
				${
					isLocked
						? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
						: selected
							? 'border-brand-400 bg-brand-50 ring-1 ring-brand-300 shadow-sm cursor-pointer'
							: isCompleted
								? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer'
								: 'border-gray-200 bg-white hover:bg-brand-50 hover:border-brand-300 cursor-pointer shadow-sm'
				}
			`}
			whileHover={!isLocked ? { y: -1 } : {}}
			whileTap={!isLocked ? { scale: 0.99 } : {}}
		>
			<div className="flex items-start gap-3">
				{/* Index badge */}
				<div
					className={`
					flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5
					${isCompleted ? 'bg-emerald-500 text-white' : isLocked ? 'bg-gray-200 text-gray-400' : 'bg-brand-100 text-brand-700'}
				`}
				>
					{isCompleted ? (
						<CheckCircle2 className="size-4" />
					) : isLocked ? (
						<Lock className="size-3" />
					) : (
						index + 1
					)}
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex flex-wrap items-center gap-2 mb-1">
						<span
							className={`font-semibold text-sm ${isLocked ? 'text-gray-400' : 'text-ink-deep'}`}
						>
							{assessment.title}
						</span>
						<DifficultyBadge difficulty={assessment.difficulty} />
						{statusInfo.label && (
							<span
								className={`text-[10px] font-bold tracking-wider ${statusInfo.color}`}
							>
								{statusInfo.label}
							</span>
						)}
					</div>

					<p
						className={`text-xs mb-3 leading-relaxed ${isLocked ? 'text-gray-300' : 'text-ink-muted'}`}
					>
						{assessment.description}
					</p>
				</div>
			</div>
			<div
				className={`flex items-center gap-4 text-[11px] border-t border-gray-100 pt-1 ${isLocked ? 'text-gray-300 border-gray-100 ' : 'text-ink-subtle border-gray-200 '}`}
			>
				<span className="flex items-center gap-1">
					<Hash className="size-3" />
					{assessment.questionCount} Q
				</span>
				<span className="flex items-center gap-1">
					<Circle className="size-2 fill-current" />
					{assessment.durationLabel}
				</span>
				<span className="flex items-center gap-1">
					<Zap className="size-3" />
					{assessment.ktMax} KT max
				</span>
				{assessment.ktEarned !== undefined && assessment.ktEarned > 0 && (
					<span className="ml-auto text-amber-600 font-bold text-[11px]">
						Earned: {assessment.ktEarned} KT
					</span>
				)}
			</div>
		</motion.button>
	);
}

// ─── Fallback module (no moduleId in URL) ────────────────────────────────────

const FALLBACK_OBJECTIVES = [
	'Identify core definitions of corruption under UNCAC',
	'Distinguish between bribery, embezzlement, and nepotism',
	'Understand conflict-of-interest and asset-disclosure obligations',
	'Apply international cooperation principles to cross-border cases',
	'Recognise corporate compliance and due-diligence requirements',
];

// ─── Main component ───────────────────────────────────────────────────────────

const WelcomeScreen = ({ onStart, module }: WelcomeScreenProps) => {
	const user = useOptionalUser();
	const navigate = useNavigate();

	const assessments = module?.assessments ?? [];
	const [selectedIndex, setSelectedIndex] = useState(
		// default to first non-locked assessment
		assessments.findIndex((a) => a.status !== 'locked') === -1
			? 0
			: assessments.findIndex((a) => a.status !== 'locked'),
	);
	const selectedAssessment = assessments[selectedIndex];

	const highScore = user?.progression?.highScore ?? 0;
	const lastTaken = user?.progression?.assessmentResults?.slice(-1)[0];
	const lastDate = lastTaken?.takenAt
		? new Date(lastTaken.takenAt).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			})
		: 'Jun 28, 2026';
	const accuracy =
		highScore > 0 && user?.progression.totalAnswered
			? Math.round(
					(user.progression.totalCorrect / user.progression.totalAnswered) *
						100,
				)
			: 71;

	const objectives = module?.objectives ?? FALLBACK_OBJECTIVES;

	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.08, delayChildren: 0.1 },
		},
	};
	const itemVariants: Variants = {
		hidden: { opacity: 0, y: 12 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.4, ease: 'easeOut' },
		},
	};

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
				className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-card-lg border border-gray-200 bg-surface-page"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				{/* ── LEFT PANEL ─────────────────────────────────────────── */}
				<motion.div
					className="md:w-[400px] flex-shrink-0 flex flex-col overflow-hidden  border-b md:border-b-0 md:border-r border-gray-100 overflow-y-auto bg-surface-page"
					variants={itemVariants}
				>
					<div className="p-6 pb-4">
						{/* Unit badge */}
						<div className="mb-5 flex justify-between">
							<h2 className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-[10px] font-bold tracking-widest text-brand-600 uppercase">
								<CheckCircle2 className="size-3" />
								Integrity Assessment Unit
							</h2>
							{/* Close */}
							<button
								onClick={() => navigate('/city')}
								className="hidden md:block p-1.5 rounded-full bg-white/80 border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-white transition-colors shadow-sm"
								aria-label="Close"
							>
								<X className="size-4" />
							</button>
						</div>

						{/* Title */}
						<motion.div variants={itemVariants}>
							<h1 className="text-2xl font-black text-ink-deep leading-tight mb-0.5">
								{module?.name ?? 'Anti-Corruption'}
							</h1>
							<h2 className="text-xl font-black text-brand-500 leading-tight">
								Knowledge Test
							</h2>
							<p className="text-ink-subtle text-xs mt-2">
								{module?.audience ?? 'Private Sector & Civil Society'}
							</p>
						</motion.div>
					</div>
					<div className="flex-1 overflow-y-auto pb-4 p-6 space-y-2 border-t border-gray-100 bg-white">
						{/* Description */}
						{module?.description && (
							<p className="text-ink-muted text-xs leading-relaxed mb-5">
								{module.description}
							</p>
						)}
						{/* Module progress bar (if started) */}
						{module?.progress && module.progress.startedAt && (
							<motion.div className="mb-5" variants={itemVariants}>
								<div className="flex items-center justify-between mb-1.5">
									<p className="text-[10px] font-bold tracking-widest text-ink-subtle uppercase">
										Module Progress
									</p>
									<span className="text-xs font-bold text-brand-600">
										{module.progress.percentComplete}%
									</span>
								</div>
								<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
									<motion.div
										className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
										initial={{ width: 0 }}
										animate={{ width: `${module.progress.percentComplete}%` }}
										transition={{
											duration: 0.8,
											ease: 'easeOut',
											delay: 0.3,
										}}
									/>
								</div>
								<p className="text-[10px] text-ink-subtle mt-1">
									{module.progress.completedLessons} /{' '}
									{module.progress.totalLessons} lessons completed
								</p>
							</motion.div>
						)}
						{/* Learning objectives */}
						<motion.div className="py-3" variants={itemVariants}>
							<p className="text-[10px] font-bold tracking-widest text-ink-subtle uppercase mb-3">
								Learning Objectives
							</p>
							<ul className="space-y-2 md:space-y-4">
								{objectives.map((obj, i) => (
									<li
										key={i}
										className="flex items-start gap-2 text-xs text-ink-mid leading-relaxed"
									>
										<span className="mt-0.5 flex-shrink-0 size-4 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center">
											<CheckCircle2 className="size-2.5 text-brand-500" />
										</span>
										{obj}
									</li>
								))}
							</ul>
						</motion.div>

						{/* Previous best */}
						<motion.div
							className="mt-auto rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-center justify-between gap-2"
							variants={itemVariants}
						>
							<Medal className="size-5 text-amber-500" />
							<div className="flex-1  gap-2">
								<p className="text-[10px] font-bold tracking-widest text-amber-600/70 uppercase ">
									Previous Best · {lastDate}
								</p>
								<p className="text-base font-black text-ink-deep">
									{accuracy}% accuracy
								</p>
							</div>
							<div>
								<p className="text-xs font-black text-right text-ink-subtle">
									Earned
								</p>
								<span className="text-lg font-black text-amber-600">
									{highScore > 0 ? highScore : 325} KT
								</span>
							</div>
						</motion.div>
					</div>
					{/* Bottom nav */}
					<div className="px-6 py-4 border-t border-gray-100 bg-white">
						<button
							onClick={() => navigate('/city')}
							className="w-full text-center px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-ink-mid text-sm font-semibold hover:bg-gray-100 hover:text-ink-deep transition-colors whitespace-nowrap"
						>
							← Back to City
						</button>
					</div>
				</motion.div>

				{/* ── RIGHT PANEL ────────────────────────────────────────── */}
				<motion.div
					className="flex-1 flex flex-col overflow-hidden bg-surface-page"
					variants={itemVariants}
				>
					{/* Header */}
					<div className="px-6 pt-6 pb-4 border-b border-gray-100">
						<p className="text-[10px] font-bold tracking-widest text-ink-subtle uppercase mb-1">
							Choose Assessment
						</p>
						<p className="text-xs text-ink-muted">
							Complete assessments in order — some unlock only after
							prerequisites are passed.
						</p>
					</div>

					{/* Assessment list */}
					<div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
						{assessments.map((assessment, index) => (
							<motion.div key={assessment.id} variants={itemVariants}>
								<AssessmentCard
									assessment={assessment}
									index={index}
									selected={index === selectedIndex}
									onSelect={() => setSelectedIndex(index)}
									onStart={onStart}
								/>
							</motion.div>
						))}
					</div>

					{/* Bottom action bar */}
					<div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 bg-white">
						<motion.button
							onClick={onStart}
							disabled={selectedAssessment?.status === 'locked'}
							className="flex-1 py-3 rounded-xl font-bold text-center text-sm tracking-widest uppercase text-white flex items-center justify-center gap-2 shadow-md bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
							whileHover={{
								scale: 1.02,
								boxShadow: '0 6px 24px rgba(74,152,212,0.35)',
							}}
							whileTap={{ scale: 0.98 }}
						>
							Start
							{selectedAssessment
								? ` — ${selectedAssessment.title}`
								: module?.name
									? ` ${module.name}`
									: ' Quiz'}
							<ChevronRight className="size-4" />
						</motion.button>
					</div>
				</motion.div>
			</motion.div>
		</motion.div>
	);
};

export default WelcomeScreen;
