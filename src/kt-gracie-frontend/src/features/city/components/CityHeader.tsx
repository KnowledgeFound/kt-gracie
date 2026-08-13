import { Settings, TrendingUp } from 'lucide-react';

interface CityHeaderProps {
	health: number;
	tokens: number;
	username: string;
	onClickHealth?: () => void;
	onClickToken?: () => void;
	onClickTrend?: () => void;
	onClickUser?: () => void;
	onClickSettings?: () => void;
}

export default function CityHeader({
	health,
	tokens,
	username,
	onClickHealth,
	onClickToken,
	onClickTrend,
	onClickUser,
	onClickSettings,
}: CityHeaderProps) {
	const pct     = Math.min(100, Math.max(0, health));
	const initial = username.charAt(0).toUpperCase();

	return (
		<header className="absolute top-0 left-0 right-0 z-20 animate-fadeSlideDown">
			{/* Glass bar */}
			<div
				className="mx-3 mt-3 md:mx-6 md:mt-4 rounded-2xl px-4 py-2 flex items-center justify-between gap-3"
				style={{
					background: 'rgba(180, 215, 235, 0.45)',
					backdropFilter: 'blur(16px)',
					WebkitBackdropFilter: 'blur(16px)',
					boxShadow: '0 2px 16px rgba(56,152,216,0.10), inset 0 1px 0 rgba(255,255,255,0.45)',
					border: '1px solid rgba(255,255,255,0.35)',
				}}
			>
				{/* ── Left: wordmark ─────────────────────────────────────── */}
				<span className="text-white font-black tracking-[0.18em] text-sm md:text-base select-none drop-shadow-sm uppercase">
					Gracie
				</span>

				{/* ── Right: badge cluster ───────────────────────────────── */}
				<div className="flex items-center gap-2">

					{/* KT Tokens pill */}
					<button
						onClick={onClickToken}
						aria-label={`${tokens.toLocaleString()} Knowledge Tokens`}
						className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
						style={{
							background: 'rgba(255,255,255,0.30)',
							border: '1px solid rgba(255,255,255,0.40)',
						}}
					>
						{/* KT coin */}
						<span className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-200 via-brand-500 to-brand-700 flex items-center justify-center shadow-sm shrink-0">
							<span className="text-[8px] font-black text-white leading-none">KT</span>
						</span>
						<span className="text-sm font-bold text-white drop-shadow-sm whitespace-nowrap">
							{tokens.toLocaleString()} KT
						</span>
					</button>

					{/* Divider */}
					<div className="w-px h-4 bg-white/30 hidden md:block" />

					{/* Health pill */}
					<button
						onClick={onClickHealth}
						aria-label={`City health ${pct}%`}
						className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
						style={{
							background: 'rgba(255,255,255,0.30)',
							border: '1px solid rgba(255,255,255,0.40)',
						}}
					>
						{/* Heart icon */}
						<svg width="14" height="13" viewBox="0 0 24 22" fill="none" aria-hidden="true" className="shrink-0">
							<path
								d="M12 21s-9-5.5-9-12.5C3 4.5 5.5 2 8.5 2c1.74 0 3.41.81 4.5 2.09A6.04 6.04 0 0 1 17.5 2C20.5 2 23 4.5 23 8.5 23 15.5 12 21 12 21z"
								fill="rgb(251 191 36)"
							/>
						</svg>

						{/* Percentage */}
						<span className="text-sm font-bold text-white drop-shadow-sm">{pct}%</span>

						{/* Bar */}
						<div
							className="h-1.5 w-14 md:w-20 rounded-full overflow-hidden shrink-0"
							style={{ background: 'rgba(255,255,255,0.25)' }}
							role="progressbar"
							aria-valuenow={pct}
							aria-valuemin={0}
							aria-valuemax={100}
						>
							<div
								className="h-full rounded-full transition-[width] duration-700 ease-in-out"
								style={{
									width: `${pct}%`,
									background: 'linear-gradient(90deg, #f59e0b, #fb923c)',
								}}
							/>
						</div>
					</button>

					{/* Divider */}
					<div className="w-px h-4 bg-white/30 hidden md:block" />

					{/* Trend arrow — icon-only pill */}
					<button
						onClick={onClickTrend}
						className="p-1.5 rounded-full transition-all duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
						style={{
							background: 'rgba(255,255,255,0.30)',
							border: '1px solid rgba(255,255,255,0.40)',
						}}
						aria-label="View trend"
					>
						<TrendingUp className="size-4 text-white drop-shadow-sm" />
					</button>

					{/* Divider */}
					<div className="w-px h-4 bg-white/30" />

					{/* User pill */}
					<button
						onClick={onClickUser}
						aria-label={`Open menu for ${username}`}
						className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
						style={{
							background: 'rgba(255,255,255,0.30)',
							border: '1px solid rgba(255,255,255,0.40)',
						}}
					>
						{/* Avatar */}
						<div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shrink-0 text-white font-black text-xs select-none shadow-sm">
							{initial}
						</div>
						{/* Name */}
						<span className="text-sm font-semibold text-white drop-shadow-sm max-w-[80px] truncate hidden sm:block">
							{username}
						</span>
					</button>

				</div>
			</div>
		</header>
	);
}
