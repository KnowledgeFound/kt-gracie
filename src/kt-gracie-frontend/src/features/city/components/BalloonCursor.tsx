import { useEffect, useRef } from 'react';

const BALLOON_SRC = '/assets/balloon.png';
/** Worn, patched-up balloon flown over a corrupt city. */
const CORRUPT_BALLOON_SRC = '/assets/corrupted-city/balloon.png';

/**
 * Spring that pulls the balloon toward the cursor (mass 1). The damping ratio
 * c / (2√k) ≈ 0.9 sits just under critical: it eases in with no visible
 * bounce, and trails a cursor moving at 600 px/s by about 100 px.
 */
const STIFFNESS = 120;
const DAMPING = 20;

/** Integrate in small fixed steps so the spring is stable at any frame rate. */
const SUBSTEP_S = 1 / 240;
/** Longest frame we integrate across; a hitch moves the balloon, never teleports it. */
const MAX_FRAME_S = 0.05;

/** The balloon leans into its motion, like a basket swinging under its envelope. */
const LEAN_DEG_PER_PX_S = 0.01;
const MAX_LEAN_DEG = 7;

/**
 * A hot-air balloon that smoothly follows the mouse across the screen.
 *
 * - A spring (integrated in our own frame loop, with its velocity carried
 *   from frame to frame) gives it a satisfying lag behind the cursor. Driving
 *   the position straight into the wrapper's transform keeps React out of
 *   the per-frame path and makes a dropped frame a slightly longer step
 *   instead of a stall-and-restart.
 * - The balloon gently bobs up/down at all times (CSS keyframes, so the
 *   compositor handles it).
 */
interface BalloonCursorProps {
	/** Fly the worn balloon that matches the corrupt districts. */
	corrupt?: boolean;
}

export default function BalloonCursor({ corrupt = false }: BalloonCursorProps) {
	const wrapRef = useRef<HTMLDivElement>(null);

	// Where the cursor is, and where the balloon is (with its velocity).
	const target = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
	const state = useRef({ ...target.current, vx: 0, vy: 0 });

	useEffect(() => {
		function onMouseMove(e: MouseEvent) {
			target.current.x = e.clientX;
			target.current.y = e.clientY;
		}
		window.addEventListener('mousemove', onMouseMove, { passive: true });

		// ── Frame loop ──
		let raf = 0;
		let last = performance.now();
		function tick(now: number) {
			let dt = Math.min((now - last) / 1000, MAX_FRAME_S);
			last = now;

			const s = state.current;
			const t = target.current;
			while (dt > 0) {
				const h = Math.min(SUBSTEP_S, dt);
				dt -= h;
				// Semi-implicit Euler: update velocity, then position with it.
				s.vx += (STIFFNESS * (t.x - s.x) - DAMPING * s.vx) * h;
				s.vy += (STIFFNESS * (t.y - s.y) - DAMPING * s.vy) * h;
				s.x += s.vx * h;
				s.y += s.vy * h;
			}

			const lean = Math.max(
				-MAX_LEAN_DEG,
				Math.min(MAX_LEAN_DEG, s.vx * LEAN_DEG_PER_PX_S),
			);
			const el = wrapRef.current;
			if (el) {
				// Move to the balloon's position, centre the artwork on that point,
				// then lean about its own centre.
				el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) translate(-50%, -50%) rotate(${lean}deg)`;
			}
			raf = requestAnimationFrame(tick);
		}
		raf = requestAnimationFrame(tick);

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			cancelAnimationFrame(raf);
		};
	}, []);

	return (
		// Container tracks the springy balloon position.
		// pointer-events-none so it never blocks clicks on the map buttons.
		<div
			ref={wrapRef}
			className="fixed top-0 left-0 z-30 pointer-events-none will-change-transform"
			style={{
				transform: `translate3d(${state.current.x}px, ${state.current.y}px, 0) translate(-50%, -50%)`,
			}}
		>
			{/* ── Balloon image — bobs up/down continuously ──
			    No CSS filter here: a drop-shadow is a blur pass that would be
			    recomputed every frame while the balloon moves. */}
			<img
				src={corrupt ? CORRUPT_BALLOON_SRC : BALLOON_SRC}
				alt="balloon"
				className="w-40 h-auto select-none rounded animate-balloonBob"
				draggable={false}
			/>
		</div>
	);
}
