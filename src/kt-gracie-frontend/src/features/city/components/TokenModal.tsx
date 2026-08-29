import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, TrendingUp } from 'lucide-react';
import { useOptionalUser } from '@/features/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TokenModalProps {
	open: boolean;
	onClose: () => void;
}

interface TxRow {
	id: string;
	amount: number;
	type: 'reward' | 'spend';
	source: string;
	date: string;
}


// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
	try {
		return new Date(iso).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		}) + ' · ' + new Date(iso).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
		});
	} catch {
		return iso;
	}
}

function truncateId(id: string): string {
	if (id.length <= 10) return id;
	return `${id.slice(0, 6)}…${id.slice(-3)}`;
}

/** Derive mock transaction rows from real assessment results */
function buildTransactions(tokenBalance: number): TxRow[] {
	// const rows: TxRow[] = results.map((r) => ({
	// 	id: r.assessmentId,
	// 	amount: r.passed ? Math.round((r.score / r.maxScore) * 100) : -10,
	// 	type: r.passed ? 'reward' : 'spend',
	// 	source: r.assessmentId || r.subjectId || 'assessment',
	// 	date: r.takenAt,
	// }));

	return [
		{ id: 'tx-1', amount: 100, type: 'reward', source: 'assessment-101', date: new Date(Date.now() - 86400000 * 3).toISOString() },
		{ id: 'tx-2', amount: 50,  type: 'reward', source: 'subject-COS301', date: new Date(Date.now() - 86400000 * 2).toISOString() },
		{ id: 'tx-3', amount: -30, type: 'spend',  source: '—',              date: new Date(Date.now() - 86400000 * 1).toISOString() },
	];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TokenModal({ open, onClose }: TokenModalProps) {
	const user = useOptionalUser();

	const balance   = user?.tokenBalance ?? 340;
	const userId    = user?.anonymousId  ?? 'kt-a3f2…9c1';
	const txRows    = buildTransactions(balance);
	const totalEarned = txRows.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
	const totalSpent  = Math.abs(txRows.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
	const lastActivity = txRows.length > 0
		? new Date(txRows[txRows.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
		: '—';

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
						<div className="px-5 pt-5 pb-4 border-b border-gray-100">
							{/* Title row */}
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-2">
									{/* KT coin */}
									<span className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-200 via-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
										<span className="text-[8px] font-black text-white">KT</span>
									</span>
									<span className="text-[11px] font-black tracking-widest text-ink-subtle uppercase">
										KT Wallet
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

							{/* Balance */}
							<div className="flex items-baseline gap-1.5 mb-2">
								<span className="text-4xl font-black text-amber-500">{balance.toLocaleString()}</span>
								<span className="text-lg font-bold text-ink-subtle">KT</span>
							</div>

							{/* Profile link */}
							<p className="text-xs text-ink-muted mb-0.5">Linked to your profile</p>
							<p className="text-xs font-mono text-ink-mid">ID: {truncateId(userId)}</p>

							{/* Sync badge */}
							<div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold">
								<span className="size-1.5 rounded-full bg-emerald-500" />
								Balance synced from server
							</div>
						</div>

						{/* ── Stats row ──────────────────────────────────────── */}
						<div className="px-5 py-4 grid grid-cols-3 gap-3 border-b border-gray-100">
							{[
								{ label: 'TOTAL EARNED',   value: `+${totalEarned} KT`, color: 'text-emerald-600' },
								{ label: 'TOTAL SPENT',    value: `-${totalSpent} KT`,  color: 'text-rose-500'    },
								{ label: 'LAST ACTIVITY',  value: lastActivity,          color: 'text-ink-deep'    },
							].map(({ label, value, color }) => (
								<div key={label}>
									<p className="text-[9px] font-bold tracking-widest text-ink-subtle uppercase mb-1">{label}</p>
									<p className={`text-sm font-black ${color}`}>{value}</p>
								</div>
							))}
						</div>

						{/* ── Transaction history ─────────────────────────────── */}
						<div className="flex-1 overflow-y-auto">
							<div className="px-5 pt-4 pb-2">
								<p className="text-[10px] font-black tracking-widest text-ink-subtle uppercase mb-3">
									Transaction History
								</p>
								<div className="space-y-2">
									{txRows.map((tx) => {
										const isReward = tx.amount > 0;
										return (
											<div
												key={tx.id}
												className={`flex items-center gap-3 p-3 rounded-xl border ${
													isReward
														? 'bg-emerald-50 border-emerald-100'
														: 'bg-rose-50 border-rose-100'
												}`}
											>
												{/* Icon */}
												<span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
													isReward ? 'bg-emerald-500' : 'bg-rose-500'
												}`}>
													{isReward
														? <Plus className="size-3.5 text-white" />
														: <Minus className="size-3.5 text-white" />
													}
												</span>

												{/* Amount + tag */}
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 flex-wrap">
														<span className={`text-base font-black ${isReward ? 'text-emerald-600' : 'text-rose-600'}`}>
															{isReward ? '+' : ''}{tx.amount} KT
														</span>
														<span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase ${
															isReward
																? 'bg-brand-100 text-brand-700'
																: 'bg-amber-100 text-amber-700'
														}`}>
															{isReward ? 'Reward' : 'Spend'}
														</span>
														<span className="ml-auto text-[10px] text-ink-subtle whitespace-nowrap">
															{formatDate(tx.date)}
														</span>
													</div>
													<p className="text-[11px] text-ink-muted mt-0.5 truncate">{tx.source}</p>
												</div>
											</div>
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
