import type { CSSProperties } from 'react';

interface DriftingCloudProps {
	imageSrc: string;
	/** Where the cloud sits in the scene — sized and placed in city.css. */
	placement: 'left' | 'right';
	drift?: number;
}

/**
 * Cloud image that oscillates horizontally (see `cloud-drift` in city.css).
 * Must be rendered inside `.cityCloudLayer`.
 *
 * @param drift  Pixels. Positive = oscillate right, negative = oscillate left
 */
export default function DriftingCloud({
	imageSrc,
	placement,
	drift = 60,
}: DriftingCloudProps) {
	return (
		<img
			src={imageSrc}
			alt=""
			aria-hidden="true"
			draggable={false}
			decoding="async"
			className={`cityCloud cityCloud--${placement}`}
			style={{ '--cloud-drift': `${drift}px` } as CSSProperties}
		/>
	);
}
