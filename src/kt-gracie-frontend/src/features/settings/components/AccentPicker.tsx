import { Check } from 'lucide-react';
import { ACCENT_OPTIONS } from '../constants';
import type { AccentId } from '../types';

interface AccentPickerProps {
	value: AccentId;
	onChange: (accent: AccentId) => void;
}

/**
 * Accent swatches. Picking one swaps the `--brand-*` ramp for the whole app,
 * so buttons, badges and gradients everywhere follow.
 */
export default function AccentPicker({ value, onChange }: AccentPickerProps) {
	return (
		<div role="radiogroup" aria-label="Accent colour" className="flex gap-2.5">
			{ACCENT_OPTIONS.map((accent) => {
				const selected = value === accent.value;
				return (
					<button
						key={accent.value}
						type="button"
						role="radio"
						aria-checked={selected}
						aria-label={accent.label}
						title={accent.label}
						onClick={() => onChange(accent.value)}
						className={[
							'relative flex size-9 items-center justify-center rounded-full transition-transform',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
							'focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card',
							selected
								? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-surface-card'
								: 'hover:scale-110',
						].join(' ')}
						style={{
							background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
						}}
					>
						{selected && (
							<Check className="size-4 text-white drop-shadow" strokeWidth={3.5} />
						)}
					</button>
				);
			})}
		</div>
	);
}
