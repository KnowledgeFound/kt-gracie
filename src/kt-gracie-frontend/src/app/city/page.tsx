import '@pixi/unsafe-eval';
import { useState } from 'react';
import './city.css';
import {
	CloudLayer,
	CityHeader,
	DrawerMenu,
	CityMenu,
	ModuleDrawer,
	Modules,
	BalloonCursor,
} from '@/features/city';
import { useUser } from '@/features/auth';
import * as CityServices from '@/services/cityService';
import { useEffect } from 'react';

const BLOCK_CENTRAL_SRC = '/assets/city/block-central.png';
const BLOCK_LEFT_UP_SRC = '/assets/city/block-left-up.png';
const BLOCK_LEFT_DOWN_SRC = '/assets/city/block-left-down.png';
const BLOCK_RIGHT_UP_SRC = '/assets/city/block-right-up.png';
const BLOCK_RIGHT_DOWN_SRC = '/assets/city/block-right-down.png';

type BlockId = 'leftUp' | 'rightUp' | 'central' | 'leftDown' | 'rightDown';

const BLOCKS: { id: BlockId; src: string; alt: string }[] = [
	{ id: 'leftUp', src: BLOCK_LEFT_UP_SRC, alt: 'City block left up' },
	{ id: 'rightUp', src: BLOCK_RIGHT_UP_SRC, alt: 'City block right up' },
	{ id: 'central', src: BLOCK_CENTRAL_SRC, alt: 'Central city block' },
	{ id: 'leftDown', src: BLOCK_LEFT_DOWN_SRC, alt: 'City block left down' },
	{ id: 'rightDown', src: BLOCK_RIGHT_DOWN_SRC, alt: 'City block right down' },
];

/**
 * Top-level city page.
 *
 * Two panels:
 *  - DrawerMenu  (left)  — navigation, opened by the username badge
 *  - CityMenu    (right) — city/progression stats, opened by the health badge
 */
export default function CityScene() {
	const { user } = useUser();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [statsOpen, setStatsOpen] = useState(false);
	const [moduleId, setModuleId] = useState<number | null>(null);
	const [hoveredBlock, setHoveredBlock] = useState<BlockId | null>(null);
	const [cityHealth, setCityHealth] = useState<number>(100);

	useEffect(() => {
		const loadCityHealth = async () => {
			//console.log("Loaded city:", CityServices.getCityFromLocalStorage()?.getHealth());
			const health = CityServices.getCityFromLocalStorage()?.getHealth() ?? 100;
			setCityHealth(health);
    	};

		loadCityHealth();
	}, []);

	const handleModuleClick = (id: number) => {
		setModuleId(id);
	};

	return (
		<div
			className={`cityScene${hoveredBlock ? ' cityScene--hovering' : ''}`}
		>
			{/* City background */}
			<div aria-hidden="true" className="cityBackground" />

			{/* PixiJS cloud layer */}
			<div className="cityCloudLayer">
				<CloudLayer />
			</div>

			<div className="cityBlockGridWrapper">
				<div className="cityBlocks">
					{BLOCKS.map(({ id, src, alt }) => {
						const isDimmed = hoveredBlock !== null && hoveredBlock !== id;
						const isActive = hoveredBlock === id;

						const variant = id.charAt(0).toUpperCase() + id.slice(1);

						return (
							<div
								key={id}
								className={[
									'cityBlockItem',
									`cityBlockItem--${id}`,
									isActive ? 'cityBlockItem--active' : '',
									isDimmed ? 'cityBlockItem--dimmed' : '',
								]
									.filter(Boolean)
									.join(' ')}
								onMouseEnter={() => setHoveredBlock(id)}
								onMouseLeave={() => setHoveredBlock(null)}
							>
								<img
									src={src}
									alt={alt}
									className={`cityBlock cityBlock--${id}`}
								/>
							</div>
						);
					})}
				</div>
			</div>

			{/* Header badges */}
			<CityHeader
				health={cityHealth}
				tokens={user?.tokenBalance ?? 0}
				username={user?.firstName ?? '—'}
				onClickHealth={() => setStatsOpen(true)}
				onClickUser={() => setDrawerOpen(true)}
			/>

			{/* Left nav drawer — opened by username badge */}
			<DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />

			{/* Module detail drawer — opened by clicking a Module on the map */}
			<ModuleDrawer
				open={moduleId !== null}
				onClose={() => setModuleId(null)}
				moduleId={moduleId}
			/>

			{/* Right stats panel — opened by health badge */}
			<CityMenu open={statsOpen} onClose={() => setStatsOpen(false)} />

			<Modules onClickModule={handleModuleClick} />

			{/* Hot-air balloon that follows the mouse */}
			<BalloonCursor />
		</div>
	);
}