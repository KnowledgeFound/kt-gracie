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
	BookOpen,
	Target,
} from 'lucide-react';
import { useOptionalUser } from '@/features/auth';
import type {
	Module,
	ModuleAssessment,
	AssessmentStatus,
	AssessmentDifficulty,
} from '@/features/city/types';
import { useNavigate } from 'react-router-dom';

// ─── Props ────────────────────────────────────────────────────────────────────

interface WelcomeScreenProps {
	onStart: () => void;
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
}

function AssessmentCard({
	assessment,
	index,
	selected,
	onSelect,
}: AssessmentCardProps) {
	const isLocked = assessment.status === 'locked';
	const isCompleted = assessment.status === 'completed';
	const statusInfo = statusConfig[assessment.status];

	return (
		<motion.button
			onClick={() => {
				if (!isLocked) onSelect();
			}}
			disabled={isLocked}
			className={`
				w-full text-left p-3.5 rounded-xl border transition-all duration-200
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
					<div className="flex flex-wrap items-center gap-1.5 mb-1">
						<span
							className={`font-semibold text-sm leading-snug ${isLocked ? 'text-gray-400' : 'text-ink-deep'}`}
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
						className={`text-xs leading-relaxed mb-2.5 ${isLocked ? 'text-gray-300' : 'text-ink-muted'}`}
					>
						{assessment.description}
					</p>
					<div
						className={`flex items-center gap-3 text-[11px] ${isLocked ? 'text-gray-300' : 'text-ink-subtle'}`}
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
							{assessment.ktMax} KT
						</span>
						{assessment.ktEarned !== undefined && assessment.ktEarned > 0 && (
							<span className="ml-auto text-amber-600 font-bold">
								Earned: {assessment.ktEarned} KT
							</span>
						)}
					</div>
				</div>
			</div>
		</motion.button>
	);
}

// ─── Fallback objectives ──────────────────────────────────────────────────────

const FALLBACK_OBJECTIVES = [
	'Identify core definitions of corruption under UNCAC',
	'Distinguish between bribery, embezzlement, and nepotism',
	'Understand conflict-of-interest and asset-disclosure obligations',
	'Apply international cooperation principles to cross-border cases',
	'Recognise corporate compliance and due-diligence requirements',
];

// ─── Mobile tab type ──────────────────────────────────────────────────────────

type MobileTab = 'overview' | 'assessments';

// ─── Main component ───────────────────────────────────────────────────────────

const WelcomeScreen = ({ onStart, module }: WelcomeScreenProps) => {
	const user = useOptionalUser();
	const navigate = useNavigate();

	const assessments = module?.assessments ?? [];
	const [selectedIndex, setSelectedIndex] = useState(
		Math.max(
			0,
			assessments.findIndex((a) => a.status !== 'locked'),
		),
	);
	const [mobileTab, setMobileTab] = useState<MobileTab>('overview');

	const selectedAssessment = assessments[selectedIndex];

	const highScore = 100; // update later with actual high score from user data
	const lastTaken = 100; // update later with actual last taken date from user data
	const lastDate = new Date(); 
	const accuracy = 85; // update later with actual accuracy from user data

	const objectives = module?.objectives ?? FALLBACK_OBJECTIVES;

	const itemVariants: Variants = {
		hidden: { opacity: 0, y: 10 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.35, ease: 'easeOut' },
		},
	};
	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.07, delayChildren: 0.05 },
		},
	};

	// ── Shared left-panel content (reused in both layouts) ────────────────────
	const LeftPanelContent = (
		<div className="bg-white h-full">
			{/* Title block */}
			<div className="mb-4 md:mb-0 md:bg-surface-page md:p-6 pb-4">
				<span className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 rounded-full bg-brand-50 border border-brand-200 text-[10px] font-bold tracking-widest text-brand-600 uppercase">
					<CheckCircle2 className="size-3" />
					Integrity Assessment Unit
				</span>
				<h1 className="text-2xl font-black text-ink-deep leading-tight">
					{module?.name ?? 'Anti-Corruption'}
				</h1>
				<h2 className="text-xl font-black text-brand-500 leading-tight">
					Knowledge Test
				</h2>
				<p className="text-ink-subtle text-xs mt-1">
					{module?.audience ?? 'Private Sector & Civil Society'}
				</p>
			</div>
			<div className="md:flex-1 md:p-6 md:pt-4 md:overflow-y-auto h-full md:border-t border-gray-100">
				{/* Description */}
				{module?.description && (
					<p className="text-ink-muted text-xs leading-relaxed mb-4">
						{module.description}
					</p>
				)}

				{/* Progress bar */}
				{module?.progress?.startedAt && (
					<div className="mb-4">
						<div className="flex items-center justify-between mb-1">
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
								transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
							/>
						</div>
						<p className="text-[10px] text-ink-subtle mt-1">
							{module.progress.completedLessons} /{' '}
							{module.progress.totalLessons} lessons completed
						</p>
					</div>
				)}

				{/* Learning objectives */}
				<div className="mb-4">
					<p className="text-[10px] font-bold tracking-widest text-ink-subtle uppercase mb-2">
						Learning Objectives
					</p>
					<ul className="space-y-2">
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
				</div>

				{/* Previous best */}
				<div className="mt-auto rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-center gap-3">
					<Medal className="size-5 text-amber-500 flex-shrink-0" />
					<div className="flex-1 min-w-0">
						<p className="text-[10px] font-bold tracking-widest text-amber-600/70 uppercase">
							Previous Best · 
						</p>
						<p className="text-sm font-black text-ink-deep">
							{accuracy}% accuracy
						</p>
					</div>
					<div className="text-right flex-shrink-0">
						<p className="text-[10px] text-ink-subtle">Earned</p>
						<span className="text-base font-black text-amber-600">
							{highScore > 0 ? highScore : 325} KT
						</span>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<motion.div
			className="flex items-center justify-center min-h-screen relative bg-cover bg-center bg-fixed"
			style={{ backgroundImage: `url(${module?.image})` }}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			<div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

			{/* Close — always visible */}
			<button
				onClick={() => navigate('/city')}
				className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-white/80 border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-white transition-colors shadow-sm"
				aria-label="Close"
			>
				<X className="size-4" />
			</button>

			{/* ═══════════════════════════════════════════════════════════
			    MOBILE LAYOUT  (< md)
			    Full-screen sheet with tab switcher
			═══════════════════════════════════════════════════════════ */}
			<motion.div
				className="md:hidden relative z-10 w-full h-[100dvh] flex flex-col bg-white"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				{/* Mobile header */}
				<div className="flex-shrink-0 px-4 pt-12 pb-3 bg-white border-b border-gray-100">
					<h1 className="text-lg font-black text-ink-deep leading-tight">
						{module?.name ?? 'Anti-Corruption'}
					</h1>
					<p className="text-xs text-brand-500 font-bold">Knowledge Test</p>
				</div>

				{/* Tab bar */}
				<div className="flex-shrink-0 flex border-b border-gray-100 bg-white">
					{(
						[
							{ key: 'overview', label: 'Overview', Icon: BookOpen },
							{ key: 'assessments', label: 'Assessments', Icon: Target },
						] as { key: MobileTab; label: string; Icon: typeof Target }[]
					).map(({ key, label, Icon }) => (
						<button
							key={key}
							onClick={() => setMobileTab(key)}
							className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-colors border-b-2 ${
								mobileTab === key
									? 'border-brand-500 text-brand-600'
									: 'border-transparent text-ink-muted hover:text-ink-mid'
							}`}
						>
							<Icon className="size-3.5" />
							{label}
						</button>
					))}
				</div>

				{/* Tab content — scrollable */}
				<div className="flex-1 overflow-y-auto">
					{mobileTab === 'assessments' ? (
						<div className="p-4 space-y-3">
							<p className="text-[10px] font-bold tracking-widest text-ink-subtle uppercase">
								Choose Assessment
							</p>
							<p className="text-xs text-ink-muted -mt-1">
								Complete in order — some unlock after prerequisites are passed.
							</p>
							{assessments.map((assessment, index) => (
								<motion.div key={assessment.id} variants={itemVariants}>
									<AssessmentCard
										assessment={assessment}
										index={index}
										selected={index === selectedIndex}
										onSelect={() => setSelectedIndex(index)}
									/>
								</motion.div>
							))}
						</div>
					) : (
						<div className="p-4">{LeftPanelContent}</div>
					)}
				</div>

				{/* Mobile sticky footer */}
				<div className="flex-shrink-0 p-4 border-t border-gray-100 bg-white space-y-2 safe-area-bottom">
					<motion.button
						onClick={onStart}
						disabled={selectedAssessment?.status === 'locked'}
						className="w-full py-3.5 rounded-xl font-semibold text-sm tracking-widest uppercase text-white flex items-center justify-center gap-2 shadow-md bg-gradient-to-r from-brand-500 to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
						whileTap={{ scale: 0.98 }}
					>
						Start
						{selectedAssessment ? ` — ${selectedAssessment.title}` : ' Quiz'}
						<ChevronRight className="size-4" />
					</motion.button>
					<button
						onClick={() => navigate('/city')}
						className="w-full py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-ink-mid text-sm font-semibold"
					>
						← Back to City
					</button>
				</div>
			</motion.div>

			{/* ═══════════════════════════════════════════════════════════
			    DESKTOP LAYOUT  (md+)
			    Side-by-side modal, max-w-4xl, 90vh capped
			═══════════════════════════════════════════════════════════ */}
			<motion.div
				className="hidden md:flex relative z-10 w-full max-w-4xl mx-4 max-h-[90vh] flex-row rounded-2xl overflow-hidden shadow-card-lg border border-gray-200 bg-surface-page"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				{/* ── Left panel ──────────────────────────────────────── */}
				<motion.div
					className="w-[360px] flex-shrink-0 flex flex-col overflow-hidden border-r border-gray-100 bg-surface-page"
					variants={itemVariants}
				>
					{/* Scrollable body */}
					<div className="flex-1 overflow-y-auto flex flex-col">
						{LeftPanelContent}
					</div>
					{/* Footer */}
					<div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white">
						<button
							onClick={() => navigate('/city')}
							className="w-full py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-ink-mid text-sm font-semibold hover:bg-gray-100 hover:text-ink-deep transition-colors"
						>
							← Back to City
						</button>
					</div>
				</motion.div>

				{/* ── Right panel ─────────────────────────────────────── */}
				<motion.div
					className="flex-1 flex flex-col overflow-hidden bg-surface-page"
					variants={itemVariants}
				>
					{/* Header */}
					<div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-100">
						<p className="text-[10px] font-bold tracking-widest text-ink-subtle uppercase mb-0.5">
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
								/>
							</motion.div>
						))}
					</div>

					{/* Start CTA */}
					<div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white">
						<motion.button
							onClick={onStart}
							disabled={selectedAssessment?.status === 'locked'}
							className="w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase text-white flex items-center justify-center gap-2 shadow-md bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
