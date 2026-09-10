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
}

/** Sections are patched one at a time — see `useSettings().update`. */
export type SettingsSectionKey = keyof AppSettings;
