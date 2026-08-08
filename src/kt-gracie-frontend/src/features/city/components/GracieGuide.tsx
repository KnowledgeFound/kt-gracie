import { useEffect, useRef, useState } from 'react';
import { modules } from '../constants';

const GRACIE_VIDEO_SRC = '/assets/talking-gracie.webm';

// Short intro script. Each entry is one speech bubble; the user advances with
// the Continue button. Swap for dynamic/localized content later.
const SCRIPT = [
	"Hi, I'm Gracie! I'm here to guide you through your anti-corruption city.",
	"Your city is in danger of corruption. If you do well in the quizzes and games, you will save your city. Do poorly and it collapses into corruption. Keep that health meter high!",
	'Click on any city district and I\'ll guide you through each module.',
];

// The talking loop plays this many times per message, then stops.
const LOOPS_PER_STEP = 2;

interface Props {
	/** The currently open module (its district drawer). When set, Gracie gives
	 *  an overview of it instead of the intro script. */
	moduleId?: number | null;
}

/**
 * Game-style NPC guide shown on the lower-left of the city scene.
 *
 * Walks the user through a short scripted intro, then — when a district's
 * module drawer is open — narrates a quick overview of that module. For each
 * message Gracie's talking clip plays exactly {@link LOOPS_PER_STEP} times,
 * then freezes.
 */
export default function GracieGuide({ moduleId = null }: Props) {
	const [step, setStep] = useState(0);
	const videoRef = useRef<HTMLVideoElement>(null);
	const playsRef = useRef(0);

	const activeModule =
		moduleId !== null ? modules.find((m) => m.id === moduleId) ?? null : null;

	// Module overview takes precedence over the intro script.
	const message = activeModule
		? `This is the ${activeModule.name} district. ${activeModule.description}`
		: SCRIPT[step];

	// Replay the talking clip whenever the shown message changes.
	const messageKey = activeModule ? `module-${activeModule.id}` : `step-${step}`;
	useEffect(() => {
		const v = videoRef.current;
		if (!v) return;
		playsRef.current = 0;
		v.currentTime = 0;
		v.play().catch(() => {});
	}, [messageKey]);

	const handleEnded = () => {
		const v = videoRef.current;
		if (!v) return;
		playsRef.current += 1;
		if (playsRef.current < LOOPS_PER_STEP) {
			v.currentTime = 0;
			v.play().catch(() => {});
		}
		// else: leave paused on the last frame
	};

	// Continue only advances the intro script — not while showing an overview.
	const showContinue = !activeModule && step < SCRIPT.length - 1;

	return (
		<div
			className={`gracieGuide${activeModule ? ' gracieGuide--front' : ''}`}
			aria-live="polite"
		>
			{/* Portrait video box */}
			<div className="gracieGuide__videoBox">
				<video
					ref={videoRef}
					className="gracieGuide__video"
					src={GRACIE_VIDEO_SRC}
					muted
					playsInline
					onEnded={handleEnded}
					aria-label="Gracie, your city guide"
				/>
			</div>

			<div className="gracieGuide__bubbleWrap">
				<div className="gracieGuide__bubble">{message}</div>
				{showContinue && (
					<button
						type="button"
						className="gracieGuide__continue"
						onClick={() => setStep((s) => s + 1)}
					>
						Continue
					</button>
				)}
			</div>
		</div>
	);
}
