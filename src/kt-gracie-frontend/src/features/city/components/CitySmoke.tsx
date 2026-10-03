import type { CSSProperties } from 'react';
import type { CityBlockSmoke } from '../types';

interface CitySmokeProps {
	smoke: CityBlockSmoke;
	/** Position in the district's smoke list — staggers the plumes so
	 *  neighbouring ones never rise in step. */
	index: number;
}

/**
 * One thin plume of smoke on an abandoned district: four soft grey puffs
 * that rise slowly, spread, lean with the wind and fade out. Entirely CSS
 * (see `.citySmoke` in city.css) and sized in % of the district, so it scales
 * with the map and rides the district's float animation.
 */
export default function CitySmoke({ smoke, index }: CitySmokeProps) {
	return (
		<span
			aria-hidden="true"
			className="citySmoke"
			style={
				{
					left: `${smoke.x * 100}%`,
					top: `${smoke.y * 100}%`,
					width: `${smoke.size * 100}%`,
					'--smoke-delay': `${-(index * 2.7)}s`,
				} as CSSProperties
			}
		>
			<i />
			<i />
			<i />
			<i />
		</span>
	);
}
