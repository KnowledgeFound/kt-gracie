import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const BALLOON_SRC = '/assets/balloon.png';

// How many spiral rings to render
const RING_COUNT = 3;

/**
 * A hot-air balloon that smoothly follows the mouse across the screen.
 *
 * - Spring physics give it a satisfying lag behind the cursor.
 * - After 1.5 s of no mouse movement, concentric spiral rings expand outward
 *   from the balloon to draw the user's attention.
 * - The balloon gently bobs up/down at all times.
 */
export default function BalloonCursor() {
	// Raw mouse position
	const rawX = useMotionValue(window.innerWidth / 2);
	const rawY = useMotionValue(window.innerHeight / 2);

	// Springy balloon position (lags behind the cursor)
	const x = useSpring(rawX, { stiffness: 80, damping: 18, mass: 1.2 });
	const y = useSpring(rawY, { stiffness: 80, damping: 18, mass: 1.2 });

	// Show idle rings when mouse hasn't moved for IDLE_MS
	const IDLE_MS = 1500;
	const [idle, setIdle] = useState(false);
	const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		function onMouseMove(e: MouseEvent) {
			rawX.set(e.clientX);
			rawY.set(e.clientY);

			setIdle(false);
			if (idleTimer.current) clearTimeout(idleTimer.current);
			idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
		}

		window.addEventListener('mousemove', onMouseMove);

		// Kick off the idle ring after initial mount
		idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			if (idleTimer.current) clearTimeout(idleTimer.current);
		};
	}, [rawX, rawY]);

	return (
		// Container tracks the springy balloon position.
		// pointer-events-none so it never blocks clicks on the map buttons.
		<motion.div
			className="fixed z-30 pointer-events-none"
			style={{
				x,
				y,
				// Centre the balloon on the cursor point
				translateX: '-50%',
				translateY: '-50%',
			}}
		>
			{/* ── Spiral rings (idle hint) ── */}
			{idle &&
				Array.from({ length: RING_COUNT }).map((_, i) => (
					<span
						key={i}
						className="absolute rounded-full border-2 border-blue-600/60 z-10 animate-spiralRing"
						style={{
							// Centre each ring on the balloon
							width: 56,
							height: 56,
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							animationDelay: `${i * 0.45}s`,
						}}
					/>
				))}

			{/* ── Balloon image — bobs up/down continuously ── */}
			<motion.img
				src={BALLOON_SRC}
				alt="balloon"
				className="w-40 h-auto drop-shadow-lg select-none rounded "
				animate={{ y: [0, -10, 0] }}
				transition={{
					duration: 3,
					repeat: Infinity,
					ease: 'easeInOut',
				}}
				draggable={false}
			/>
		</motion.div>
	);
}
