import type { CSSProperties } from 'react';
import type { CityBlockFire } from '../types';

interface CityFireProps {
	fire: CityBlockFire;
	/** Position in the district's fire list — staggers the flicker so
	 *  neighbouring fires never pulse in step. */
	index: number;
}

/**
 * One fire on a ruined district: a flickering core, flame tongues rising off
 * it, smoke, embers and a glow cast on the artwork underneath. Entirely CSS
 * (see `.cityFire` in city.css) and sized in % of the district, so it scales
 * with the map and rides the district's float animation.
 */
export default function CityFire({ fire, index }: CityFireProps) {
	return (
		<span
			aria-hidden="true"
			className="cityFire"
			style={
				{
					left: `${fire.x * 100}%`,
					top: `${fire.y * 100}%`,
					width: `${fire.size * 100}%`,
					'--fire-delay': `${-(index * 0.37)}s`,
				} as CSSProperties
			}
		>
			<span className="cityFire__glow" />
			<span className="cityFire__smoke">
				<i />
				<i />
				<i />
			</span>
			<span className="cityFire__flames">
				<i />
				<i />
				<i />
				<i />
				<i />
			</span>
			<span className="cityFire__core" />
			<span className="cityFire__embers">
				<i />
				<i />
				<i />
			</span>
		</span>
	);
}
