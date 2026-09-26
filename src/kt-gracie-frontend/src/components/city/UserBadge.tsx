interface UserBadgeProps {
    username: string;
}

/**
 * Username display badge.
 */
export default function UserBadge({ username }: UserBadgeProps) {
    return (
        <div className="city-badge">
            <span className="city-badge__icon">👤</span>
            <div className="city-badge__text">
                <span className="city-badge__label">Username</span>
                <span className="city-badge__value">{username}</span>
            </div>
        </div>
    );
}
