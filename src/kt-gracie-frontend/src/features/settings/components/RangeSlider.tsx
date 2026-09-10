import '../settings.css';

interface RangeSliderProps {
	id: string;
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
	/** Rendered right of the track, e.g. "80%". */
	valueLabel?: string;
	'aria-label'?: string;
}

/**
 * Accent-filled range input. The fill is painted with a gradient on the track
 * so it follows the current accent without a second element.
 */
export default function RangeSlider({
	id,
	value,
	onChange,
	min = 0,
	max = 1,
	step = 0.05,
	disabled = false,
	valueLabel,
	...rest
}: RangeSliderProps) {
	const pct = ((value - min) / (max - min)) * 100;

	return (
		<div className="flex items-center gap-3">
			<input
				id={id}
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				disabled={disabled}
				onChange={(e) => onChange(Number(e.target.value))}
				className="settingsRange h-1.5 w-full flex-1 cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-40"
				style={{
					background: `linear-gradient(to right, rgb(var(--brand-500)) ${pct}%, rgb(var(--line-strong)) ${pct}%)`,
				}}
				aria-label={rest['aria-label']}
			/>
			{valueLabel && (
				<span className="w-10 flex-shrink-0 text-right text-xs font-bold tabular-nums text-ink-muted">
					{valueLabel}
				</span>
			)}
		</div>
	);
}
