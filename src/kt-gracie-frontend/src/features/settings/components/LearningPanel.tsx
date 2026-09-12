import { GraduationCap, MessageCircleHeart } from 'lucide-react';
import { useSettings } from '../context';
import { READING_LEVEL_OPTIONS } from '../constants';
import { leveled, useReadingLevel } from '../readingLevel';
import ChoiceList from './ChoiceList';
import SettingsCard from './SettingsCard';

/**
 * The same idea, phrased at each level, so the learner can hear the
 * difference before choosing. Pulled from the Anti-Corruption district.
 */
const SAMPLE = leveled(
	'Corruption is when someone uses their job or power to help themselves instead of doing what is right.',
	'Corruption is the misuse of entrusted power for private gain, such as bribery, favouritism or taking public money.',
	'Corruption is the abuse of entrusted authority for private benefit, encompassing bribery, embezzlement, nepotism and conflicts of interest as defined under UNCAC.',
);

const LEVEL_LABEL = {
	simple: 'Simple English',
	standard: 'Standard',
	advanced: 'Advanced',
} as const;

/** Reading level for lesson and district content. */
export default function LearningPanel() {
	const { update } = useSettings();
	const { level, setting, t } = useReadingLevel();

	return (
		<div className="space-y-4">
			<SettingsCard
				icon={GraduationCap}
				title="Reading level"
				description="Every district, lesson note and Gracie line is written three ways. Pick the one that reads best for you."
			>
				<div className="px-4 py-4 sm:px-5">
					<ChoiceList
						label="Reading level"
						options={READING_LEVEL_OPTIONS}
						value={setting}
						onChange={(next) => update('learning', { readingLevel: next })}
					/>
				</div>
			</SettingsCard>

			<SettingsCard
				icon={MessageCircleHeart}
				title="Preview"
				description={
					setting === 'auto'
						? `Your profile puts you on ${LEVEL_LABEL[level]}. Here is how a lesson reads at that level.`
						: `Here is how a lesson reads on ${LEVEL_LABEL[level]}.`
				}
			>
				<blockquote
					className="mx-4 my-4 rounded-xl border border-brand-500/30 bg-brand-500/5 px-4 py-3 text-sm leading-relaxed text-ink-deep sm:mx-5"
					aria-live="polite"
				>
					{t(SAMPLE)}
				</blockquote>
			</SettingsCard>
		</div>
	);
}
