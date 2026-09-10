interface TokensBadgeProps {
	tokens: number;
	onClick?: () => void;
}

/**
 * Knowledge tokens badge: KT coin + token count.
 *
 * Mobile  — coin icon + value only (no "Knowledge Tokens" label)
 * md+     — full pill with label
 */
export default function TokensBadge({ tokens, onClick }: TokensBadgeProps) {
	const baseClass = [
		'badge-pill',
		onClick
			? 'cursor-pointer hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2'
			: 'cursor-default',
	].join(' ');

	const inner = (
		<>
			{/* KT Coin */}
			<div className="w-8 h-8 md:w-[38px] md:h-[38px] rounded-full bg-gradient-to-br from-brand-200 via-brand-700 to-brand-500 flex items-center justify-center shadow-coin shrink-0">
				<div className="w-6 h-6 md:w-[30px] md:h-[30px] rounded-full border-2 border-white/55 flex items-center justify-center">
					<span className="text-coin-label text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">
						KT
					</span>
				</div>
			</div>

			{/* Text */}
			<div className="flex flex-col leading-[1.25]">
				<span className="badge-label hidden md:block">Knowledge Tokens</span>
				<span className="badge-value">{tokens.toLocaleString()}</span>
			</div>
		</>
	);

	return onClick ? (
		<button
			onClick={onClick}
			aria-label={`${tokens.toLocaleString()} Knowledge Tokens`}
			className={baseClass}
		>
			{inner}
		</button>
	) : (
		<div className={baseClass}>{inner}</div>
	);
}
