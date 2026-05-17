interface TokensBadgeProps {
    tokens: number;
}

/**
 * Knowledge tokens badge: KT coin icon + token count.
 */
export default function TokensBadge({ tokens }: TokensBadgeProps) {
    return (
        <div className="city-badge">
            <div className="kt-coin">
                <div className="kt-coin__inner">
                    <span className="kt-coin__text">KT</span>
                </div>
            </div>

            <div className="city-badge__text">
                <span className="city-badge__label">Knowledge Tokens</span>
                <span className="city-badge__value">{tokens}</span>
            </div>
        </div>
    );
}
