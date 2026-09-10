import type {
	AccentId,
	AppSettings,
	GuidePace,
	IntroFrequency,
	TextScale,
	ThemeMode,
} from './types';

/** localStorage key. Sits alongside `gracie_user` / `city`. */
export const SETTINGS_STORAGE_KEY = 'gracie_settings';

/**
 * When the intro walkthrough last played, as an ISO string.
 *
 * Kept out of {@link SETTINGS_STORAGE_KEY} on purpose: it is a record of what
 * happened, not a preference, so "reset settings" must not wipe it and make
 * every "once a week" user sit through the intro again.
 */
export const INTRO_SEEN_STORAGE_KEY = 'gracie_intro_seen';

export const DEFAULT_SETTINGS: AppSettings = {
	appearance: {
		// Light unless the user asks for otherwise — the city artwork is painted
		// for a bright sky, so that is the app's intended look out of the box.
		theme: 'light',
		accent: 'ocean',
		textScale: 'medium',
		reduceMotion: false,
		highContrast: false,
	},
	guide: {
		visible: true,
		audio: false,
		volume: 0.8,
		voiceURI: null,
		pace: 'standard',
		captions: true,
		introFrequency: 'daily',
		districtBriefings: true,
	},
	city: {
		clouds: true,
		balloonCursor: true,
		floatingDistricts: true,
	},
};

// ─── Option tables (label + blurb for the settings UI) ───────────────────────

export const THEME_OPTIONS: {
	value: ThemeMode;
	label: string;
	description: string;
}[] = [
	{ value: 'light',  label: 'Light',  description: 'Bright daytime city'          },
	{ value: 'dark',   label: 'Dark',   description: 'Easy on the eyes at night'    },
	{ value: 'system', label: 'System', description: 'Match your device setting'    },
];

export const ACCENT_OPTIONS: {
	value: AccentId;
	label: string;
	/** Preview swatch — mirrors --brand-400/--brand-600 in theme.css. */
	from: string;
	to: string;
}[] = [
	{ value: 'ocean',  label: 'Ocean',  from: '#5cb8e8', to: '#3a9ad9' },
	{ value: 'sunset', label: 'Sunset', from: '#fb923c', to: '#ea580c' },
	{ value: 'forest', label: 'Forest', from: '#34d399', to: '#059669' },
	{ value: 'grape',  label: 'Grape',  from: '#a78bfa', to: '#7c3aed' },
];

export const TEXT_SCALE_OPTIONS: { value: TextScale; label: string }[] = [
	{ value: 'small',  label: 'Small'   },
	{ value: 'medium', label: 'Default' },
	{ value: 'large',  label: 'Large'   },
];

export const PACE_OPTIONS: { value: GuidePace; label: string }[] = [
	{ value: 'slow',     label: 'Slow'  },
	{ value: 'standard', label: 'Normal' },
	{ value: 'brisk',    label: 'Brisk' },
];

export const INTRO_FREQUENCY_OPTIONS: {
	value: IntroFrequency;
	label: string;
	description: string;
}[] = [
	{
		value: 'daily',
		label: 'Once a day',
		description: 'On your first visit to the city each day.',
	},
	{
		value: 'weekly',
		label: 'Once a week',
		description: 'At most once every seven days.',
	},
	{
		value: 'once',
		label: 'Only once',
		description: 'The first time, then never again.',
	},
	{
		value: 'always',
		label: 'Every visit',
		description: 'Every time the city loads, including refreshes.',
	},
	{
		value: 'never',
		label: 'Never',
		description: 'Skip it — Gracie starts in her corner.',
	},
];

/** Speech-synthesis rate per pace. 1 is the browser's normal speed. */
export const PACE_RATE: Record<GuidePace, number> = {
	slow: 0.82,
	standard: 1,
	brisk: 1.2,
};

/** Spoken when the user previews a voice in Settings. */
export const VOICE_SAMPLE =
	"Hi, I'm Gracie. I'll guide you through your city and keep corruption out.";
