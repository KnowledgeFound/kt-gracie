import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShieldCheck, Zap, Trophy, Target, BookOpen, Flame, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useOptionalUser, useUser } from '@/features/auth';
import * as ProgressContainer from '@/services/progressContainerService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HealthModalProps {
	open: boolean;
	onClose: () => void;
	/** Live city health value from the City model */
	health: number;
}

interface BestAssessmentScore{
	score: number;
	maxScore: number;
}

interface ScoreDetails {
	currentScore: number;
	maxScore: number;
	percentage: number;
	encouragementMessage: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type TierInfo = { label: string; color: string; bg: string; bar: string; emoji: string; description: string };

function getTierInfo(health: number): TierInfo {
	if (health >= 85) return { label: 'Pristine',   color: 'text-emerald-700', bg: 'bg-emerald-50  border-emerald-200', bar: 'from-emerald-400 to-emerald-600', emoji: '🏙️', description: 'Your city is thriving. Keep learning to maintain it.' };
	if (health >= 65) return { label: 'Healthy',    color: 'text-brand-700',   bg: 'bg-brand-50    border-brand-200',   bar: 'from-brand-400   to-brand-600',   emoji: '🌆', description: 'Good shape. Regular assessments keep the city healthy.' };
	if (health >= 45) return { label: 'Fading',     color: 'text-amber-700',   bg: 'bg-amber-50    border-amber-200',   bar: 'from-amber-400   to-amber-500',   emoji: '🌇', description: 'Some neglect showing. Complete more subjects to recover.' };
	if (health >= 25) return { label: 'Neglected',  color: 'text-orange-700',  bg: 'bg-orange-50   border-orange-200',  bar: 'from-orange-400  to-rose-400',    emoji: '🏚️', description: 'City is struggling. Get back on track immediately.' };
	return               { label: 'Ruined',     color: 'text-rose-700',    bg: 'bg-rose-50     border-rose-200',    bar: 'from-rose-400    to-rose-600',    emoji: '💀', description: 'Critical condition! Complete assessments urgently.' };
}

function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
	return (
		<div className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl bg-gray-50 border border-gray-100">
			<span className={color}>{icon}</span>
			<span className="text-base font-black text-ink-deep leading-none">{value}</span>
			<span className="text-[9px] font-bold tracking-widest text-ink-subtle uppercase">{label}</span>
		</div>
	);
}

