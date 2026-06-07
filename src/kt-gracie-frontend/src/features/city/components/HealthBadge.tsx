interface HealthBadgeProps {
	health: number;
	onClick?: () => void;
}

/**
 * City health badge: blue circle heart icon + labelled progress bar.
 * Renders as a button when onClick is provided.
 */
export default function HealthBadge({ health, onClick }: HealthBadgeProps) {
	const cls =
		'badge-pill bg-surface-glass-blue' +
		(onClick ? ' cursor-pointer hover:-translate-y-px' : ' cursor-default');

	const inner = (
		<>
			{/* Heart icon circle */}
			<div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-100 to-brand-50 border-2 border-brand-300/50 flex items-center justify-center shrink-0">
				<svg width="22" height="20" viewBox="0 0 24 22" fill="none">
					<path
						d="M12 21s-9-5.5-9-12.5C3 4.5 5.5 2 8.5 2c1.74 0 3.41.81 4.5 2.09A6.04 6.04 0 0 1 17.5 2C20.5 2 23 4.5 23 8.5 23 15.5 12 21 12 21z"
						fill="currentColor"
						className="text-brand-300"
					/>
				</svg>
			</div>

			{/* Label + progress bar */}
			<div className="flex flex-col gap-1">
				<span className="badge-label text-ink-mid">
					CITY HEALTH: {health}%
				</span>
				<div className="w-[140px] h-[14px] bg-ocean-track rounded-lg overflow-hidden border border-ocean-border">
					<div
						className="h-full rounded-lg transition-[width] duration-[600ms] ease-in-out bg-gradient-to-r from-brand-400 to-brand-600"
						style={{ width: `${health}%` }}
					/>
				</div>
			</div>
		</>
	);

	return onClick ? (
		<button onClick={onClick} className={cls}>
			{inner}
		</button>
	) : (
		<div className={cls}>{inner}</div>
	);
}
