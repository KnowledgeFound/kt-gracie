import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import {
	getIntroLastShown,
	isIntroDue,
	markIntroShown,
	speak,
	speechSupported,
	stopSpeaking,
	useSettings,
} from '@/features/settings';
import { getModule, getModuleProgress } from '../constants';
import type { Module } from '../types';

const GRACIE_VIDEO_SRC = '/assets/talking-gracie.webm';

// Short intro script. Each entry is one speech bubble; the user advances with
// the Continue button. Swap for dynamic/localized content later.
const SCRIPT = [
	"Hi, I'm Gracie! I'm here to guide you through your anti-corruption city.",
	'Your city is in danger of corruption. If you do well in the quizzes and games, you will save your city. Do poorly and it collapses into corruption. Keep that health meter high!',
	"Click on any city district and I'll guide you through each module.",
];

// The talking loop plays this many times per message, then stops.
const LOOPS_PER_STEP = 2;

// Beat before she starts rising, so the city reads for a moment first.
const ENTER_DELAY_MS = 250;

// How long the centre → lower-left glide takes. Must match the `transform`
// transition on `.gracieGuide` in city.css.
const DOCK_MS = 1150;

/**
 * Where Gracie sits on screen.
 *  - `enter`  — off-screen below her centre mark, invisible (initial frame)
 *  - `center` — centre stage over a dimming veil, delivering the intro script
 *  - `docked` — parked lower-left, veil gone, city back in focus
 */
type Phase = 'enter' | 'center' | 'docked';

/**
 * What Gracie says about the district the user just clicked — the module's own
 * copy from constants.ts, plus where they left off if they have started it.
 */
function moduleBriefing(module: Module): string {
	const progress = getModuleProgress(module.id);
	const intro = `This is the ${module.name} district — built for ${module.audience}.`;

	if (!progress) return `${intro} ${module.description}`;

	return `${intro} You're ${progress.percentComplete}% of the way through. Next up: ${progress.currentLesson.title}.`;
}

interface Props {
	/** The currently open module (its district drawer). When set, Gracie gives
	 *  an overview of it instead of the intro script. */
	moduleId?: number | null;
	/** Fired once the intro script is finished and Gracie starts docking. */
	onIntroDone?: () => void;
}

/**
 * Game-style NPC guide for the city scene.
 *
 * On mount she rises from the bottom of the screen to centre stage over a
 * gradient veil that dims the city, walks the user through a short scripted
 * intro, then docks to the lower-left as the veil fades and the city takes
 * focus. Afterwards — when a district's module drawer is open — she narrates a
 * quick overview of that module. For each message Gracie's talking clip plays
 * exactly {@link LOOPS_PER_STEP} times, then freezes.
 */
