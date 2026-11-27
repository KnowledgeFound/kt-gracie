import { useEffect, useState } from 'react';
import { ChevronRight, Lock } from 'lucide-react';
import { cityBlocks, isModuleLocked } from '../constants';
import { CityBlockId, Module } from '../types';
import { getAllModules } from '@/services/corpusService';
import { getResume, getUnitCompletionPercentage } from '@/services/progressContainerService';

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

	const [modules, setModules] = useState<Module[] | null>([]);

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
				setModules(null);
			}
		};

		fetchModules();
	}, []);

	if (modules === null) {
		return (
			<div className="flex h-full min-h-screen w-full items-center justify-center p-4">
				<div className="rounded-2xl border border-red-200/50 bg-white/80 p-6 text-center shadow-xl backdrop-blur-md">
					<p className="text-base font-semibold text-gray-800">
						Something went wrong
					</p>
					<p className="mt-1 text-sm text-gray-500">
						Failed to fetch city block data
					</p>
				</div>
			</div>
		);
	}
	
	if (modules.length === 0) {
		return (
			<div className="flex h-full min-h-screen w-full items-center justify-center p-4">
				<div className="flex flex-col items-center gap-3">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
					<p className="text-sm font-medium text-gray-600">Loading module data...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="cityModuleLayer">
			<div className="cityBlocks">
				{cityBlocks.map((block) => {
					const module = modules.find((m) => m.id === block.moduleId);
					if (!module) return null;

					// Real course progress, saved by the course flow (localStorage).
					const pct = getUnitCompletionPercentage(module.kuId);
					const isStarted = pct > 0 || getResume(module.kuId) !== null;
					const isActive =
						hoveredBlock === block.id || activeModuleId === module.id;
					// Fade with the district underneath when a sibling is hovered.
					const isDimmed = hoveredBlock !== null && hoveredBlock !== block.id;
					const locked = isModuleLocked(module.id);

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
									type="button"
									onClick={() => {
										if (!locked) onClickModule?.(module.id);
									}}
									onMouseEnter={() => onHoverModule?.(module.id)}
									onMouseLeave={() => onHoverModule?.(null)}
									onFocus={() => onHoverModule?.(module.id)}
									onBlur={() => onHoverModule?.(null)}
									aria-label={`${module.name}${
										isStarted ? ` — ${pct}% complete` : ''
									}`}
									aria-disabled={locked || undefined}
									title={module.name}
									className={[
										'cityPin pointer-events-auto',
										isActive ? 'cityPin--active' : '',
										locked ? 'cityPin--locked' : '',
										// Pins on the right of the map open leftwards so the
										// name never runs off the screen.
										block.anchor.x > 60 ? 'cityPin--left' : '',
									].join(' ')}
								>
									<MapPin
										module={module}
										isStarted={isStarted}
										pct={pct}
										locked={locked}
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

function ProgressRing({
	pct,
	size,
	stroke,
	className = '',
}: ProgressRingProps) {
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
				className="cityModuleRing__track text-blue-100"
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
				className="cityModuleRing__fill text-blue-500 transition-[stroke-dasharray] duration-700"
			/>
		</svg>
	);
}

// ─── Map pin ──────────────────────────────────────────────────────────────────

interface MapPinProps {
	module: Module;
	isStarted: boolean;
	pct: number;
	locked?: boolean;
}

/**
 * At rest a pin is just a glowing icon with a progress ring, so the map stays
 * clean. On hover / focus / while its drawer is open it slides out into a pill
 * with the district name, lesson progress and an arrow. Styling lives in
 * `.cityPin*` in city.css.
 */
function MapPin({ module, isStarted, pct, locked = false }: MapPinProps) {
	const Icon = module.icon;
	const total = module.lessons ?? 0;
	const done = Math.round((pct / 100) * total);
	const meta = locked
		? 'Coming soon'
		: total > 0
			? `${done}/${total} lessons`
			: isStarted
				? `${pct}% complete`
				: 'Start district';

	return (
		<>
			<span className="cityPin__marker">
				<ProgressRing pct={pct} size={58} stroke={3} className="cityPin__ring" />
				<Icon className="cityPin__icon" />
				{locked && (
					<span className="cityPin__lock" aria-hidden="true">
						<Lock className="w-2.5 h-2.5" />
					</span>
				)}
			</span>
			<span className="cityPin__pill" aria-hidden="true">
				<span className="cityPin__text">
					<span className="cityPin__name">{module.name}</span>
					<span className="cityPin__meta">{meta}</span>
				</span>
				{locked ? (
					<Lock className="cityPin__arrow" />
				) : (
					<ChevronRight className="cityPin__arrow" />
				)}
			</span>
		</>
	);
}
