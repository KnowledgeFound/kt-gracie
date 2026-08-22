import { Building2, Cloud } from 'lucide-react';
import { useSettings } from '../context';
import SettingRow from './SettingRow';
import SettingsCard from './SettingsCard';
import Toggle from './Toggle';

/** Ambient effects on the city map — all pure decoration, all optional. */
export default function CityPanel() {
	const { settings, update } = useSettings();
	const { clouds, balloonCursor, floatingDistricts } = settings.city;
	const reduceMotion = settings.appearance.reduceMotion;

	return (
		<div className="space-y-4">
			<SettingsCard
				icon={Cloud}
				title="City ambience"
				description="Decoration only — none of this affects your progress."
				footer={
					reduceMotion ? (
						<p className="text-xs text-ink-muted">
							Reduce motion is on, so animations stay still even where these
							are enabled.
						</p>
					) : (
						<p className="text-xs text-ink-muted">
							Turning effects off can help on older devices.
						</p>
					)
				}
			>
				<SettingRow
					title="Drifting clouds"
					description="The animated cloud layer above the districts."
				>
					<Toggle
						label="Drifting clouds"
						checked={clouds}
						onChange={(next) => update('city', { clouds: next })}
					/>
				</SettingRow>

				<SettingRow
					title="Balloon cursor"
					description="A hot-air balloon that trails your pointer around the map."
				>
					<Toggle
						label="Balloon cursor"
						checked={balloonCursor}
						onChange={(next) => update('city', { balloonCursor: next })}
					/>
				</SettingRow>

				<SettingRow
					title="Floating districts"
					description="The gentle bobbing of each island."
				>
					<Toggle
						label="Floating districts"
						checked={floatingDistricts}
						onChange={(next) => update('city', { floatingDistricts: next })}
					/>
				</SettingRow>
			</SettingsCard>

			<SettingsCard
				icon={Building2}
				title="About the city"
				description="How your city reacts to what you do."
			>
				<div className="px-4 py-4 text-sm leading-relaxed text-ink-mid sm:px-5">
					Your city's health rises when you pass assessments and slips when
					modules go untouched. Nothing on this page changes that — these are
					display options only.
				</div>
			</SettingsCard>
		</div>
	);
}
