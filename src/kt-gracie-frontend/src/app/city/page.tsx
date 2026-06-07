import '@pixi/unsafe-eval';
import { useState } from 'react';
import { CloudLayer, CityHeader, DrawerMenu, CityMenu } from '@/features/city';
import { useUser } from '@/features/auth';

const CITY_BG_SRC = '/assets/city/city.png';

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

	return (
		<div className="relative w-screen h-screen overflow-hidden font-sans">
			{/* City background */}
			<img
				src={CITY_BG_SRC}
				alt="Knowledge City — isometric city view"
				className="absolute inset-0 w-full h-full max-w-none max-h-none m-0 object-cover object-center rounded-none z-0 animate-cityReveal"
			/>

			{/* PixiJS cloud layer */}
			<div className="absolute inset-0 z-[1] pointer-events-none">
				<CloudLayer />
			</div>

			{/* Header badges */}
			<CityHeader
				health={user?.city?.health ?? 100}
				tokens={user?.tokenBalance ?? 0}
				username={user?.firstName ?? '—'}
				onClickHealth={() => setStatsOpen(true)}
				onClickUser={() => setDrawerOpen(true)}
			/>

			{/* Left nav drawer — opened by username badge */}
			<DrawerMenu
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
			/>

			{/* Right stats panel — opened by health badge */}
			<CityMenu
				open={statsOpen}
				onClose={() => setStatsOpen(false)}
			/>
		</div>
	);
}
