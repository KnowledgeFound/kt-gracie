import { Check } from 'lucide-react';

interface Choice<T extends string> {
	value: T;
	label: string;
	description?: string;
}

interface ChoiceListProps<T extends string> {
	options: readonly Choice<T>[];
	value: T;
	onChange: (value: T) => void;
	/** Accessible name for the group. */
	label: string;
	disabled?: boolean;
}

/**
 * A vertical radio group with room for a line of explanation per option —
 * for choices that carry consequences a segmented pill can't spell out.
 */
export default function ChoiceList<T extends string>({
	options,
	value,
	onChange,
	label,
	disabled = false,
}: ChoiceListProps<T>) {
	return (
		<div
			role="radiogroup"
			aria-label={label}
			className={`space-y-1.5 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
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
							'flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
							'focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card',
							selected
								? 'border-brand-500/50 bg-brand-500/10'
								: 'border-line-soft hover:bg-surface-raised',
						].join(' ')}
					>
						{/* Radio dot */}
						<span
							className={[
								'mt-0.5 flex size-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
								selected
									? 'border-brand-500 bg-brand-500'
									: 'border-line-strong',
							].join(' ')}
						>
							{selected && (
								<Check className="size-2.5 text-white" strokeWidth={4} />
							)}
						</span>

						<span className="min-w-0">
							<span
								className={`block text-sm font-semibold ${
									selected
										? 'text-brand-700 dark:text-brand-200'
										: 'text-ink-deep'
								}`}
							>
								{option.label}
							</span>
							{option.description && (
								<span className="mt-0.5 block text-xs leading-snug text-ink-muted">
									{option.description}
								</span>
							)}
						</span>
					</button>
				);
			})}
		</div>
	);
}
