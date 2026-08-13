import { motion } from 'framer-motion';
import { useId } from 'react';

interface Option<T extends string> {
	value: T;
	label: string;
}

interface SegmentedControlProps<T extends string> {
	options: readonly Option<T>[];
	value: T;
	onChange: (value: T) => void;
	/** Accessible name for the group. */
	label: string;
	/** Fill the available width instead of hugging the labels. */
	fullWidth?: boolean;
	disabled?: boolean;
}

/**
 * Pill-style choice group. The selected background is a shared layout element,
 * so it slides between options instead of popping.
 */
export default function SegmentedControl<T extends string>({
	options,
	value,
	onChange,
	label,
	fullWidth = false,
	disabled = false,
}: SegmentedControlProps<T>) {
	// One layoutId per instance, otherwise every control on the page shares the
	// same sliding pill and they animate into each other.
	const layoutId = useId();

	return (
		<div
			role="radiogroup"
			aria-label={label}
			className={[
				'inline-flex gap-0.5 rounded-xl border border-line-soft bg-surface-muted p-0.5',
				fullWidth ? 'flex w-full' : '',
				disabled ? 'pointer-events-none opacity-50' : '',
			].join(' ')}
		>
			{options.map((option) => {
				const selected = option.value === value;
				return (
					<button
						key={option.value}
						type="button"
						role="radio"
						aria-checked={selected}
						disabled={disabled}
						onClick={() => onChange(option.value)}
						className={[
							'relative rounded-[10px] px-3 py-1.5 text-xs font-bold transition-colors',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
							fullWidth ? 'flex-1' : '',
							selected
								? 'text-brand-600 dark:text-brand-300'
								: 'text-ink-muted hover:text-ink-deep',
						].join(' ')}
					>
						{selected && (
							<motion.span
								layoutId={layoutId}
								className="absolute inset-0 rounded-[10px] bg-surface-card shadow-sm ring-1 ring-line-soft"
								transition={{ type: 'spring', stiffness: 420, damping: 34 }}
							/>
						)}
						<span className="relative z-10 whitespace-nowrap">
							{option.label}
						</span>
					</button>
				);
			})}
		</div>
	);
}
