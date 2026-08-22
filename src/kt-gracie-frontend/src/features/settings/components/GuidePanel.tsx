import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	AlertTriangle,
	CalendarClock,
	EyeOff,
	MessageSquare,
	Play,
	RefreshCw,
	Square,
	UserRound,
	Volume2,
	VolumeX,
} from 'lucide-react';
import { useUser } from '@/features/auth';
import type { Tone } from '@/types/user';
import { useSettings } from '../context';
import {
	INTRO_FREQUENCY_OPTIONS,
	PACE_OPTIONS,
	VOICE_SAMPLE,
} from '../constants';
import {
	clearIntroShown,
	getIntroLastShown,
	getIntroNextDue,
	isIntroDue,
} from '../service';
import { speak, speechSupported, stopSpeaking, useVoices } from '../speech';
import ChoiceList from './ChoiceList';
import RangeSlider from './RangeSlider';
import SegmentedControl from './SegmentedControl';
import SettingRow from './SettingRow';
import SettingsCard from './SettingsCard';
import Toggle from './Toggle';

const TONE_OPTIONS: { value: Tone; label: string }[] = [
	{ value: 'playful', label: 'Playful' },
	{ value: 'neutral', label: 'Neutral' },
	{ value: 'formal',  label: 'Formal'  },
];

const inputCls =
	'w-full rounded-xl border border-line-soft bg-surface-muted px-3 py-2 text-sm ' +
	'text-ink-deep placeholder:text-ink-subtle focus:border-brand-400 focus:outline-none ' +
	'focus:ring-2 focus:ring-brand-400/40 disabled:opacity-50';

function formatWhen(date: Date): string {
	const today = new Date();
	if (
		date.getFullYear() === today.getFullYear() &&
		date.getMonth() === today.getMonth() &&
		date.getDate() === today.getDate()
	) {
		return `today at ${date.toLocaleTimeString(undefined, {
			hour: 'numeric',
			minute: '2-digit',
		})}`;
	}
	return date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
	});
}

