import { useEffect, useRef, useState } from 'react';

interface StormLayerProps {
	/** Hold everything still: one frozen frame of rain, no lightning. */
	reduceMotion: boolean;
}

interface Drop {
	x: number;
	y: number;
	len: number;
	/** px per second */
	speed: number;
	near: boolean;
}

interface Strike {
	id: number;
	bolt: string;
	branch: string;
}

/** Horizontal travel per pixel fallen — rain leans left, as if wind-driven. */
const RAIN_SLANT = -0.22;

function makeDrop(width: number, height: number, anywhere: boolean): Drop {
	const near = Math.random() < 0.4;
	return {
		// Spawn past the right edge too, since the slant carries drops left.
		x: Math.random() * (width + height * -RAIN_SLANT),
		y: anywhere ? Math.random() * height : -30,
		len: near ? 18 + Math.random() * 14 : 9 + Math.random() * 9,
		speed: near ? 1300 + Math.random() * 500 : 750 + Math.random() * 350,
		near,
	};
}

/** A jagged path down the 100×100 bolt viewBox, as an SVG points string. */
function jaggedPath(x: number, y: number, endY: number, steps: number) {
	const points = [`${x},${y}`];
	const stepY = (endY - y) / steps;
	for (let i = 0; i < steps; i++) {
		x += (Math.random() - 0.5) * 9;
		y += stepY;
		points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
	}
	return { points: points.join(' '), x, y };
}

function makeStrike(id: number): Strike {
	const startX = 12 + Math.random() * 76;
	const main = jaggedPath(startX, 6, 45 + Math.random() * 25, 9);
	// Fork off partway down the main bolt.
	const forkAt = main.points.split(' ')[3 + Math.floor(Math.random() * 3)];
	const [fx, fy] = forkAt.split(',').map(Number);
	const branch = jaggedPath(fx, fy, fy + 12 + Math.random() * 10, 4);
	return { id, bolt: main.points, branch: branch.points };
}

/**
 * Weather over the corrupt city: canvas rain across the whole scene, plus
 * lightning — a forked bolt behind the districts and a flash over everything —
 * every few seconds. Purely decorative and never takes pointer events.
 *
 * Must be rendered inside `.cityScene`; styles live in city.css.
 */
export default function StormLayer({ reduceMotion }: StormLayerProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [strike, setStrike] = useState<Strike | null>(null);

	// ── Rain ──────────────────────────────────────────────────────────────────
	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');
		if (!canvas || !ctx) return;

		let width = 0;
		let height = 0;
		let drops: Drop[] = [];
		let frame = 0;
		let last = performance.now();

		const draw = () => {
			ctx.clearRect(0, 0, width, height);
			for (const near of [false, true]) {
				ctx.beginPath();
				for (const d of drops) {
					if (d.near !== near) continue;
					ctx.moveTo(d.x, d.y);
					ctx.lineTo(d.x + d.len * RAIN_SLANT, d.y + d.len);
				}
				ctx.strokeStyle = near
					? 'rgba(200, 222, 255, 0.42)'
					: 'rgba(170, 195, 235, 0.22)';
				ctx.lineWidth = near ? 1.4 : 1;
				ctx.stroke();
			}
		};

		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			width = canvas.clientWidth;
			height = canvas.clientHeight;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			// Density follows the scene's area, capped for large monitors.
			const count = Math.min(320, Math.round((width * height) / 6500));
			drops = Array.from({ length: count }, () => makeDrop(width, height, true));
			draw();
		};

		const tick = (now: number) => {
			// Clamp the step so a backgrounded tab doesn't resume with a jump.
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			for (let i = 0; i < drops.length; i++) {
				const d = drops[i];
				d.y += d.speed * dt;
				d.x += d.speed * dt * RAIN_SLANT;
				if (d.y > height) drops[i] = makeDrop(width, height, false);
			}
			draw();
			frame = requestAnimationFrame(tick);
		};

		const observer = new ResizeObserver(resize);
		observer.observe(canvas);
		resize();
		if (!reduceMotion) frame = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
		};
	}, [reduceMotion]);

	// ── Lightning ─────────────────────────────────────────────────────────────
	useEffect(() => {
		if (reduceMotion) {
			setStrike(null);
			return;
		}

		let timer: ReturnType<typeof setTimeout>;
		let id = 0;
		const schedule = (delay: number) => {
			timer = setTimeout(() => {
				// Skip strikes nobody can see; keep the clock running.
				if (!document.hidden) setStrike(makeStrike(++id));
				schedule(4000 + Math.random() * 6000);
			}, delay);
		};
		schedule(1500 + Math.random() * 1500);

		return () => clearTimeout(timer);
	}, [reduceMotion]);

	return (
		<>
			{strike && (
				<svg
					key={`bolt-${strike.id}`}
					aria-hidden="true"
					className="cityLightningBolt"
					viewBox="0 0 100 100"
					preserveAspectRatio="none"
				>
					<polyline points={strike.bolt} />
					<polyline points={strike.branch} className="cityLightningBolt__branch" />
				</svg>
			)}
			<canvas ref={canvasRef} aria-hidden="true" className="cityRain" />
			{strike && (
				<div
					key={`flash-${strike.id}`}
					aria-hidden="true"
					className="cityLightningFlash"
				/>
			)}
		</>
	);
}
