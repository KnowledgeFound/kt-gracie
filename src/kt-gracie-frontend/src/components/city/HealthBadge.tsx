interface HealthBadgeProps {
    health: number;
}

/**
 * City health badge: blue circle heart icon + labelled progress bar.
 */
export default function HealthBadge({ health }: HealthBadgeProps) {
    return (
        <div className="health-badge">
            {/* Blue circle heart icon */}
            <div className="health-badge__heart">
                <svg width="22" height="20" viewBox="0 0 24 22" fill="none">
                    <path
                        d="M12 21s-9-5.5-9-12.5C3 4.5 5.5 2 8.5 2c1.74 0 3.41.81 4.5 2.09A6.04 6.04 0 0 1 17.5 2C20.5 2 23 4.5 23 8.5 23 15.5 12 21 12 21z"
                        fill="#6ec6f0"
                    />
                </svg>
            </div>

            <div className="health-badge__content">
                <span className="health-badge__label">CITY HEALTH: {health}%</span>
                <div className="health-badge__track">
                    <div
                        className="health-badge__fill"
                        style={{ width: `${health}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
