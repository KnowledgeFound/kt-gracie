import { modules } from '../constants';
import { Module } from '../types';
import { getModuleProgress } from '../mockProgress';

interface Props {
	onClickModule?: (id: number) => void;
}

export default function Modules({ onClickModule }: Props) {
	return (
		<>
			{/* ── Mobile: vertical timeline (< md) ── */}
			<MobileTimeline onClickModule={onClickModule} />

			{/* ── Desktop: absolute map overlay (md+) ── */}
			<DesktopMap onClickModule={onClickModule} />
		</>
	);
}

// ─── Mobile timeline ──────────────────────────────────────────────────────────

function MobileTimeline({ onClickModule }: Props) {
	return (
		<div className="top-16 md:top-0 md:hidden absolute inset-0 z-40 overflow-y-auto pointer-events-none">
			{/* Semi-transparent overlay so city bg is still visible */}
			<div className="min-h-full w-full bg-black/20 backdrop-blur-[2px] px-4 py-20">
				<div className="relative max-w-xs mx-auto">
					{/* Centre spine */}
					<div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-white/30 rounded-full" />

					{modules.map((module: Module, index: number) => {
						const isLeft = index % 2 === 0;
						const progress = getModuleProgress(module.id);
						const isStarted = progress !== null;
						const pct = progress?.percentComplete ?? 0;

						return (
							<div
								key={module.id}
								className={[
									'relative flex items-center mb-8 last:mb-0',
									isLeft ? 'flex-row' : 'flex-row-reverse',
								].join(' ')}
							>
								{/* Card — takes up ~45% width on each side */}
								<div className="w-[45%]">
									<ModuleCard
										module={module}
										isStarted={isStarted}
										pct={pct}
										align={isLeft ? 'right' : 'left'}
										onClick={() => onClickModule?.(module.id)}
									/>
								</div>

								{/* Spine dot + connector line */}
								<div className="w-[10%] flex flex-col items-center">
									{/* Dot */}
									<div
										className={[
											'w-4 h-4 rounded-full border-2 border-white z-10 shrink-0',
											isStarted ? 'bg-blue-500' : 'bg-white/60',
										].join(' ')}
									/>
								</div>

								{/* Spacer on the opposite side */}
								<div className="w-[45%]" />
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

// ─── Desktop map overlay ──────────────────────────────────────────────────────

function DesktopMap({ onClickModule }: Props) {
	return (
		<div className="hidden md:block absolute inset-0 z-40 w-full h-full pointer-events-none">
			{modules.map((module: Module) => {
				const progress = getModuleProgress(module.id);
				const isStarted = progress !== null;
				const pct = progress?.percentComplete ?? 0;

				return (
					<button
						key={module.id}
						onClick={() => onClickModule?.(module.id)}
						aria-label={`${module.name}${isStarted ? ` — ${pct}% complete` : ''}`}
						className="pointer-events-auto group bg-white/80 backdrop-blur-sm hover:backdrop-blur-lg rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-500/50 hover:text-white hover:shadow-brand-600 active:scale-95 px-3 py-3 flex items-center gap-1.5 absolute transition-all duration-150"
						style={{
							top: module.position.top ? `${module.position.top}%` : undefined,
							left: module.position.left
								? `${module.position.left}%`
								: undefined,
							right: module.position.right
								? `${module.position.right}%`
								: undefined,
							bottom: module.position.bottom
								? `${module.position.bottom}%`
								: undefined,
						}}
					>
						<MapButtonInner module={module} isStarted={isStarted} pct={pct} />
					</button>
				);
			})}
		</div>
	);
}

// ─── Shared card for mobile timeline ─────────────────────────────────────────

interface ModuleCardProps {
	module: Module;
	isStarted: boolean;
	pct: number;
	align: 'left' | 'right';
	onClick: () => void;
}

function ModuleCard({
	module,
	isStarted,
	pct,
	align,
	onClick,
}: ModuleCardProps) {
	const Icon = module.icon;

	return (
		<button
			onClick={onClick}
			aria-label={`${module.name}${isStarted ? ` — ${pct}% complete` : ''}`}
			className={[
				'pointer-events-auto w-full group flex flex-col gap-2 p-3 rounded-2xl',
				'bg-white/85 backdrop-blur-sm shadow-lg shadow-brand-500/20',
				'hover:bg-brand-500/80 active:scale-95 transition-all duration-150',
				align === 'right' ? 'items-end text-right' : 'items-start text-left',
			].join(' ')}
		>
			{/* Icon + progress ring */}
			<span className="relative shrink-0 mr-2">
				{isStarted && <ProgressRing pct={pct} size={36} stroke={3} />}
				<Icon className="w-4 h-4 text-brand-600 group-hover:text-white transition-colors" />
			</span>

			{/* Name */}
			<span className="font-semibold text-sm text-ink-deep group-hover:text-white leading-tight transition-colors">
				{module.name}
			</span>

			{/* Progress pill */}
			{isStarted && (
				<span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600 group-hover:bg-white/20 group-hover:text-white transition-colors">
					{pct}%
				</span>
			)}
		</button>
	);
}

// ─── Desktop button inner ─────────────────────────────────────────────────────

interface MapButtonInnerProps {
	module: Module;
	isStarted: boolean;
	pct: number;
}

function MapButtonInner({ module, isStarted, pct }: MapButtonInnerProps) {
	const Icon = module.icon;
	return (
		<>
			<span className="relative shrink-0 mr-2">
				{isStarted && <ProgressRing pct={pct} size={36} stroke={3} />}
				<Icon className="w-5 h-5 md:w-6 md:h-6 text-brand-600 group-hover:text-white transition-colors" />
			</span>
			<span className="font-medium text-sm md:text-base text-ink-deep group-hover:text-white">
				{module.name}
			</span>
			{isStarted && (
				<span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600 group-hover:bg-white/20 group-hover:text-white transition-colors shrink-0">
					{pct}%
				</span>
			)}
		</>
	);
}

// ─── Progress ring ────────────────────────────────────────────────────────────

interface ProgressRingProps {
	pct: number;
	size: number;
	stroke: number;
}

function ProgressRing({ pct, size, stroke }: ProgressRingProps) {
	const r = (size - stroke) / 2;
	const circ = 2 * Math.PI * r;
	const dash = circ * (pct / 100);

	return (
		<svg
			width={size}
			height={size}
			className="absolute inset-0 -rotate-90 -top-2 -left-2"
			aria-hidden="true"
		>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={r}
				fill="none"
				stroke="currentColor"
				strokeWidth={stroke}
				className="text-blue-100"
			/>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={r}
				fill="none"
				stroke="currentColor"
				strokeWidth={stroke}
				strokeDasharray={`${dash} ${circ}`}
				strokeLinecap="round"
				className="text-blue-500 transition-[stroke-dasharray] duration-700"
			/>
		</svg>
	);
}
