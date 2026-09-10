interface UserBadgeProps {
	username: string;
	onClick?: () => void;
}

/**
 * Username display badge.
 *
 * Mobile  — avatar initial + truncated name, no "Username" label
 * md+     — full pill with label
 */
export default function UserBadge({ username, onClick }: UserBadgeProps) {
	const initial = username.charAt(0).toUpperCase();

	const baseClass = [
		'badge-pill',
		onClick
			? 'cursor-pointer hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2'
			: 'cursor-default',
	].join(' ');

	const inner = (
		<>
			{/* Avatar circle */}
			<div
				aria-hidden="true"
				className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-800 flex items-center justify-center shrink-0 text-white font-bold text-sm md:text-base select-none"
			>
				{initial}
			</div>

			{/* Text */}
			<div className="hidden md:flex flex-col leading-[1.25]">
				<span className="badge-label ">Username</span>
				<span className="badge-value max-w-[80px] md:max-w-[120px] truncate">
					{username}
				</span>
			</div>
		</>
	);

	return onClick ? (
		<button
			onClick={onClick}
			aria-label={`Open menu for ${username}`}
			className={baseClass}
		>
			{inner}
		</button>
	) : (
		<div className={baseClass}>{inner}</div>
	);
}
