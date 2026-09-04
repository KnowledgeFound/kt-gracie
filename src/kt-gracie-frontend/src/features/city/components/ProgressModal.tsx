import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, CheckCircle2, Circle } from 'lucide-react';
import { useOptionalUser } from '@/features/auth';
import { getNumberOfAssessments, getNumberOfModules } from '@/services/corpusService';
import * as ProgressContainer from '@/services/progressContainerService'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProgressModalProps {
	open: boolean;
	onClose: () => void;
}

interface AchievementDef {
	id: string;
	title: string;
	description: string;
}

// ─── Static achievement definitions ──────────────────────────────────────────

const ACHIEVEMENT_DEFS: AchievementDef[] = [
	{ id: 'first-steps',       title: 'First Steps',       description: 'Completed your first subject'    },
	{ id: 'quiz-master',       title: 'Quiz Master',        description: 'Scored 100% on an assessment'   },
	{ id: 'on-fire',           title: 'On Fire',            description: '7-day streak reached'           },
	{ id: 'half-way',          title: 'Half Way There',     description: '4 of 7 subjects done'           },
	{ id: 'perfect-semester',  title: 'Perfect Semester',   description: 'All subjects completed'         },
];

const TOTAL_ASSESSMENTS = ProgressContainer.getTotalNumberOfAssessments();
const TOTAL_TEACHINGS   = ProgressContainer.getTotalNumberOfTeachings();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ProgressBar({ value, color }: { value: number; color: string }) {
	const pct = Math.min(100, Math.max(0, value));
	return (
		<div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
			<motion.div
				className={`h-full rounded-full ${color}`}
				initial={{ width: 0 }}
				animate={{ width: `${pct}%` }}
				transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
			/>
		</div>
	);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProgressModal({ open, onClose }: ProgressModalProps) {
	const user = useOptionalUser();

	const streak        = 5; // consult Leo about this 
	const bestStreak    = Math.max(streak, 14); // fallback best
	const teachingsDone = ProgressContainer.getNumberOfTeachingsCompleted();
	const teachingsLeft = TOTAL_TEACHINGS - teachingsDone;
	const teachingsPct  = Math.round((teachingsDone / TOTAL_TEACHINGS) * 100);
	const assessDone    = ProgressContainer.getNumberOfAssessmentsCompleted();
	const assessLeft    = Math.max(0, TOTAL_ASSESSMENTS - assessDone);
	const assessPct     = Math.round((assessDone / TOTAL_ASSESSMENTS) * 100);

	// Which achievement IDs the user has earned
	const earnedIds = new Set(ProgressContainer.getAllAchievements().map(a => a.achievementId) ?? [
		'first-steps', 'quiz-master', 'on-fire', // fallback demo
	]);
	const earnedCount = earnedIds.size;

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
						className="fixed z-50 top-16 left-1/2 -translate-x-1/2 w-full max-w-sm mx-4 rounded-2xl overflow-hidden shadow-card-lg border border-gray-200 bg-white flex flex-col max-h-[80vh]"
						initial={{ opacity: 0, y: -12, scale: 0.97 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -8, scale: 0.97 }}
						transition={{ type: 'spring', stiffness: 340, damping: 30 }}
					>
						{/* ── Header ─────────────────────────────────────────── */}
						<div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
							<div className="flex items-center gap-2">
								<TrendingUp className="size-4 text-emerald-500" />
								<span className="text-[11px] font-black tracking-widest text-ink-subtle uppercase">
									Your Progress
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

						{/* ── Scrollable body ─────────────────────────────────── */}
						<div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

							{/* Streak card */}
							<div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between">
								<div className="flex items-center gap-3">
									<span className="text-2xl select-none">🔥</span>
									<div>
										<p className="text-2xl font-black text-amber-600 leading-none">
											{streak} days
										</p>
										<p className="text-xs text-amber-600/70 font-medium mt-0.5">
											Current streak
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-[9px] font-black tracking-widest text-ink-subtle uppercase">Best</p>
									<p className="text-lg font-black text-amber-500">{bestStreak} days</p>
								</div>
							</div>

							{/* Progress rows */}
							<div className="space-y-3">
								{/* Teachings */}
								<div>
									<div className="flex items-center justify-between">
										<span className="text-sm font-bold text-brand-600">Teachings</span>
										<span className="text-xs text-ink-muted">
											<span className="text-brand-600 font-bold">{teachingsDone} done</span>
											{' · '}{teachingsLeft} left{' '}
											<span className="font-bold text-ink-mid">{teachingsPct}%</span>
										</span>
									</div>
									<ProgressBar value={teachingsPct} color="bg-brand-500" />
								</div>

								{/* Assessments */}
								<div>
									<div className="flex items-center justify-between">
										<span className="text-sm font-bold text-purple-600">Assessments</span>
										<span className="text-xs text-ink-muted">
											<span className="text-purple-600 font-bold">{assessDone} done</span>
											{' · '}{assessLeft} left{' '}
											<span className="font-bold text-ink-mid">{assessPct}%</span>
										</span>
									</div>
									<ProgressBar value={assessPct} color="bg-purple-500" />
								</div>
							</div>

							{/* Achievements */}
							<div>
								<p className="text-[10px] font-black tracking-widest text-ink-subtle uppercase mb-3">
									Achievements · {earnedCount}/{ACHIEVEMENT_DEFS.length}
								</p>
								<div className="space-y-2">
									{ACHIEVEMENT_DEFS.map((def) => {
										const earned = earnedIds.has(def.id);
										return (
											<motion.div
												key={def.id}
												className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
													earned
														? 'bg-emerald-50 border-emerald-200'
														: 'bg-gray-50 border-gray-100 opacity-50'
												}`}
												initial={{ opacity: 0, x: -8 }}
												animate={{ opacity: earned ? 1 : 0.45, x: 0 }}
												transition={{ duration: 0.3 }}
											>
												{/* Icon */}
												<span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
													earned ? 'bg-emerald-500' : 'bg-gray-200'
												}`}>
													{earned
														? <CheckCircle2 className="size-4 text-white" />
														: <Circle className="size-4 text-gray-400" />
													}
												</span>
												{/* Text */}
												<div className="min-w-0">
													<p className={`text-sm font-bold leading-tight ${earned ? 'text-ink-deep' : 'text-ink-muted'}`}>
														{def.title}
													</p>
													<p className={`text-xs leading-tight mt-0.5 ${earned ? 'text-ink-muted' : 'text-gray-400'}`}>
														{def.description}
													</p>
												</div>
											</motion.div>
										);
									})}
								</div>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
