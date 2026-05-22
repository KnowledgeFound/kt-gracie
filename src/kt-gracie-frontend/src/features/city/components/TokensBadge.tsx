interface TokensBadgeProps {
	tokens: number;
	onClick?: () => void;
}

/**
 * Knowledge tokens badge: KT coin icon + token count.
 * Renders as a button when onClick is provided.
 */
export default function TokensBadge({ tokens, onClick }: TokensBadgeProps) {
	const cls =
		'badge-pill' +
		(onClick ? ' cursor-pointer hover:-translate-y-px' : ' cursor-default');

	const inner = (
		<>
			{/* KT Coin */}
			<div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-brand-200 via-brand-700 to-brand-500 flex items-center justify-center shadow-coin shrink-0">
				<div className="w-[30px] h-[30px] rounded-full border-2 border-white/55 flex items-center justify-center">
					<span className="text-coin-label text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">
						KT
					</span>
				</div>
			</div>

			{/* Text */}
			<div className="flex flex-col leading-[1.25]">
				<span className="badge-label">Knowledge Tokens</span>
				<span className="badge-value">{tokens}</span>
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