/** Gracie's character, her narration, her voice, and when she shows up. */
export default function GuidePanel() {
	const navigate = useNavigate();
	const { settings, update } = useSettings();
	const { user, updateGracie } = useUser();
	const voices = useVoices();
	const [previewing, setPreviewing] = useState(false);
	// Bumped after "Play it now" so the schedule line below re-reads storage.
	const [scheduleTick, setScheduleTick] = useState(0);
	const guide = settings.guide;

	// Never leave a preview talking over the next screen.
	const stopRef = useRef<() => void>(() => {});
	useEffect(() => () => stopRef.current(), []);

	const gracieName = user?.gracie.name ?? 'Gracie';
	const audioAvailable = speechSupported && guide.visible;

	// Recomputed whenever the schedule changes, so the status line under the
	// choices always describes the setting the user is looking at.
	const { lastShown, dueNow, nextDue } = useMemo(() => {
		const last = getIntroLastShown();
		return {
			lastShown: last,
			dueNow: isIntroDue(guide.introFrequency, last),
			nextDue: getIntroNextDue(guide.introFrequency, last),
		};
	}, [guide.introFrequency, scheduleTick]);

	function preview(overrides: Partial<typeof guide> = {}) {
		const next = { ...guide, ...overrides };
		setPreviewing(true);
		stopRef.current = speak(VOICE_SAMPLE, {
			voiceURI: next.voiceURI,
			pace: next.pace,
			volume: next.volume,
			onEnd: () => setPreviewing(false),
		});
	}

	function stopPreview() {
		stopSpeaking();
		setPreviewing(false);
	}

	function replayIntro() {
		clearIntroShown();
		setScheduleTick((t) => t + 1);
		navigate('/city');
	}

	return (
		<div className="space-y-4">
			{/* ── Character ──────────────────────────────────────────────────── */}
			<SettingsCard
				icon={guide.visible ? UserRound : EyeOff}
				title="Your guide"
				description="Who walks you through the city and its modules."
				footer={
					!guide.visible && (
						<p className="text-xs text-ink-muted">
							{gracieName} is hidden, so nothing below applies until you turn
							her back on.
						</p>
					)
				}
			>
				<SettingRow
					title={`Show ${gracieName}`}
					description="Turn off to explore the city without a guide on screen."
				>
					<Toggle
						label="Show the guide"
						checked={guide.visible}
						onChange={(visible) => {
							if (!visible) stopSpeaking();
							update('guide', { visible });
						}}
					/>
				</SettingRow>

				<SettingRow
					title="Guide name"
					description="What she is called in speech bubbles and menus."
					htmlFor="gracie-name"
					stacked
				>
					<input
						id="gracie-name"
						type="text"
						maxLength={24}
						defaultValue={gracieName}
						placeholder="Gracie"
						className={inputCls}
						disabled={!user || !guide.visible}
						onBlur={(e) => {
							const name = e.target.value.trim();
							if (user && name && name !== user.gracie.name) {
								updateGracie({ name });
							}
						}}
					/>
				</SettingRow>

				<SettingRow
					title="Tone"
					description="How she phrases encouragement and briefings."
				>
					<SegmentedControl
						label="Guide tone"
						disabled={!guide.visible}
						options={TONE_OPTIONS}
						value={user?.gracie.tone ?? 'neutral'}
						onChange={(tone) => updateGracie({ tone })}
					/>
				</SettingRow>

				<SettingRow
					title="Speech bubbles"
					description="Show what she says as text. Turn off for a quieter screen."
				>
					<Toggle
						label="Speech bubbles"
						disabled={!guide.visible}
						checked={guide.captions && guide.visible}
						onChange={(captions) => update('guide', { captions })}
					/>
				</SettingRow>
			</SettingsCard>

			{/* ── Voice ─────────────────────────────────────────────────────── */}
			<SettingsCard
				icon={guide.audio && audioAvailable ? Volume2 : VolumeX}
				title="Guide audio"
				description={`Have ${gracieName} read her lines aloud.`}
				footer={
					speechSupported ? (
						<div className="flex items-center justify-between gap-3">
							<p className="text-xs text-ink-muted">
								Voices come from your device, so the list differs by browser.
							</p>
							<button
								type="button"
								disabled={!audioAvailable}
								onClick={() => (previewing ? stopPreview() : preview())}
								className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
							>
								{previewing ? (
									<>
										<Square className="size-3" /> Stop
									</>
								) : (
									<>
										<Play className="size-3" /> Preview voice
									</>
								)}
							</button>
						</div>
					) : (
						<p className="flex items-start gap-2 text-xs text-ink-muted">
							<AlertTriangle className="mt-px size-3.5 flex-shrink-0 text-amber-500" />
							This browser has no speech synthesiser, so guide audio is
							unavailable here. Speech bubbles still work.
						</p>
					)
				}
			>
				<SettingRow
					title="Read lines aloud"
					description="She speaks each bubble as it appears. Off means she is text-only."
				>
					<Toggle
						label="Read lines aloud"
						disabled={!audioAvailable}
						checked={guide.audio && audioAvailable}
						onChange={(audio) => {
							update('guide', { audio });
							if (!audio) stopPreview();
						}}
					/>
				</SettingRow>

				<SettingRow
					title="Volume"
					description="How loud her voice is."
					htmlFor="guide-volume"
					stacked
				>
					<RangeSlider
						id="guide-volume"
						aria-label="Guide volume"
						value={guide.volume}
						disabled={!audioAvailable || !guide.audio}
						valueLabel={`${Math.round(guide.volume * 100)}%`}
						onChange={(volume) => update('guide', { volume })}
					/>
				</SettingRow>

				<SettingRow
					title="Speaking pace"
					description="Slow it down if she talks over you."
				>
					<SegmentedControl
						label="Speaking pace"
						disabled={!audioAvailable || !guide.audio}
						options={PACE_OPTIONS}
						value={guide.pace}
						onChange={(pace) => {
							update('guide', { pace });
							if (guide.audio && audioAvailable) preview({ pace });
						}}
					/>
				</SettingRow>

				{speechSupported && (
					<SettingRow
						title="Voice"
						description="Pick any voice installed on this device."
						htmlFor="guide-voice"
						stacked
					>
						<select
							id="guide-voice"
							className={inputCls}
							disabled={!audioAvailable || !guide.audio}
							value={guide.voiceURI ?? ''}
							onChange={(e) => {
								const voiceURI = e.target.value || null;
								update('guide', { voiceURI });
								if (guide.audio && audioAvailable) preview({ voiceURI });
							}}
						>
							<option value="">System default</option>
							{voices.map((voice) => (
								<option key={voice.voiceURI} value={voice.voiceURI}>
									{voice.name} — {voice.lang}
								</option>
							))}
						</select>
					</SettingRow>
				)}
			</SettingsCard>

			{/* ── Intro schedule ────────────────────────────────────────────── */}
			<SettingsCard
				icon={CalendarClock}
				title="Intro walkthrough"
				description="The welcome tour of the city. Choose how often it comes back."
				footer={
					<div className="flex flex-wrap items-center justify-between gap-3">
						<p className="text-xs text-ink-muted">
							{guide.introFrequency === 'never'
								? 'The intro is off — use the button to watch it once.'
								: lastShown
								? `Last played ${formatWhen(lastShown)}. ${
										dueNow
											? 'It will play on your next city visit.'
											: nextDue
											? `Next on ${formatWhen(nextDue)}.`
											: 'It will not play again.'
								  }`
								: "You haven't seen it yet — it plays on your next city visit."}
						</p>
						<button
							type="button"
							onClick={replayIntro}
							className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-line-strong px-3 py-1.5 text-xs font-bold text-ink-deep transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted"
						>
							<RefreshCw className="size-3" />
							Play it now
						</button>
					</div>
				}
			>
				<div className="px-4 py-4 sm:px-5">
					<ChoiceList
						label="How often the intro plays"
						options={INTRO_FREQUENCY_OPTIONS}
						value={guide.introFrequency}
						disabled={!guide.visible}
						onChange={(introFrequency) => update('guide', { introFrequency })}
					/>
				</div>

				<SettingRow
					title="District briefings"
					description="A short summary each time you open a district's module."
				>
					<Toggle
						label="District briefings"
						disabled={!guide.visible}
						checked={guide.districtBriefings && guide.visible}
						onChange={(districtBriefings) =>
							update('guide', { districtBriefings })
						}
					/>
				</SettingRow>
			</SettingsCard>

			{/* A quiet reminder of what the guide looks like right now. */}
			<p className="flex items-center justify-center gap-1.5 text-[11px] text-ink-subtle">
				<MessageSquare className="size-3" />
				{guide.visible
					? guide.audio && audioAvailable
						? `${gracieName} appears on the city map and speaks her lines.`
						: `${gracieName} appears on the city map, in text only.`
					: `${gracieName} stays hidden.`}
			</p>
		</div>
	);
}
