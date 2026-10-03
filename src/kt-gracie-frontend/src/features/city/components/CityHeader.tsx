import { BookOpen, ChevronDown, Home, TrendingUp, Trophy } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface CityHeaderProps {
	health: number;
	tokens: number;
	username: string;
	onClickHealth?: () => void;
	onClickToken?: () => void;
	/** Opens the progress modal. Only shown below `lg`, where the left-hand
	 *  progress widget is hidden. */
	onClickTrend?: () => void;
	onClickUser?: () => void;
}

/** Top-level pages that already exist. Add to this list as pages land. */
const NAV = [
	{ label: 'Home', to: '/city', icon: Home },
	//{ label: 'Subjects', to: '/subjects', icon: BookOpen },
	{ label: 'Leaderboard', to: '/leaderboard', icon: Trophy },
];

const PILL =
	'cityHeaderPill flex items-center rounded-full transition-all duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60';

/**
 * Glass bar across the top of the city: wordmark, primary nav (large screens
 * only — the drawer covers it elsewhere), and the KT / health / user badge
 * cluster. Colours come from the ink and brand tokens so the destroyed
 * city can restyle the whole bar from city.css.
 */
export default function CityHeader({
	health,
	tokens,
	username,
	onClickHealth,
	onClickToken,
	onClickTrend,
	onClickUser,
}: CityHeaderProps) {
	const pct = Math.round(Math.min(100, Math.max(0, health)));
	const initial = username.charAt(0).toUpperCase();

	return (
		<header className="cityHeader absolute top-0 left-0 right-0 z-20 animate-fadeSlideDown">
			<div className="cityHeaderBar mx-3 mt-3 md:mx-6 md:mt-4 rounded-2xl px-3 md:px-5 py-2 flex items-center gap-3">
				{/* ── Left: wordmark ─────────────────────────────────────── */}
				<div className="flex items-center gap-3 shrink-0">
					<span className="cityHeaderBrand font-black tracking-[0.22em] text-sm md:text-base select-none uppercase">
						Gracie
					</span>
					<span className="cityHeaderDivider hidden lg:block" aria-hidden="true" />
				</div>

				{/* ── Centre: primary nav ────────────────────────────────── */}
				<nav
					aria-label="Primary"
					className="hidden lg:flex flex-1 items-center justify-center gap-1"
				>
					{NAV.map(({ label, to, icon: Icon }) => (
						<NavLink
							key={to}
							to={to}
							end
							className={({ isActive }) =>
								`cityHeaderNavLink${isActive ? ' cityHeaderNavLink--active' : ''}`
							}
						>
							<Icon className="size-4" aria-hidden="true" />
							<span>{label}</span>
						</NavLink>
					))}
				</nav>

				{/* ── Right: badge cluster ───────────────────────────────── */}
				<div className="flex items-center gap-2 ml-auto">
					{/* KT tokens */}
					<button
						onClick={onClickToken}
						aria-label={`${tokens.toLocaleString()} Knowledge Tokens`}
						className={`${PILL} gap-1.5 px-3 py-1.5`}
					>
						<span className="cityHeaderCoin w-5 h-5 rounded-full flex items-center justify-center shrink-0">
							<span className="text-[8px] font-black leading-none">KT</span>
						</span>
						<span className="cityHeaderValue text-sm font-bold whitespace-nowrap">
							{tokens.toLocaleString()} KT
						</span>
					</button>

					{/* City health */}
					<button
						onClick={onClickHealth}
						aria-label={`City health ${pct}%`}
						className={`${PILL} gap-2 px-3 py-1.5`}
					>
						<svg
							width="15"
							height="14"
							viewBox="0 0 24 22"
							fill="none"
							aria-hidden="true"
							className="shrink-0"
						>
							<path
								d="M12 21s-9-5.5-9-12.5C3 4.5 5.5 2 8.5 2c1.74 0 3.41.81 4.5 2.09A6.04 6.04 0 0 1 17.5 2C20.5 2 23 4.5 23 8.5 23 15.5 12 21 12 21z"
								className="cityHeaderHeart"
							/>
						</svg>
						<span className="cityHeaderValue text-sm font-bold">{pct}%</span>
						<div
							className="cityHeaderHealthTrack h-1.5 w-12 lg:w-20 rounded-full overflow-hidden shrink-0"
							role="progressbar"
							aria-valuenow={pct}
							aria-valuemin={0}
							aria-valuemax={100}
						>
							<div
								className="cityHeaderHealthFill h-full rounded-full transition-[width] duration-700 ease-in-out"
								style={{ width: `${pct}%` }}
							/>
						</div>
					</button>

					{/* Progress — the sidebar widget covers this on large screens */}
					<button
						onClick={onClickTrend}
						className={`${PILL} p-1.5 lg:hidden`}
						aria-label="View progress"
					>
						<TrendingUp className="cityHeaderValue size-4" />
					</button>

					<span className="cityHeaderDivider" aria-hidden="true" />

					{/* User */}
					<button
						onClick={onClickUser}
						aria-label={`Open menu for ${username}`}
						className={`${PILL} gap-2 pl-1 pr-2.5 py-1`}
					>
						<span className="cityHeaderAvatar w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black text-xs select-none">
							{initial}
						</span>
						<span className="cityHeaderValue text-sm font-semibold max-w-[88px] truncate hidden sm:block">
							{username}
						</span>
						<ChevronDown className="cityHeaderValue size-4 opacity-70 hidden sm:block" aria-hidden="true" />
					</button>
				</div>
			</div>
		</header>
	);
}