function AnimatedBar({ pct, colorClass }: { pct: number; colorClass: string }) {
	return (
		<div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
			<motion.div
				className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
				initial={{ width: 0 }}
				animate={{ width: `${pct}%` }}
				transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
			/>
		</div>
	);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HealthModal({ open, onClose, health }: HealthModalProps) {
	
	const user   = useOptionalUser();
	const pct    = Math.min(100, Math.max(0, health));
	const tier   = getTierInfo(pct);

	const { city } = useUser();

	const accuracy = 10; // Consult Leo about this
	const integrityScore = user?.gracie.integrityScore ?? 0;
	const streak         = 5; // Consult Leo about this
	const quizzes        = ProgressContainer.getNumberOfQuizzesCompleted();
	const highScore      = ProgressContainer.getTotalScore();
	const assessmentScore = city?.getFinalAssessmentScore() ?? 0;
	const contentScore = city?.getContentScore() ?? 0;

	const isWarning = pct < 45;

	const bestAssessmentScore: BestAssessmentScore = ProgressContainer.getTheBestAssessmentScore();
	const assessmentsCompleted = ProgressContainer.getNumberOfAssessmentsCompleted();
	const teachingsCompleted = ProgressContainer.getNumberOfTeachingsCompleted();
	const totalAssessments = ProgressContainer.getTotalNumberOfAssessments();
	const totalTeachings = ProgressContainer.getTotalNumberOfTeachings();

	const scoreDetails: ScoreDetails = ProgressContainer.getScoreDetails();

	return (
		<AnimatePresence>
			{open && (
				<>
					{/* Backdrop */}
					<motion.div
						key="backdrop"
						className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.18 }}
						onClick={onClose}
					/>

					{/* Modal */}
					<motion.div
						key="modal"
						className="fixed z-50 top-16 left-1/2 -translate-x-1/2 w-full max-w-sm mx-4 rounded-2xl overflow-hidden shadow-card-lg border border-gray-200 bg-white flex flex-col max-h-[82vh]"
						initial={{ opacity: 0, y: -12, scale: 0.97 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -8, scale: 0.97 }}
						transition={{ type: 'spring', stiffness: 340, damping: 30 }}
					>
						{/* ── Header ─────────────────────────────────────────── */}
						<div className="px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<Heart className="size-4 text-amber-500" />
									<span className="text-[11px] font-black tracking-widest text-ink-subtle uppercase">
										City Health
									</span>
								</div>
								<button
									onClick={onClose}
									className="p-1.5 rounded-full hover:bg-gray-100 text-ink-muted hover:text-ink-deep transition-colors"
									aria-label="Close"
								>
									<X className="size-4" />
								</button>
							</div>

							{/* Big health number */}
							<div className="flex items-end gap-3 mb-3">
								<span className="text-5xl select-none">{tier.emoji}</span>
								<div>
									<div className="flex items-baseline gap-1.5">
										<span className={`text-4xl font-black ${tier.color}`}>{pct}</span>
										<span className="text-lg font-bold text-ink-subtle">/ 100</span>
									</div>
									<div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-bold mt-1 ${tier.bg} ${tier.color}`}>
										{pct >= 65 ? <CheckCircle2 className="size-3" /> : <AlertTriangle className="size-3" />}
										{tier.label}
									</div>
								</div>
							</div>

							{/* Main health bar */}
							<AnimatedBar pct={pct} colorClass={tier.bar} />

							{/* Status text */}
							<p className="text-xs text-ink-muted mt-2 leading-relaxed">{tier.description}</p>
						</div>

						{/* ── Scrollable body ─────────────────────────────────── */}
						<div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

							{/* Warning banner */}
							{isWarning && (
								<motion.div
									className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200"
									initial={{ opacity: 0, scale: 0.97 }}
									animate={{ opacity: 1, scale: 1 }}
								>
									<AlertTriangle className="size-4 text-rose-500 shrink-0 mt-0.5" />
									<p className="text-xs text-rose-700 font-medium leading-relaxed">
										City health is low. Complete assessments and maintain your streak to recover.
									</p>
								</motion.div>
							)}

							{/* Stats grid */}
							<div className="grid grid-cols-4 gap-2">
								<StatPill icon={<Trophy className="size-4" />} label="Best Score"     value={`${bestAssessmentScore.score}/${bestAssessmentScore.maxScore}`} color="text-amber-500" />
								<StatPill icon={<Target className="size-4" />}  label="User Score" value={`${scoreDetails.currentScore}/${scoreDetails.maxScore}`}   color="text-brand-500" />
								<StatPill icon={<Flame className="size-4" />}   label="Assessments completed"   value={`${assessmentsCompleted}/${totalAssessments}`}     color="text-rose-500"  />
								<StatPill icon={<BookOpen className="size-4" />} label="Lessons completed" value={`${teachingsCompleted}/${totalTeachings}`}          color="text-purple-500"/>
							</div>

							{/* Sub-metrics */}
							<div className="space-y-3">
								<p className="text-[10px] font-black tracking-widest text-ink-subtle uppercase">
									City Health Factors
								</p>

								{/* Gracie integrity */}
								<div>
									<div className="flex items-center justify-between mb-1.5">
										<div className="flex items-center gap-1.5">
											<ShieldCheck className="size-3 text-emerald-500" />
											<span className="text-xs font-semibold text-ink-mid">Gracie Integrity</span>
										</div>
										<span className="text-xs font-bold text-ink-deep">{integrityScore}/100</span>
									</div>
									<AnimatedBar pct={integrityScore} colorClass="from-emerald-400 to-emerald-600" />
								</div>

								{/* Assessment score */}
								<div>
									<div className="flex items-center justify-between mb-1.5">
										<div className="flex items-center gap-1.5">
											<Target className="size-3 text-brand-500" />
											<span className="text-xs font-semibold text-ink-mid">Assessment Score</span>
										</div>
										<span className="text-xs font-bold text-ink-deep">{assessmentScore}/50</span>
									</div>
									<AnimatedBar pct={Math.min((assessmentScore / 50) * 100, 100)} colorClass="from-brand-400 to-brand-600" />
								</div>

								{/* Content score */}
								<div>
									<div className="flex items-center justify-between mb-1.5">
										<div className="flex items-center gap-1.5">
											<Flame className="size-3 text-amber-500" />
											<span className="text-xs font-semibold text-ink-mid">Content Score</span>
										</div>
										<span className="text-xs font-bold text-ink-deep">{contentScore} / 50</span>
									</div>
									<AnimatedBar pct={Math.min((contentScore / 50) * 100, 100)} colorClass="from-amber-400 to-orange-400" />
								</div>
							</div>

							{/* Gracie card */}
							{user && (
								<div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 border border-brand-100">
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 flex items-center justify-center text-xl shrink-0 select-none">
										🛡️
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-bold text-ink-deep truncate">
											{user.gracie.name || 'Gracie'}
										</p>
										<div className="flex items-center gap-3 mt-0.5 text-xs text-ink-muted">
											<span className="flex items-center gap-1">
												<ShieldCheck className="size-3" />
												{user.gracie.integrityScore}/100
											</span>
											<span className="flex items-center gap-1">
												<Zap className="size-3" />
												{user.gracie.interactionCount} interactions
											</span>
										</div>
									</div>
								</div>
							)}
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
