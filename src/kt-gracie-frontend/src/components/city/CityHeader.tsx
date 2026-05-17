import HealthBadge from "./HealthBadge";
import TokensBadge from "./TokensBadge";
import UserBadge from "./UserBadge";
import "./CityHeader.scss";

interface CityHeaderProps {
    health: number;
    tokens: number;
    username: string;
}

/**
 * Floating header bar that displays city stats as badge pills.
 */
export default function CityHeader({ health, tokens, username }: CityHeaderProps) {
    return (
        <header className="city-header">
            <div className="city-header__badges">
                <HealthBadge health={health} />
                <TokensBadge tokens={tokens} />
                <UserBadge username={username} />
            </div>
        </header>
    );
}
