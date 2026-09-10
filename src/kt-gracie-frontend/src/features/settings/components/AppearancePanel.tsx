import { Contrast, Palette, Type, Waves, Zap } from 'lucide-react';
import { useSettings } from '../context';
import { TEXT_SCALE_OPTIONS } from '../constants';
import AccentPicker from './AccentPicker';
import SegmentedControl from './SegmentedControl';
import SettingRow from './SettingRow';
import SettingsCard from './SettingsCard';
import ThemePicker from './ThemePicker';
import Toggle from './Toggle';

/** Theme, accent, text size and the two accessibility switches. */
export default function AppearancePanel() {
	const { settings, resolvedTheme, update } = useSettings();
	const { theme, accent, textScale, reduceMotion, highContrast } =
		settings.appearance;

	return (
		<div className="space-y-4">
			<SettingsCard
				icon={Palette}
				title="Theme"
				description="Applies everywhere — the city, drawers and every screen."
			>
				<div className="px-4 py-4 sm:px-5">
					<ThemePicker
						value={theme}
						resolved={resolvedTheme}
						onChange={(next) => update('appearance', { theme: next })}
					/>
				</div>

				<SettingRow
					title="Accent colour"
					description="Tints buttons, badges and progress bars."
				>
					<AccentPicker
						value={accent}
						onChange={(next) => update('appearance', { accent: next })}
					/>
				</SettingRow>
			</SettingsCard>

			<SettingsCard
				icon={Type}
				title="Readability"
				description="Tune the interface to how you read best."
			>
				<SettingRow title="Text size" description="Scales all text in the app.">
					<SegmentedControl
						label="Text size"
						options={TEXT_SCALE_OPTIONS}
						value={textScale}
						onChange={(next) => update('appearance', { textScale: next })}
					/>
				</SettingRow>

				<SettingRow
					title="High contrast"
					description="Darker labels, stronger borders and thicker focus rings."
				>
					<div className="flex items-center gap-2">
						<Contrast className="size-4 text-ink-subtle" aria-hidden="true" />
						<Toggle
							label="High contrast"
							checked={highContrast}
							onChange={(next) => update('appearance', { highContrast: next })}
						/>
					</div>
				</SettingRow>

				<SettingRow
					title="Reduce motion"
					description="Stops floating districts, drifting clouds and drawer springs."
				>
					<div className="flex items-center gap-2">
						{reduceMotion ? (
							<Waves className="size-4 text-ink-subtle" aria-hidden="true" />
						) : (
							<Zap className="size-4 text-ink-subtle" aria-hidden="true" />
						)}
						<Toggle
							label="Reduce motion"
							checked={reduceMotion}
							onChange={(next) => update('appearance', { reduceMotion: next })}
						/>
					</div>
				</SettingRow>
			</SettingsCard>
		</div>
	);
}
