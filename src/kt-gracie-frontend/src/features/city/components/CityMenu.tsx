import { motion, AnimatePresence } from 'framer-motion';
import {
	X,
	Trophy,
	Target,
	BookOpen,
	Flame,
	ShieldCheck,
	Zap,
	Heart,
} from 'lucide-react';
import { useOptionalUser } from '@/features/auth';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CityMenuProps {
	open: boolean;
	onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Left-side stats panel — shows city health, progression, Gracie, and city tier.
 */
export default function CityMenu({ open, onClose }: CityMenuProps) {
	const user = useOptionalUser();

	// Derived stat — safe even when user is null
	const accuracy =
		user && user.progression.totalAnswered > 0
			? Math.round(
					(user.progression.totalCorrect / user.progression.totalAnswered) * 100,
				)
			: 0;

	return (
		<AnimatePresence>
			{open && (
				<>
					{/* Backdrop */}
					<motion.div
						key="backdrop"
						className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={onClose}
					/>

					{/* Panel — slides in from the left */}
					<motion.aside
						key="panel"
						className="fixed top-0 left-0 h-full w-80 z-50 flex flex-col bg-surface-white shadow-card-lg overflow-hidden"
						initial={{ x: '-100%' }}
						animate={{ x: 0 }}
						exit={{ x: '-100%' }}
						transition={{ type: 'spring', stiffness: 320, damping: 32 }}
					>
						{/* Header */}
						<div
							className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0"
							style={{
								background:
									'linear-gradient(135deg, rgba(74,152,212,0.12) 0%, rgba(99,102,241,0.08) 100%)',
							}}
						>
							<h2 className="font-bold text-ink-deep text-lg">City Stats</h2>
							<button
								onClick={onClose}
								aria-label="Close stats panel"
								className="p-2 rounded-full hover:bg-gray-100 text-ink-muted hover:text-ink-deep transition-colors"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Scrollable content */}
						<div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
							{user ? (
								<>
									{/* Stat grid */}
									<div className="grid grid-cols-2 gap-3">
										<StatCard
											icon={<Trophy className="w-5 h-5 text-warning-400" />}
											label="High Score"
											value={`${user.progression.highScore}/10`}
											bg="bg-warning-50"
										/>
										<StatCard
											icon={<Target className="w-5 h-5 text-quiz-500" />}
											label="Accuracy"
											value={`${accuracy}%`}
											bg="bg-quiz-50"
										/>
										<StatCard
											icon={<BookOpen className="w-5 h-5 text-brand-500" />}
											label="Quizzes"
											value={user.progression.quizzesCompleted}
											bg="bg-brand-50"
										/>
										<StatCard
											icon={<Flame className="w-5 h-5 text-danger-500" />}
											label="Streak"
											value={`${user.progression.streakDays}d`}
											bg="bg-danger-50"
										/>
									</div>

									{/* Progress bars */}
									<Section title="Progress">
										<div className="space-y-3">
											<ProgressRow
												label="Quiz Accuracy"
												value={accuracy}
												max={100}
												color="bg-quiz-500"
											/>
											<ProgressRow
												label="City Health"
												value={user.city.health}
												max={100}
												color="bg-brand-500"
											/>
											<ProgressRow
												label="Gracie Integrity"
												value={user.gracie.integrityScore}
												max={100}
												color="bg-success-600"
											/>
										</div>
									</Section>

									{/* Gracie */}
									<Section title="Gracie">
										<div className="flex items-center gap-4 bg-quiz-50 rounded-badge p-4">
											<div className="w-12 h-12 rounded-full bg-gradient-to-br from-quiz-400 to-quiz-purple flex items-center justify-center text-2xl shrink-0">
												🛡️
											</div>
											<div className="min-w-0">
												<p className="font-semibold text-ink-deep">
													{user.gracie.name}
												</p>
												<div className="flex items-center gap-3 mt-1 text-sm text-ink-muted">
													<span className="flex items-center gap-1">
														<ShieldCheck className="w-3.5 h-3.5" />
														{user.gracie.integrityScore}/100
													</span>
													<span className="flex items-center gap-1">
														<Zap className="w-3.5 h-3.5" />
														{user.gracie.interactionCount}
													</span>
												</div>
											</div>
										</div>
									</Section>

									{/* City */}
									<Section title="Knowledge City">
										<div className="flex items-center gap-4 bg-brand-50 rounded-badge p-4">
											<div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-2xl shrink-0">
												🏙️
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between mb-2">
													<p className="font-semibold text-ink-deep">
														Tier {user.city.tier}
													</p>
													<span className="text-sm text-ink-muted flex items-center gap-1">
														<Heart className="w-3.5 h-3.5 text-brand-400" />
														{user.city.health}/100
													</span>
												</div>
												<div className="h-2 bg-brand-200 rounded-full overflow-hidden">
													<div
														className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-[width] duration-500"
														style={{ width: `${user.city.health}%` }}
													/>
												</div>
											</div>
										</div>
									</Section>
								</>
							) : (
								/* No profile yet */
								<div className="flex flex-col items-center justify-center h-48 text-center gap-3">
									<span className="text-4xl">🛡️</span>
									<p className="text-ink-muted text-sm">
										Create a profile to track your city stats.
									</p>
								</div>
							)}
						</div>
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
	icon,
	label,
	value,
	bg,
}: {
	icon: React.ReactNode;
	label: string;
	value: string | number;
	bg: string;
}) {
	return (
		<div className={`${bg} rounded-card p-4 flex items-center gap-3`}>
			<div className="shrink-0">{icon}</div>
			<div>
				<p className="text-xl font-bold text-ink-deep leading-none">{value}</p>
				<p className="text-xs text-ink-muted mt-0.5">{label}</p>
			</div>
		</div>
	);
}

function ProgressRow({
	label,
	value,
	max,
	color,
}: {
	label: string;
	value: number;
	max: number;
	color: string;
}) {
	const pct = Math.min(Math.round((value / max) * 100), 100);
	return (
		<div>
			<div className="flex justify-between text-sm mb-1">
				<span className="text-ink-muted">{label}</span>
				<span className="font-semibold text-ink-deep">
					{value}/{max}
				</span>
			</div>
			<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
				<div
					className={`h-full ${color} rounded-full transition-[width] duration-500`}
					style={{ width: `${pct}%` }}
				/>
			</div>
		</div>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-3">
			<h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
				{title}
			</h3>
			{children}
		</div>
	);
}
