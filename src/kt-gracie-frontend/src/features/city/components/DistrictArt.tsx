import { useState } from 'react';
import type { CityBlock } from '../types';
import CityFire from './CityFire';

interface DistrictArtProps {
	block: CityBlock;
	/** City health has dropped into the corrupt state. */
	corrupt: boolean;
	/** Idle bobbing (Settings → City → Floating districts). */
	floating: boolean;
	/** Draw the fires (Settings → City → Storm and fire). */
	fires: boolean;
}

/**
 * A district's artwork. Healthy cities get `block.src`; corrupt ones get the
 * ruined `block.corruptSrc` with fires burning on top.
 *
 * If the ruined image is missing, the healthy one is shown burnt-out through a
 * CSS filter instead (`.cityBlock--ruinFallback`), so the corrupt city still
 * reads as ruined before its artwork has been delivered.
 */
export default function DistrictArt({
	block,
	corrupt,
	floating,
	fires,
}: DistrictArtProps) {
	const [ruinMissing, setRuinMissing] = useState(false);
	const showRuin = corrupt && !ruinMissing;

	return (
		<span
			className={`cityBlockArt${floating ? ` cityFloat--${block.float}` : ''}`}
		>
			<img
				src={showRuin ? block.corruptSrc : block.src}
				alt=""
				className={`cityBlock${
					corrupt && ruinMissing ? ' cityBlock--ruinFallback' : ''
				}`}
				onError={showRuin ? () => setRuinMissing(true) : undefined}
			/>
			{corrupt &&
				fires &&
				block.fires.map((fire, i) => (
					<CityFire key={i} fire={fire} index={i} />
				))}
		</span>
	);
}
