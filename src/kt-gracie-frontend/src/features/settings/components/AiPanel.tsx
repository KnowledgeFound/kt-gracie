import { Cpu, ScanEye } from 'lucide-react';
import { ModelStatusCard, useGracieAI } from '@/features/gracie-ai';
import { useSettings } from '../context';
import SegmentedControl from './SegmentedControl';
import SettingRow from './SettingRow';
import SettingsCard from './SettingsCard';
import Toggle from './Toggle';
import type { GracieBrain } from '../types';

const BRAIN_OPTIONS: { value: GracieBrain; label: string }[] = [
	{ value: 'robot',        label: 'Robot'        },
	{ value: 'intelligence', label: 'Intelligence' },
];

/**
 * Settings for Gracie's brain (issue #50).
 *
 * Intelligence mode is presented with its cost stated up front — it downloads a
 * model, and that is the learner's data allowance being spent, not ours.
 */
export default function AiPanel() {
	const { settings, update } = useSettings();
	const { ai } = settings;
	const { modelLabel, approxMB, status, openSetup } = useGracieAI();
	const loaded = status === 'ready' || status === 'generating';

	return (
		<div className="space-y-4">
			{/* ── Brain ──────────────────────────────────────────────────────── */}
			<SettingsCard
				icon={Cpu}
				title="Gracie's brain"
				description="Robot replies are written in advance. Intelligence mode runs a small language model inside this browser tab, so she can answer in her own words."
				footer={
					<p className="text-xs text-ink-muted">
						{loaded
							? `${modelLabel} is loaded in this tab. Nothing you type is uploaded.`
							: 'Nothing you type is uploaded, in either mode.'}
					</p>
				}
			>
				<SettingRow
					title="Mode"
					description={
						ai.brain === 'robot'
							? 'Works on every device, with no download.'
							: `Downloads ${modelLabel}, about ${approxMB} MB, once.`
					}
				>
					<SegmentedControl
						value={ai.brain}
						options={BRAIN_OPTIONS}
						onChange={(brain) => {
							update('ai', { brain });
							// Explain the download before it starts.
							if (brain === 'intelligence' && !loaded) openSetup();
						}}
						label="Gracie's brain"
					/>
				</SettingRow>

				<SettingRow title="Model" description="Status on this device." stacked>
					<ModelStatusCard />
				</SettingRow>

				<SettingRow
					title="Load when the city opens"
					description="Otherwise the model is fetched the first time you ask her something."
				>
					<Toggle
						checked={ai.preload}
						onChange={(preload) => update('ai', { preload })}
						disabled={ai.brain !== 'intelligence'}
						label="Load the model when the city opens"
					/>
				</SettingRow>
			</SettingsCard>

			{/* ── Provenance ─────────────────────────────────────────────────── */}
			<SettingsCard
				icon={ScanEye}
				title="Showing the working"
				description="Gracie answers some questions straight from your saved progress, and refuses others outright — in both cases without consulting the model. This shows which path each answer took."
			>
				<SettingRow
					title="Show route and speed"
					description="Adds a small technical line under every reply."
				>
					<Toggle
						checked={ai.showDebug}
						onChange={(showDebug) => update('ai', { showDebug })}
						label="Show route and speed under each reply"
					/>
				</SettingRow>
			</SettingsCard>
		</div>
	);
}
