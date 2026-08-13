import '@pixi/unsafe-eval';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './city.css';
import {
	CloudLayer,
	CityHeader,
	DrawerMenu,
	CityMenu,
	ModuleDrawer,
	Modules,
	BalloonCursor,
	GracieGuide,
	TokenModal,
	ProgressModal,
	HealthModal,
} from '@/features/city';
import { useUser } from '@/features/auth';
import { useSettings } from '@/features/settings';
import { cityBlocks, getCityBlock } from '@/features/city/constants';
import type { CityBlockId } from '@/features/city/types';

/**
 * Top-level city page.
 *
 * Two panels:
 *  - DrawerMenu  (left)  — navigation, opened by the username badge
 *  - CityMenu    (right) — city/progression stats, opened by the health badge
 */
export default function CityScene() {
	const { user, city } = useUser();
	const { settings } = useSettings();
	const navigate = useNavigate();
	const [drawerOpen, setDrawerOpen]     = useState(false);
	const [healthOpen, setHealthOpen]     = useState(false);
	const [tokenOpen, setTokenOpen]       = useState(false);
	const [progressOpen, setProgressOpen] = useState(false);
	const [moduleId, setModuleId]         = useState<number | null>(null);
	const [hoveredBlock, setHoveredBlock] = useState<CityBlockId | null>(null);
	// The district Gracie is currently talking about. Separate from `moduleId`:
	// tapping a district asks her for an overview, tapping its button opens the
	// drawer — the two never trigger each other.
	const [guideModuleId, setGuideModuleId] = useState<number | null>(null);
	// Gracie's centre-stage intro runs on arrival; the city is inert behind its
	// veil until she docks to the lower-left.
	const [introDone, setIntroDone] = useState(false);

	// Single source of truth: the city held in auth context (loaded from
	// local storage on mount, updated on account creation).
	const cityHealth = city?.getHealth() ?? 0;

	// Module button — opens the detail drawer.
	const handleModuleClick = (id: number) => {
		setModuleId(id);
	};

	// District itself — hands the module to Gracie. Tapping the district she is
	// already on sends her back to her idle prompt.
	const handleBlockClick = (id: number) => {
		setGuideModuleId((current) => (current === id ? null : id));
	};

	// A module button sits on top of its district image. Hovering it would
	// normally fire the block's mouseleave and kill the glow — so mirror the
	// hover onto the district underneath it.
	const handleModuleHover = (id: number | null) => {
		setHoveredBlock(id === null ? null : getCityBlock(id)?.id ?? null);
	};

	return (
		<div className={`cityScene${hoveredBlock ? ' cityScene--hovering' : ''}`}>
			{/* City background */}
			<div aria-hidden="true" className="cityBackground" />

			{/* PixiJS cloud layer — ambience, opt-out in Settings */}
			{settings.city.clouds && (
				<div className="cityCloudLayer">
					<CloudLayer />
				</div>
			)}

			{/* Floating districts. Geometry comes from features/city/constants.ts,
			    so each district and its module button share one set of numbers. */}
			<div className="cityBlockGridWrapper">
				<div className="cityBlocks">
					{cityBlocks.map((block) => {
						const isActive =
							hoveredBlock === block.id || guideModuleId === block.moduleId;
						const isDimmed = hoveredBlock !== null && hoveredBlock !== block.id;

						return (
							<button
								key={block.id}
								type="button"
								aria-label={`Ask Gracie about the ${block.alt}`}
								aria-pressed={guideModuleId === block.moduleId}
								className={[
									'cityBlockItem',
									isActive ? 'cityBlockItem--active' : '',
									isDimmed ? 'cityBlockItem--dimmed' : '',
								]
									.filter(Boolean)
									.join(' ')}
								style={{
									left: `${block.box.left}%`,
									top: `${block.box.top}%`,
									width: `${block.box.width}%`,
									height: `${block.box.height}%`,
									zIndex: isActive ? 10 : block.z,
								}}
								onClick={() => handleBlockClick(block.moduleId)}
								onMouseEnter={() => setHoveredBlock(block.id)}
								onMouseLeave={() => setHoveredBlock(null)}
								onFocus={() => setHoveredBlock(block.id)}
								onBlur={() => setHoveredBlock(null)}
							>
								<img
									src={block.src}
									alt=""
									className={`cityBlock${
										settings.city.floatingDistricts
											? ` cityFloat--${block.float}`
											: ''
									}`}
								/>
							</button>
						);
					})}
				</div>
			</div>

			{/* Header badges */}
			<CityHeader
				health={cityHealth}
				tokens={user?.tokenBalance ?? 0}
				username={user?.firstName ?? '—'}
				onClickHealth={() => setHealthOpen(true)}
				onClickToken={() => setTokenOpen(true)}
				onClickTrend={() => setProgressOpen(true)}
				onClickUser={() => setDrawerOpen(true)}
				onClickSettings={() => navigate('/settings')}
			/>

			{/* User profile drawer — right side */}
			<DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />

			{/* Module detail drawer */}
			<ModuleDrawer
				open={moduleId !== null}
				onClose={() => setModuleId(null)}
				moduleId={moduleId}
			/>

			{/* City health modal */}
			<HealthModal
				open={healthOpen}
				onClose={() => setHealthOpen(false)}
				health={cityHealth}
			/>

			{/* KT Wallet modal */}
			<TokenModal open={tokenOpen} onClose={() => setTokenOpen(false)} />

			{/* Progress modal */}
			<ProgressModal open={progressOpen} onClose={() => setProgressOpen(false)} />

			<Modules
				onClickModule={handleModuleClick}
				onHoverModule={handleModuleHover}
				hoveredBlock={hoveredBlock}
				activeModuleId={moduleId}
				floating={settings.city.floatingDistricts}
			/>

			{/* Talking Gracie guide — enters centre stage, then docks lower-left.
			    Hidden entirely when the user has turned the guide off. */}
			{settings.guide.visible && (
				<GracieGuide
					moduleId={guideModuleId}
					onIntroDone={() => setIntroDone(true)}
				/>
			)}

			{/* Hot-air balloon that follows the mouse — would only compete with
			    Gracie while she has the screen, so it waits for her to dock. With
			    no guide on screen there is nothing to wait for. */}
			{(introDone || !settings.guide.visible) && settings.city.balloonCursor && (
				<BalloonCursor />
			)}
		</div>
	);
}
