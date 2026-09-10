// Public API for the settings feature.
export { SettingsProvider, useSettings } from './context';
export {
	DEFAULT_SETTINGS,
	SETTINGS_STORAGE_KEY,
	INTRO_SEEN_STORAGE_KEY,
	INTRO_FREQUENCY_OPTIONS,
	PACE_RATE,
} from './constants';
export {
	loadSettings,
	saveSettings,
	clearSettings,
	getIntroLastShown,
	getIntroNextDue,
	markIntroShown,
	clearIntroShown,
	isIntroDue,
} from './service';
export { speak, stopSpeaking, speechSupported, useVoices } from './speech';

export { default as AppearancePanel } from './components/AppearancePanel';
export { default as GuidePanel } from './components/GuidePanel';
export { default as CityPanel } from './components/CityPanel';
export { default as AccountPanel } from './components/AccountPanel';
export { default as SettingsCard } from './components/SettingsCard';
export { default as SettingRow } from './components/SettingRow';
export { default as SegmentedControl } from './components/SegmentedControl';
export { default as ChoiceList } from './components/ChoiceList';
export { default as Toggle } from './components/Toggle';
export { default as RangeSlider } from './components/RangeSlider';

export type {
	AppSettings,
	AppearanceSettings,
	GuideSettings,
	CitySettings,
	ThemeMode,
	ResolvedTheme,
	AccentId,
	TextScale,
	GuidePace,
	IntroFrequency,
} from './types';
