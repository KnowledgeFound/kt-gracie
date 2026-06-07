import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { modules } from '../constants';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ModuleDrawerProps {
	open: boolean;
	onClose: () => void;
	moduleId: number | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ModuleDrawer({
	open,
	onClose,
	moduleId,
}: ModuleDrawerProps) {
	const navigate = useNavigate();

	const module = modules.find((s) => s.id === moduleId) ?? null;

	function handleStartLearning() {
		if (!module) return;
		onClose();
		navigate(`/quiz/${module.id}`);
	}

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

					{/* ── Drawer panel — slides in from the right ── */}
					<motion.aside
						key="drawer"
						className="fixed top-0 right-0 h-full w-full md:w-[50%] max-w-lg z-50 flex flex-col bg-white shadow-2xl border-l-4 border-blue-500"
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', stiffness: 320, damping: 32 }}
					>
						{module ? (
							<>
								{/* ── Header ── */}
								<ModuleHeader module={module} onClose={onClose} />

								{/* ── Body ── */}
								<div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
									{/* Placeholder stats */}
									<section className="grid gap-3">
										<StatCard label="Lessons" value="12" />
										<StatCard label="Duration" value="~4h" />
										<StatCard label="Level" value="Beginner" />
										<StatCard label="XP Reward" value="500 XP" />
									</section>
								</div>

								{/* ── Footer ── */}
								<div className="px-5 py-4 border-t border-gray-100">
									<button
										onClick={handleStartLearning}
										className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium"
									>
										<span>Start Learning</span>
										<ArrowRight className="w-4 h-4 shrink-0" />
									</button>
								</div>
							</>
						) : (
							/* Fallback if no module matched */
							<div className="flex flex-col items-center justify-center flex-1 gap-4 text-ink-muted">
								<p>No module selected.</p>
								<button onClick={onClose} className="text-sm underline">
									Close
								</button>
							</div>
						)}
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ModuleHeaderProps {
	module: (typeof modules)[number];
	onClose: () => void;
}

function ModuleHeader({ module, onClose }: ModuleHeaderProps) {
	const Icon = module.icon;
	return (
		<div className="px-5 py-4 border-b border-gray-100 bg-blue-500 text-white">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3 min-w-0">
					{/* Icon circle */}
					<div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600/80 flex items-center justify-center shrink-0">
						<Icon className="w-5 h-5" />
					</div>

					<div className="">
						<h2 className="text-xl font-semibold truncate">{module.name}</h2>
					</div>
				</div>

				{/* Close */}
				<button
					onClick={onClose}
					aria-label="Close drawer"
					className="p-2 rounded-full bg-blue-500/80 hover:bg-blue-300/50 text-gray-200 hover:text-ink-deep transition-colors shrink-0"
				>
					<X className="w-5 h-5" />
				</button>
			</div>
			<p className="text-sm md:text-lg font-medium text-ink-base leading-relaxed mt-2">
				{module.description}
			</p>
		</div>
	);
}

interface StatCardProps {
	label: string;
	value: string;
}

function StatCard({ label, value }: StatCardProps) {
	return (
		<div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex flex-col gap-1">
			<span className="text-xs text-ink-muted">{label}</span>
			<span className="text-sm font-semibold text-ink-deep">{value}</span>
		</div>
	);
}
