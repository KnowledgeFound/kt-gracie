import { useState } from 'react';
import type { CityBlock, CityLook } from '../types';
import CityFire from './CityFire';
import CitySmoke from './CitySmoke';

interface DistrictArtProps {
	block: CityBlock;
	/** Which artwork to draw (see `CityLook`). */
	look: CityLook;
	/** Idle bobbing (Settings → City → Floating districts). */
	floating: boolean;
	/** Draw the smoke on a corrupt city and the fires on a destroyed one
	 *  (Settings → City → Storm, fire and smoke). */
	effects: boolean;
}

/**
 * A district's artwork. Healthy cities get `block.src`, corrupt ones the
 * abandoned `block.corruptSrc` with a little smoke rising off it, and
 * destroyed ones the burnt-out `block.destroyedSrc` with fires on top.
 *
 * If the destroyed image is missing, the healthy one is shown burnt-out through
 * a CSS filter instead (`.cityBlock--ruinFallback`), so the destroyed city
 * still reads as ruined before its artwork has been delivered.
 */
export default function DistrictArt({
	block,
	look,
	floating,
	effects,
}: DistrictArtProps) {
	const [ruinMissing, setRuinMissing] = useState(false);
	const destroyed = look === 'destroyed';
	const showRuin = destroyed && !ruinMissing;

	const src = showRuin
		? block.destroyedSrc
		: look === 'corrupt'
			? block.corruptSrc
			: block.src;

	return (
		<span
			className={`cityBlockArt${floating ? ` cityFloat--${block.float}` : ''}`}
		>
			<img
				src={src}
				alt=""
				className={`cityBlock${
					destroyed && ruinMissing ? ' cityBlock--ruinFallback' : ''
				}`}
				onError={showRuin ? () => setRuinMissing(true) : undefined}
			/>
			{look === 'corrupt' &&
				effects &&
				block.smoke.map((smoke, i) => (
					<CitySmoke key={i} smoke={smoke} index={i} />
				))}
			{destroyed &&
				effects &&
				block.fires.map((fire, i) => (
					<CityFire key={i} fire={fire} index={i} />
				))}
		</span>
	);
}
