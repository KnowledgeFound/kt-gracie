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