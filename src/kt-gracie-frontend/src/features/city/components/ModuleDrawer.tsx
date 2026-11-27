import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Module } from '../types';
import { getAllModules } from '@/services/corpusService';
import { useReadingLevel } from '@/features/settings';
import { getResume, getUnitCompletionPercentage } from '@/services/progressContainerService';
import { useModuleImage } from '../hooks/useModuleImage';

// const CITY_SRC = '/assets/city/city.png';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ModuleDrawerProps {
	open: boolean;
	onClose: () => void;
	moduleId: number | null;
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function ModuleDrawer({
	open,
	onClose,
	moduleId,
}: ModuleDrawerProps) {
	const navigate = useNavigate();

	const [modules, setModules ] = useState<Module[]>([])

	useEffect(() => {
		async function fetchModules(){
			try{
				const res = await getAllModules();

				//console.log("fetching modules", res);

				if(res){
					setModules(res);
				}
			}
			catch(err){
				console.error("Failed to load Modules: ", err);
			};
		};

		fetchModules();
	}, []);

	const module = modules.find((m) => m.id === moduleId) ?? null;

	function handleCTA() {
		if (!module) return;
		onClose();
		navigate(`/course/${module.id}`);
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

					{/* ── Drawer ── */}
					<motion.aside
						key="drawer"
						role="dialog"
						aria-modal="true"
						aria-label={module?.name ?? 'Module details'}
						className="fixed top-0 right-0 h-full w-full md:w-[50%] max-w-lg z-50 flex flex-col bg-white shadow-2xl"
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', stiffness: 320, damping: 32 }}
					>
						{module ? (
							<>
								{/* Header image and body scroll together, so the art never
								    crowds out what the module covers. */}
								<div className="flex-1 overflow-y-auto">
									<ModuleHeader module={module} onClose={onClose} />
									<ModuleBody module={module} />
								</div>

								<DrawerFooter onCTA={handleCTA} kuId={module.kuId} />
							</>
						) : (
							<div className="flex flex-col items-center justify-center flex-1 gap-4 text-ink-muted p-6">
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

// ─── Header ───────────────────────────────────────────────────────────────────

interface ModuleHeaderProps {
	module: Module;
	onClose: () => void;
}

/** The module art as a banner, with the full title laid over it. */
function ModuleHeader({ module, onClose }: ModuleHeaderProps) {
	const art = useModuleImage(module);
	const [loading, setLoading] = useState(true);

	return (
		<div className="relative h-56 bg-ink-deep overflow-hidden">
			{loading && <div className="absolute inset-0 animate-pulse bg-gray-300" />}
			{art && (
				<img
					src={art}
					alt=""
					decoding="async"
					onLoad={() => setLoading(false)}
					onError={() => setLoading(false)}
					className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
						loading ? 'opacity-0' : 'opacity-100'
					}`}
				/>
			)}
			{/* Darkens the bottom so the title stays readable on any artwork */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/80" />

			<button
				onClick={onClose}
				aria-label="Close drawer"
				className="absolute top-3.5 right-3.5 w-11 h-11 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/55 transition-colors"
			>
				<X className="w-[18px] h-[18px]" />
			</button>

			<div className="absolute inset-x-6 bottom-5 text-white">
				<p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-100 mb-1.5">
					{module.audience || 'Module'}
				</p>
				<h2 className="text-[26px] font-bold leading-tight tracking-tight">{module.name}</h2>
			</div>
		</div>
	);
}

// ─── Body ─────────────────────────────────────────────────────────────────────

function ModuleBody({ module }: { module: Module }) {
	const { t } = useReadingLevel();
	const facts = [`${module.lessons} lessons`, module.duration, module.level].filter(Boolean);

	return (
		<section className="px-6 pt-5 pb-6 space-y-5">
			<div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[13px] font-medium text-ink-muted">
				{facts.map((fact, i) => (
					<span key={fact} className="flex items-center gap-3.5">
						{i > 0 && <span aria-hidden="true">·</span>}
						{fact}
					</span>
				))}
				<span className="ml-auto px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
					+{module.ktReward} KT
				</span>
			</div>

			<p className="text-[15px] leading-relaxed text-ink-deep">{t(module.description)}</p>

			<hr className="border-gray-100" />

			<div>
				<h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted mb-3.5">
					In this module
				</h3>
				<ol className="space-y-3.5">
					{t(module.expectations).map((item, index) => (
						<li key={index} className="flex items-baseline gap-3.5">
							<span className="w-5 shrink-0 text-[13px] font-semibold text-blue-600 tabular-nums">
								{String(index + 1).padStart(2, '0')}
							</span>
							<span className="text-[15px] leading-snug text-ink-deep">{item}</span>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function DrawerFooter({ onCTA, kuId }: { onCTA: () => void; kuId: string }) {
	const percent = getUnitCompletionPercentage(kuId);
	const started = getResume(kuId) !== null || percent > 0;
	const label = percent >= 100 ? 'Review module' : started ? 'Continue learning' : 'Start learning';

	return (
		<div className="px-6 pt-4 pb-5 border-t border-gray-100 shrink-0 bg-white space-y-3">
			{started && (
				<div className="flex items-center gap-3 text-xs text-ink-muted">
					<div
						className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden"
						role="progressbar"
						aria-label="Your progress"
						aria-valuenow={percent}
						aria-valuemin={0}
						aria-valuemax={100}
					>
						<div className="h-full bg-brand-500 transition-all" style={{ width: `${percent}%` }} />
					</div>
					<span className="font-semibold tabular-nums">{percent}%</span>
				</div>
			)}
			<button
				onClick={onCTA}
				className="w-full h-[52px] flex items-center justify-center gap-2 rounded-xl text-white font-semibold transition-colors bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
			>
				<span>{label}</span>
				<ArrowRight className="w-4 h-4 shrink-0" />
			</button>
		</div>
	);
}
