import { cityBlocks, getModuleProgress, modules } from '../constants';
import { CityBlockId, Module } from '../types';

interface Props {
	onClickModule?: (id: number) => void;
	/** Fired when a map button is hovered (id) or un-hovered (null),
	 *  so the district image underneath can keep its hover glow. */
	onHoverModule?: (id: number | null) => void;
	/** District currently under the cursor — its button lights up with it. */
	hoveredBlock?: CityBlockId | null;
	/** Module whose drawer is open — its button stays lit. */
	activeModuleId?: number | null;
	/** Ride the district's bobbing animation. Off when the user has turned
	 *  floating districts off in Settings. */
	floating?: boolean;
}

/**
 * One button per district, laid out in the *same* stage box as the district
 * images (`.cityBlockGridWrapper > .cityBlocks`) and anchored to the block
 * geometry in constants.ts — so a button can never drift off its district,
 * whatever the viewport. Each also rides its district's float animation so
 * the pair moves as one.
 *
 * The stage scales with the viewport (see `.cityBlocks` in city.css), so the
 * same map serves phones too: below `md` the buttons switch to a compact
 * stacked pill (icon over a wrapped label) that fits the smaller stage.
 */
export default function Modules({
	onClickModule,
	onHoverModule,
	hoveredBlock = null,
	activeModuleId = null,
	floating = true,
}: Props) {
	return (
		<div className="cityModuleLayer">
			<div className="cityBlocks">
				{cityBlocks.map((block) => {
					const module = modules.find((m) => m.id === block.moduleId);
					if (!module) return null;

					const progress = getModuleProgress(module.id);
					const isStarted = progress !== null;
					const pct = progress?.percentComplete ?? 0;
					const isActive =
						hoveredBlock === block.id || activeModuleId === module.id;
					// Fade with the district underneath when a sibling is hovered.
					const isDimmed = hoveredBlock !== null && hoveredBlock !== block.id;

					return (
						<div
							key={module.id}
							className={`cityModuleAnchor${
								isDimmed ? ' cityModuleAnchor--dimmed' : ''
							}`}
							style={{ left: `${block.anchor.x}%`, top: `${block.anchor.y}%` }}
						>
							<div
								className={`cityModuleFloat${
									floating ? ` cityFloat--${block.float}` : ''
								}`}
							>
								<button
									onClick={() => onClickModule?.(module.id)}
									onMouseEnter={() => onHoverModule?.(module.id)}
									onMouseLeave={() => onHoverModule?.(null)}
									onFocus={() => onHoverModule?.(module.id)}
									onBlur={() => onHoverModule?.(null)}
									aria-label={`${module.name}${
										isStarted ? ` — ${pct}% complete` : ''
									}`}
									className={[
										'cityModuleBtn pointer-events-auto group flex flex-col md:flex-row items-center',
										'gap-0.5 md:gap-1.5 px-2 py-1.5 md:px-3 md:py-2.5 rounded-lg md:rounded-xl',
										'backdrop-blur-sm shadow-lg shadow-brand-500/20 active:scale-95',
										'transition-all duration-150',
										isActive
											? 'bg-brand-500/80 text-white shadow-brand-600 backdrop-blur-lg -translate-y-0.5'
											: 'bg-white/80 hover:bg-brand-500/60',
									].join(' ')}
								>
									<MapButtonInner
										module={module}
										isStarted={isStarted}
										pct={pct}
										isActive={isActive}
									/>
								</button>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

// ─── Progress ring ────────────────────────────────────────────────────────────

interface ProgressRingProps {
	pct: number;
	/** Geometry the ring is drawn in; the rendered size comes from `className`. */
	size: number;
	stroke: number;
	/** Tailwind width/height — lets the ring shrink on small screens. */
	className?: string;
}

function ProgressRing({ pct, size, stroke, className = '' }: ProgressRingProps) {
	const r = (size - stroke) / 2;
	const circ = 2 * Math.PI * r;
	const dash = circ * (pct / 100);

	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 ${className}`}
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

// ─── Map button inner ─────────────────────────────────────────────────────────

interface MapButtonInnerProps {
	module: Module;
	isStarted: boolean;
	pct: number;
	isActive: boolean;
}

function MapButtonInner({
	module,
	isStarted,
	pct,
	isActive,
}: MapButtonInnerProps) {
	const Icon = module.icon;
	return (
		<>
			<span className="relative shrink-0 flex items-center justify-center w-4 h-4 md:w-6 md:h-6 md:mr-2">
				{isStarted && (
					<ProgressRing
						pct={pct}
						size={36}
						stroke={3}
						className="w-6 h-6 md:w-9 md:h-9"
					/>
				)}
				<Icon
					className={`w-4 h-4 md:w-6 md:h-6 transition-colors ${
						isActive ? 'text-white' : 'text-brand-600 group-hover:text-white'
					}`}
				/>
			</span>
			<span
				className={`font-medium text-[11px] leading-tight md:text-base transition-colors ${
					isActive ? 'text-white' : 'text-ink-deep group-hover:text-white'
				}`}
			>
				{module.name}
			</span>
			{isStarted && (
				<span
					className={`md:ml-0.5 px-1 md:px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold transition-colors shrink-0 ${
						isActive
							? 'bg-white/20 text-white'
							: 'bg-blue-100 text-blue-600 group-hover:bg-white/20 group-hover:text-white'
					}`}
				>
					{pct}%
				</span>
			)}
		</>
	);
}
