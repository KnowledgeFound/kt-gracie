import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import { DEFAULT_SETTINGS } from './constants';
import { clearSettings, loadSettings, saveSettings } from './service';
import type { AppSettings, ResolvedTheme, SettingsSectionKey } from './types';

// ─── Shape ────────────────────────────────────────────────────────────────────

interface SettingsContextValue {
	settings: AppSettings;
	/** The theme actually painted — `system` resolved against the OS. */
	resolvedTheme: ResolvedTheme;
	/** Patch one section; the rest is left untouched and the whole blob saved. */
	update: <K extends SettingsSectionKey>(
		section: K,
		patch: Partial<AppSettings[K]>,
	) => void;
	/** Back to factory defaults (also clears the stored blob). */
	reset: () => void;
	/** True while a save has just happened — drives the "Saved" pip. */
	isDirty: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DARK_QUERY = '(prefers-color-scheme: dark)';

function prefersDark(): boolean {
	return (
		typeof window !== 'undefined' &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia(DARK_QUERY).matches
	);
}

/**
 * Push the resolved settings onto <html> as data attributes.
 * styles/theme.css keys every token off these, so one write repaints the app.
 */
function applyToDocument(settings: AppSettings, theme: ResolvedTheme): void {
	const root = document.documentElement;
	const { accent, textScale, reduceMotion, highContrast } = settings.appearance;

	root.dataset.theme = theme;
	root.dataset.accent = accent;
	root.dataset.textScale = textScale;
	root.dataset.motion = reduceMotion ? 'reduced' : 'full';
	root.dataset.contrast = highContrast ? 'high' : 'normal';
	// Tailwind's `dark:` variant is wired to both the class and the attribute.
	root.classList.toggle('dark', theme === 'dark');
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SettingsProvider({ children }: { children: ReactNode }) {
	const [settings, setSettings] = useState<AppSettings>(loadSettings);
	const [systemDark, setSystemDark] = useState<boolean>(prefersDark);
	const [isDirty, setIsDirty] = useState(false);

	const resolvedTheme: ResolvedTheme =
		settings.appearance.theme === 'system'
			? systemDark
				? 'dark'
				: 'light'
			: settings.appearance.theme;

	// Follow the OS while the theme is set to `system`.
	useEffect(() => {
		if (typeof window.matchMedia !== 'function') return;
		const media = window.matchMedia(DARK_QUERY);
		const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
		media.addEventListener('change', onChange);
		return () => media.removeEventListener('change', onChange);
	}, []);

	// Paint. Runs on mount too, so a stored theme survives a reload.
	useEffect(() => {
		applyToDocument(settings, resolvedTheme);
	}, [settings, resolvedTheme]);

	const update = useCallback(
		<K extends SettingsSectionKey>(
			section: K,
			patch: Partial<AppSettings[K]>,
		) => {
			setSettings((prev) => {
				const next: AppSettings = {
					...prev,
					[section]: { ...prev[section], ...patch },
				};
				saveSettings(next);
				return next;
			});
			setIsDirty(true);
		},
		[],
	);

	const reset = useCallback(() => {
		clearSettings();
		setSettings(DEFAULT_SETTINGS);
		setIsDirty(true);
	}, []);

	// The "Saved" pip is a confirmation, not a state — let it fade.
	useEffect(() => {
		if (!isDirty) return;
		const id = setTimeout(() => setIsDirty(false), 1600);
		return () => clearTimeout(id);
	}, [isDirty, settings]);

	const value = useMemo<SettingsContextValue>(
		() => ({ settings, resolvedTheme, update, reset, isDirty }),
		[settings, resolvedTheme, update, reset, isDirty],
	);

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Read and change app settings from anywhere inside <SettingsProvider>.
 * Falls back to the defaults (read-only) outside a provider so isolated
 * component tests don't have to wrap everything.
 */
export function useSettings(): SettingsContextValue {
	const ctx = useContext(SettingsContext);
	if (ctx) return ctx;

	const fallbackTheme = DEFAULT_SETTINGS.appearance.theme;
	return {
		settings: DEFAULT_SETTINGS,
		resolvedTheme:
			fallbackTheme === 'system'
				? prefersDark()
					? 'dark'
					: 'light'
				: fallbackTheme,
		update: () => {},
		reset: () => {},
		isDirty: false,
	};
}
