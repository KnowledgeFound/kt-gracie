import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useUser } from '@/features/auth';
import { fetchAccount } from '@/services/knowledgeTokenService';
import type { Transaction } from '@/types/types';

interface TokenModalProps {
	open: boolean;
	onClose: () => void;
}

type LoadState =
	| { status: 'loading' }
	| { status: 'error'; message: string }
	| { status: 'ready'; balance: bigint; transactions: Transaction[] };

/**
 * Knowledge Token modal — opened by tapping the tokens badge.
 *
 * Fetches the authoritative balance (and transaction history) from the
 * backend ledger only when the modal is opened, so the app doesn't ping
 * the canister on every render.
 */
export default function TokenModal({ open, onClose }: TokenModalProps) {
	const { user, updateTokenBalance } = useUser();
	const [state, setState] = useState<LoadState>({ status: 'loading' });
	const [reloadKey, setReloadKey] = useState(0);

	// Use the stable anonymousId (not the `user` object) as a dependency so the
	// setUser() from updateTokenBalance doesn't re-trigger the fetch.
	const userId = user?.anonymousId ?? null;

	useEffect(() => {
		if (!open) return;
		let cancelled = false;

		setState({ status: 'loading' });

		(async () => {
			if (!userId) {
				setState({ status: 'ready', balance: 0n, transactions: [] });
				return;
			}
			try {
				const { balance, transactions } = await fetchAccount(userId);
				if (cancelled) return;
				// Sync the authority balance into the local cache + context so the
				// header badge reflects it right away.
				updateTokenBalance(Number(balance));
				setState({ status: 'ready', balance, transactions });
			} catch (err) {
				if (cancelled) return;
				setState({
					status: 'error',
					message: err instanceof Error ? err.message : 'Something went wrong',
				});
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [open, reloadKey, userId, updateTokenBalance]);

	return (
		<AnimatePresence>
			{open && (
				<>
					{/* ── Backdrop ── */}
					<motion.div
						key="backdrop"
						className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={onClose}
					/>

					{/* ── Modal panel ── */}
					<div
						key="modal"
						className="fixed inset-0 z-50 flex items-center justify-center p-4"
					>
						<motion.div
							className="w-full max-w-md bg-surface-white rounded-2xl shadow-card-lg overflow-hidden"
							initial={{ opacity: 0, scale: 0.95, y: 16 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 16 }}
							transition={{ type: 'spring', stiffness: 320, damping: 30 }}
						>
							{/* Header */}
							<div
								className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
								style={{
									background:
										'linear-gradient(135deg, rgba(74,152,212,0.12) 0%, rgba(99,102,241,0.08) 100%)',
								}}
							>
								<h2 className="font-bold text-ink-deep text-lg">
									Knowledge Tokens
								</h2>
								<button
									onClick={onClose}
									aria-label="Close tokens modal"
									className="p-2 rounded-full hover:bg-gray-100 text-ink-muted hover:text-ink-deep transition-colors"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							{/* Body */}
							<div className="p-5 space-y-5">
								{state.status === 'loading' && (
									<div className="flex flex-col items-center justify-center py-14 gap-3">
										<Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
										<p className="text-sm text-ink-muted">
											Fetching your balance…
										</p>
									</div>
								)}

								{state.status === 'error' && (
									<div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
										<AlertCircle className="w-8 h-8 text-danger-500" />
										<p className="text-sm text-ink-muted">
											Couldn&apos;t load your balance: {state.message}
										</p>
										<button
											onClick={() => setReloadKey((k) => k + 1)}
											className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:shadow-md transition-all"
										>
											<RefreshCw className="w-4 h-4" />
											Retry
										</button>
									</div>
								)}

								{state.status === 'ready' && (
									<>
										{/* Balance hero */}
										<div className="flex items-center gap-4 bg-brand-50 rounded-card p-5">
											<div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-200 via-brand-700 to-brand-500 flex items-center justify-center shadow-coin shrink-0">
												<div className="w-10 h-10 rounded-full border-2 border-white/55 flex items-center justify-center">
													<span className="text-coin-label text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">
														KT
													</span>
												</div>
											</div>
											<div>
												<p className="text-xs text-ink-muted uppercase tracking-[0.6px]">
													Balance
												</p>
												<p className="text-3xl font-bold text-ink-deep leading-tight">
													{Number(state.balance).toLocaleString()}
												</p>
											</div>
										</div>

										{/* Transaction history */}
										<div>
											<h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
												Transaction History
											</h3>
											{state.transactions.length === 0 ? (
												<p className="text-sm text-ink-muted bg-gray-50 rounded-badge px-4 py-6 text-center">
													No transactions yet. Earn tokens by learning!
												</p>
											) : (
												<ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
													{state.transactions.map((tx, i) => (
														<TransactionRow key={i} tx={tx} />
													))}
												</ul>
											)}
										</div>
									</>
								)}
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TransactionRow({ tx }: { tx: Transaction }) {
	const isCredit = tx.from === 'system';
	const signed = isCredit ? `+${tx.amount}` : `-${tx.amount}`;
	const counterpart = isCredit ? tx.to : tx.from;

	return (
		<li className="flex items-center justify-between gap-3 bg-white border border-gray-100 rounded-badge px-4 py-3">
			<div className="flex items-center gap-3 min-w-0">
				<div
					className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
						isCredit ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-500'
					}`}
				>
					<span className="text-sm font-bold">
						{isCredit ? '↑' : '↓'}
					</span>
				</div>
				<div className="min-w-0">
					<p
						className={`font-semibold text-sm ${signed.startsWith('+') ? 'text-success-600' : 'text-danger-500'}`}
					>
						{signed} KT
					</p>
					<p className="text-xs text-ink-muted truncate capitalize">
						{tx.txType}
						{tx.reference ? ` · ${tx.reference}` : ''} ·{' '}
						{formatDate(tx.createdAt)}
					</p>
				</div>
			</div>
			<span className="text-[10px] text-ink-muted shrink-0 truncate max-w-[80px]">
				{counterpart === 'system' ? 'system' : 'you'}
			</span>
		</li>
	);
}

// BigInt nanoseconds-since-epoch -> human-readable local date
function formatDate(nanoseconds: bigint): string {
	return new Date(Number(nanoseconds) / 1e6).toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}
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