export default function GracieGuide({ moduleId = null, onIntroDone }: Props) {
	const { settings, update } = useSettings();
	const guide = settings.guide;
	const [step, setStep] = useState(0);
	const [phase, setPhase] = useState<Phase>('enter');
	// True while she is still travelling to the corner — keeps her stacked above
	// the veil that is fading out underneath her.
	const [settling, setSettling] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const playsRef = useRef(0);

	// Decided once, on arrival: whether this visit is one where the intro is due
	// (see the schedule in Settings → Guide). Freezing it means changing the
	// setting mid-visit can't yank her back to centre stage.
	const [introDue] = useState(() =>
		isIntroDue(guide.introFrequency, getIntroLastShown()),
	);

	// Kick off the rise on the frame after mount so the browser has the
	// `enter` transform to animate away from. Skipped when the intro is not due —
	// otherwise this timer would pull her back to centre stage right after the
	// effect below docks her.
	useEffect(() => {
		if (!introDue) return;
		const id = setTimeout(() => setPhase('center'), ENTER_DELAY_MS);
		return () => clearTimeout(id);
	}, [introDue]);

	const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const doneRef = useRef(false);
	const finishIntro = useCallback(() => {
		if (doneRef.current) return;
		doneRef.current = true;
		// Stamp the schedule only when the intro actually played. Stamping on
		// every visit would keep pushing "once a week" out of reach.
		if (introDue) markIntroShown();
		setPhase('docked');
		setSettling(true);
		settleTimer.current = setTimeout(() => setSettling(false), DOCK_MS);
		onIntroDone?.();
	}, [introDue, onIntroDone]);

	useEffect(
		() => () => {
			if (settleTimer.current) clearTimeout(settleTimer.current);
		},
		[],
	);

	// Esc skips the rest of the intro.
	useEffect(() => {
		if (phase === 'docked') return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') finishIntro();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [phase, finishIntro]);

	// Not due this visit — she goes straight to her corner so the city is usable
	// from the first frame.
	useEffect(() => {
		if (!introDue) finishIntro();
	}, [introDue, finishIntro]);

	// District briefings are opt-out: with them off she keeps her idle prompt
	// instead of narrating every drawer that opens.
	const activeModule =
		moduleId !== null && guide.districtBriefings
			? getModule(moduleId) ?? null
			: null;
	const introRunning = phase !== 'docked';

	// The open district wins; during the intro she reads the script; once docked
	// with nothing open she holds on the "click a district" prompt rather than
	// whichever line the user skipped out of.
	const message = activeModule
		? moduleBriefing(activeModule)
		: introRunning
		? SCRIPT[step]
		: SCRIPT[SCRIPT.length - 1];

	// Replay the talking clip whenever the shown message changes.
	const messageKey = activeModule
		? `module-${activeModule.id}`
		: introRunning
		? `step-${step}`
		: 'idle';
	useEffect(() => {
		const v = videoRef.current;
		if (!v) return;
		playsRef.current = 0;
		v.currentTime = 0;
		v.play().catch(() => {});
	}, [messageKey]);

	// Read the line aloud when guide audio is on. Keyed on `messageKey` as well
	// as the text so she restarts in step with the talking clip even when two
	// messages happen to read the same, and the line she is part-way through is
	// always interrupted by the new one. Re-runs on every voice change so a tweak
	// in Settings is heard on the next line, and cancels on unmount so she never
	// talks over another screen.
	useEffect(() => {
		if (!guide.audio || !speechSupported) return;
		return speak(message, {
			voiceURI: guide.voiceURI,
			pace: guide.pace,
			volume: guide.volume,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [messageKey, message, guide.audio, guide.voiceURI, guide.pace, guide.volume]);

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

	const isLastLine = step === SCRIPT.length - 1;

	const handleContinue = () => {
		if (isLastLine) finishIntro();
		else setStep((s) => s + 1);
	};

	// Mute/unmute from the bubble itself — the same switch as Settings.
	const toggleAudio = () => {
		if (guide.audio) stopSpeaking();
		update('guide', { audio: !guide.audio });
	};

	return (
		<>
			{/* Gradient veil that pulls focus onto Gracie during the intro and
			    wears off as she docks. Also swallows clicks on the city. */}
			<div
				aria-hidden="true"
				className={`gracieIntroVeil${
					introRunning ? ' gracieIntroVeil--on' : ''
				}`}
			/>

			<div
				className={[
					'gracieGuide',
					`gracieGuide--${phase}`,
					introRunning ? 'gracieGuide--intro' : '',
					introRunning || settling ? 'gracieGuide--elevated' : '',
					activeModule ? 'gracieGuide--front' : '',
				]
					.filter(Boolean)
					.join(' ')}
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
						/* Have her first frame decoded before she rises — otherwise the
						   entrance plays against an empty box. */
						preload="auto"
						onEnded={handleEnded}
						aria-label="Gracie, your city guide"
					/>
				</div>

				<div className="gracieGuide__bubbleWrap">
					{/* Captions off — she still talks (if audio is on), just silently
					    on screen. The intro controls below stay either way. */}
					{guide.captions && (
						<div className="gracieGuide__bubble">
							{speechSupported && (
								<button
									type="button"
									className="gracieGuide__audioBtn"
									onClick={toggleAudio}
									aria-label={
										guide.audio ? 'Mute guide audio' : 'Have Gracie read aloud'
									}
									title={
										guide.audio ? 'Mute guide audio' : 'Have Gracie read aloud'
									}
								>
									{guide.audio ? (
										<Volume2 className="size-3.5" />
									) : (
										<VolumeX className="size-3.5" />
									)}
								</button>
							)}

							{message}
							{introRunning && (
								<span className="gracieGuide__dots" aria-hidden="true">
									{SCRIPT.map((_, i) => (
										<span
											key={i}
											className={`gracieGuide__dot${
												i === step ? ' gracieGuide__dot--on' : ''
											}`}
										/>
									))}
								</span>
							)}
						</div>
					)}

					{introRunning && (
						<div className="gracieGuide__actions">
							{!isLastLine && (
								<button
									type="button"
									className="gracieGuide__skip"
									onClick={finishIntro}
								>
									Skip intro
								</button>
							)}
							<button
								type="button"
								className="gracieGuide__continue"
								onClick={handleContinue}
								autoFocus
							>
								{isLastLine ? 'Explore my city' : 'Continue'}
							</button>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
