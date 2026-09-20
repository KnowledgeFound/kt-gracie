import DriftingCloud from './DriftingCloud';

/**
 * The two drifting clouds above the districts. Plain images moved with a CSS
 * animation; the artwork is SVG, so it stays sharp at any size and density.
 *
 * Size and position live in city.css (.cityCloud--left / .cityCloud--right,
 * plus .cityCloud--stormA / --stormB for the extra storm cover).
 */
const CLOUD1_SRC = '/assets/city/cloud1.svg';
const CLOUD2_SRC = '/assets/city/cloud2.svg';

interface CloudLayerProps {
	/** Corrupt city: more cloud cover. The thundercloud look itself is a CSS
	 *  filter on `.cityScene--corrupt .cityCloud`, so the artwork is shared. */
	stormy?: boolean;
}

export default function CloudLayer({ stormy = false }: CloudLayerProps) {
	return (
		<>
			<DriftingCloud imageSrc={CLOUD1_SRC} placement="right" drift={-40} />
			<DriftingCloud imageSrc={CLOUD2_SRC} placement="left" drift={40} />
			{stormy && (
				<>
					<DriftingCloud imageSrc={CLOUD2_SRC} placement="stormA" drift={-55} />
					<DriftingCloud imageSrc={CLOUD1_SRC} placement="stormB" drift={50} />
				</>
			)}
		</>
	);
}
