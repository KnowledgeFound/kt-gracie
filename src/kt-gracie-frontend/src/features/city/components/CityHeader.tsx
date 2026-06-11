import HealthBadge from './HealthBadge';
import TokensBadge from './TokensBadge';
import UserBadge from './UserBadge';

interface CityHeaderProps {
	health: number;
	tokens: number;
	username: string;
	/** Called when the user taps the health badge */
	onClickHealth?: () => void;
	/** Called when the user taps the tokens badge */
	onClickToken?: () => void;
	/** Called when the user taps the username badge — opens the drawer */
	onClickUser?: () => void;
}

/**
 * Floating header bar that displays city stats as badge pills.
 *
 * Layout:
 *   mobile  — full-width row, badges spread across left → right
 *   md+     — centred, badges in a tight row
 */
export default function CityHeader({
	health,
	tokens,
	username,
	onClickHealth,
	onClickToken,
	onClickUser,
}: CityHeaderProps) {
	return (
		<header
			className="absolute top-0 left-0 right-0 z-10 animate-fadeSlideDown"
			style={{
				background:
					'linear-gradient(180deg, rgba(214,238,254,0.90) 0%, rgba(214,238,254,0) 100%)',
			}}
		>
			<div className="flex items-center justify-between md:justify-center gap-2 md:gap-4 px-3 md:px-6 pt-3 md:pt-header-t pb-3">
				<HealthBadge health={health} onClick={onClickHealth} />
				<TokensBadge tokens={tokens} onClick={onClickToken} />
				<UserBadge username={username} onClick={onClickUser} />
			</div>
		</header>
	);
}
