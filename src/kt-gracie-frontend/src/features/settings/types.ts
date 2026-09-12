/** How the app picks its palette. `system` follows the OS setting live. */
export type ThemeMode = 'light' | 'dark' | 'system';

/** The theme actually painted — `system` resolved against the OS preference. */
export type ResolvedTheme = 'light' | 'dark';

/** Accent ramps defined in styles/theme.css. */
export type AccentId = 'ocean' | 'sunset' | 'forest' | 'grape';

export type TextScale = 'small' | 'medium' | 'large';

/** How fast Gracie speaks. Maps to a speech-synthesis rate. */
export type GuidePace = 'slow' | 'standard' | 'brisk';

/**
 * How often the scripted intro walkthrough plays.
 *
 *  - `always` — every time the city loads (the old behaviour)
 *  - `daily`  — the first city visit of each calendar day
 *  - `weekly` — at most once every seven days
 *  - `once`   — the first visit only, then never again
 *  - `never`  — skip it; Gracie starts docked in her corner
 */
export type IntroFrequency = 'always' | 'daily' | 'weekly' | 'once' | 'never';

export interface AppearanceSettings {
	theme: ThemeMode;
	accent: AccentId;
	textScale: TextScale;
	/** Suppress animations app-wide (city floats, drawers, cloud drift). */
	reduceMotion: boolean;
	/** Stronger ink/hairline contrast and thicker focus rings. */
	highContrast: boolean;
}

export interface GuideSettings {
	/** Show Gracie at all. Off hides her, her bubble and her narration. */
	visible: boolean;
	/** Gracie reads her lines aloud via the browser's speech synthesiser. */
	audio: boolean;
	/** Speech volume, 0–1. */
	volume: number;
	/** `SpeechSynthesisVoice.voiceURI`, or null for the browser default. */
	voiceURI: string | null;
	pace: GuidePace;
	/** Keep her speech bubble on screen (text captions of what she says). */
	captions: boolean;
	/** How often the scripted intro walkthrough plays. */
	introFrequency: IntroFrequency;
	/** Narrate a briefing when a district's module drawer opens. */
	districtBriefings: boolean;
}

/**
 * Which Gracie brain answers. See issue #50 (AI Gracie Phase 1).
 *
 *  - `robot`        — scripted replies only; no download, works everywhere.
 *  - `intelligence` — a small model runs in this browser tab and writes her
 *                     wording. Costs a one-off download and some memory.
 */
export type GracieBrain = 'robot' | 'intelligence';

export interface AiSettings {
	/** Which brain to use. `robot` by default — Intelligence mode is opt-in
	 *  because it downloads a model. */
	brain: GracieBrain;
	/** Load the model as soon as the city opens, rather than on first question. */
	preload: boolean;
	/** Show the route and speed strip under each reply. Off for learners, on
	 *  when demonstrating how the thing works. */
	showDebug: boolean;
}

/**
 * How the app phrases its learning content.
 *
 *  - `simple`   — short sentences and everyday words, for learners still
 *                 building their English or new to the subject
 *  - `standard` — the default wording
 *  - `advanced` — technical, policy and legal vocabulary for learners who
 *                 already know the field
 */
export type ReadingLevel = 'simple' | 'standard' | 'advanced';

/** A reading level, or `auto` to pick one from the learner's profile. */
export type ReadingLevelSetting = ReadingLevel | 'auto';

export interface LearningSettings {
	/** Which wording of every lesson, district and Gracie line is shown. */
	readingLevel: ReadingLevelSetting;
}

export interface CitySettings {
	/** Drifting PixiJS cloud layer. */
	clouds: boolean;
	/** Hot-air balloon that trails the cursor. */
	balloonCursor: boolean;
	/** Idle bobbing of the district islands. */
	floatingDistricts: boolean;
}

export interface AppSettings {
	appearance: AppearanceSettings;
	guide: GuideSettings;
	city: CitySettings;
	ai: AiSettings;
	learning: LearningSettings;
}

/** Sections are patched one at a time — see `useSettings().update`. */
export type SettingsSectionKey = keyof AppSettings;
