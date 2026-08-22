interface ToggleProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	/** Accessible name — required when the visible label is a sibling element. */
	label: string;
	disabled?: boolean;
}

/**
 * Switch control. `role="switch"` on a real button so keyboard and screen
 * readers get native semantics without a hidden checkbox.
 */
export default function Toggle({
	checked,
	onChange,
	label,
	disabled = false,
}: ToggleProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={label}
			disabled={disabled}
			onClick={() => onChange(!checked)}
			className={[
				'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full',
				'transition-colors duration-200 focus-visible:outline-none',
				'focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
				'focus-visible:ring-offset-surface-card',
				disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
				checked ? 'bg-brand-500' : 'bg-line-strong',
			].join(' ')}
		>
			<span
				className={[
					'inline-block h-[18px] w-[18px] rounded-full shadow-sm',
					'transition-transform duration-200',
					checked ? 'translate-x-[23px]' : 'translate-x-[3px]',
				].join(' ')}
				// Literal white: the knob reads as the "puck" in both themes, so it
				// must not follow the dark-mode surface remap.
				style={{ backgroundColor: '#fff' }}
			/>
		</button>
	);
}
