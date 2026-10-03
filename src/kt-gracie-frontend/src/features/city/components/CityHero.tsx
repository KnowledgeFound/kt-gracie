import { BarChart3, Heart, MapPin } from 'lucide-react';
import {
	getCompletionPercentage,
	getNumberOfModulesCompleted,
	getProgressContainer,
} from '@/services/progressContainerService';
import { modules } from '../constants';

interface CityHeroProps {
	/** Corrupt or destroyed city: "Restore" wording instead of "Protect". */
	restore: boolean;
	tokens: number;
	health: number;
	/** Opens the full progress modal. */
	onOpenProgress?: () => void;
}

const RING_SIZE = 80;
const RING_STROKE = 8;

/**
 * Left-hand column of the city: the headline that frames what the learner is
 * doing here, and a small "Your Progress" card. Only laid out on large
 * screens (see `.cityHero` in city.css), where the map is pushed right to
 * make room; smaller screens keep the header's progress button instead.
 */
export default function CityHero({
	restore,
	tokens,
	health,
	onOpenProgress,
}: CityHeroProps) {
	const container = getProgressContainer();
	const modulesTotal = container?.arr_progress.length || modules.length;
	const modulesDone = getNumberOfModulesCompleted();
	const rawPct = container ? getCompletionPercentage() : 0;
	const pct = Number.isFinite(rawPct) ? Math.min(100, Math.max(0, rawPct)) : 0;
	const healthPct = Math.round(Math.min(100, Math.max(0, health)));

	const r = (RING_SIZE - RING_STROKE) / 2;
	const circ = 2 * Math.PI * r;

	return (
		<aside className="cityHero" aria-label="City overview">
			<p className="cityHero__kicker">Learn. Act. Protect.</p>
			<h1 className="cityHero__title">
				{restore ? 'Restore' : 'Protect'}
				<br />
				your <span className="cityHero__accent">City</span>
			</h1>
			<p className="cityHero__sub">
				{restore
					? 'Complete lessons to rebuild each district.'
					: 'Learn anti-corruption through interactive districts.'}
			</p>

			<button
				type="button"
				className="cityHero__card"
				onClick={onOpenProgress}
				aria-label={`Your progress: ${pct}% complete, ${modulesDone} of ${modulesTotal} modules, ${tokens} KT, ${healthPct}% integrity health. Open details`}
			>
				<span className="cityHero__cardHead">
					<BarChart3 className="size-4" aria-hidden="true" />
					Your Progress
				</span>

				<span className="cityHero__cardBody">
					<span className="cityHero__ring" aria-hidden="true">
						<svg
							width={RING_SIZE}
							height={RING_SIZE}
							viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
							className="-rotate-90"
						>
							<circle
								cx={RING_SIZE / 2}
								cy={RING_SIZE / 2}
								r={r}
								fill="none"
								strokeWidth={RING_STROKE}
								className="cityHero__ringTrack"
							/>
							<circle
								cx={RING_SIZE / 2}
								cy={RING_SIZE / 2}
								r={r}
								fill="none"
								strokeWidth={RING_STROKE}
								strokeLinecap="round"
								strokeDasharray={`${circ * (pct / 100)} ${circ}`}
								className="cityHero__ringFill transition-[stroke-dasharray] duration-700"
							/>
						</svg>
						<span className="cityHero__ringLabel">{pct}%</span>
					</span>

					<span className="cityHero__stats">
						<span className="cityHero__stat">
							<span className="cityHero__statIcon cityHero__statIcon--pin">
								<MapPin className="size-4" aria-hidden="true" />
							</span>
							<span>
								{modulesDone} / {modulesTotal} Modules
							</span>
						</span>
						<span className="cityHero__stat">
							<span className="cityHero__statIcon cityHero__statIcon--coin">
								<span className="text-[8px] font-black leading-none">KT</span>
							</span>
							<span>{tokens.toLocaleString()} KT</span>
						</span>
						<span className="cityHero__stat">
							<span className="cityHero__statIcon cityHero__statIcon--heart">
								<Heart className="size-4" aria-hidden="true" />
							</span>
							<span className="cityHero__statStack">
								<span>{healthPct}%</span>
								<small>Integrity Health</small>
							</span>
						</span>
					</span>
				</span>
			</button>
		</aside>
	);
}
