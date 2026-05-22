import '@pixi/unsafe-eval';
import { useState } from 'react';
import { CloudLayer, CityHeader, DrawerMenu } from '@/features/city';
import { useUser } from '@/features/auth';

const CITY_BG_SRC = '/assets/city/city.png';

/**
 * Top-level city page.
 * Manages the drawer open/close state; all other logic lives in child components.
 */
export default function CityScene() {
	const { user } = useUser();
	const [drawerOpen, setDrawerOpen] = useState(false);

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

			{/* Header — user badge opens the drawer */}
			<CityHeader
				health={user?.city?.health ?? 100}
				tokens={user?.tokenBalance ?? 0}
				username={user?.firstName ?? '—'}
				onClickUser={() => setDrawerOpen(true)}
			/>

			{/* Slide-in navigation drawer */}
			<DrawerMenu
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
			/>
		</div>
	);
}
