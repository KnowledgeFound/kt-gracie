interface HealthBadgeProps {
	health: number;
	onClick?: () => void;
}

/**
 * City health badge: heart icon + labelled progress bar.
 *
 * Mobile  — compact: icon + short bar, no label text
 * md+     — full pill: icon + "CITY HEALTH: n%" label + wider bar
 */
export default function HealthBadge({ health, onClick }: HealthBadgeProps) {
	// Clamp to [0, 100] so the bar never overflows
	const pct = Math.min(100, Math.max(0, health));

	const baseClass = [
		'badge-pill bg-surface-glass-blue',
		onClick
			? 'cursor-pointer hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2'
			: 'cursor-default',
	].join(' ');

	const inner = (
		<>
			{/* Heart icon circle */}
			<div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-brand-100 to-brand-50 border-2 border-brand-300/50 flex items-center justify-center shrink-0">
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 22"
					fill="none"
					aria-hidden="true"
					className="md:w-[22px] md:h-[20px]"
				>
					<path
						d="M12 21s-9-5.5-9-12.5C3 4.5 5.5 2 8.5 2c1.74 0 3.41.81 4.5 2.09A6.04 6.04 0 0 1 17.5 2C20.5 2 23 4.5 23 8.5 23 15.5 12 21 12 21z"
						fill="currentColor"
						className="text-brand-300"
					/>
				</svg>
			</div>

			{/* Label + progress bar */}
			<div className="flex flex-col gap-0.5">
				{/* Label — hidden on mobile */}
				<span className="badge-label text-ink-mid hidden md:block">
					CITY HEALTH: {pct}%
				</span>

				{/* Progress bar */}
				<div
					className="h-[8px] md:h-[14px] w-[80px] md:w-[140px] bg-ocean-track rounded-lg overflow-hidden border border-ocean-border"
					role="progressbar"
					aria-valuenow={pct}
					aria-valuemin={0}
					aria-valuemax={100}
				>
					<div
						className="h-full rounded-lg transition-[width] duration-[600ms] ease-in-out bg-gradient-to-r from-brand-400 to-brand-600"
						style={{ width: `${pct}%` }}
					/>
				</div>

				{/* Percentage — mobile only */}
				<span className="badge-label text-ink-mid md:hidden">{pct}%</span>
			</div>
		</>
	);

	return onClick ? (
		<button
			onClick={onClick}
			aria-label={`City health ${pct}%. Open city stats`}
			className={baseClass}
		>
			{inner}
		</button>
	) : (
		<div className={baseClass}>{inner}</div>
	);
}
