interface UserBadgeProps {
	username: string;
	onClick?: () => void;
}

/**
 * Username display badge.
 * When onClick is provided it renders as a button (opens the drawer).
 */
export default function UserBadge({ username, onClick }: UserBadgeProps) {
	const cls =
		'badge-pill focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2' +
		(onClick ? ' cursor-pointer hover:-translate-y-px' : ' cursor-default');

	return onClick ? (
		<button onClick={onClick} className={cls}>
			<BadgeContent username={username} />
		</button>
	) : (
		<div className={cls}>
			<BadgeContent username={username} />
		</div>
	);
}

function BadgeContent({ username }: { username: string }) {
	return (
		<>
			<span className="text-[22px] leading-none">👤</span>
			<div className="flex flex-col leading-[1.25]">
				<span className="badge-label">Username</span>
				<span className="badge-value">{username}</span>
			</div>
		</>
	);
}
