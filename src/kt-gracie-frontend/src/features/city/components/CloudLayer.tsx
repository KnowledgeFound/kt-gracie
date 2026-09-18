import DriftingCloud from './DriftingCloud';

/**
 * The two drifting clouds above the districts. Plain images moved with a CSS
 * animation; the artwork is SVG, so it stays sharp at any size and density.
 *
 * Size and position live in city.css (.cityCloud--left / .cityCloud--right).
 */
const CLOUD1_SRC = '/assets/city/cloud1.svg';
const CLOUD2_SRC = '/assets/city/cloud2.svg';

export default function CloudLayer() {
	return (
		<>
			<DriftingCloud imageSrc={CLOUD1_SRC} placement="right" drift={-40} />
			<DriftingCloud imageSrc={CLOUD2_SRC} placement="left" drift={40} />
		</>
	);
}
