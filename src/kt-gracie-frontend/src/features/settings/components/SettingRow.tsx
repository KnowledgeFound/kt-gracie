import type { ReactNode } from 'react';

interface SettingRowProps {
	title: string;
	description?: string;
	/** The control. Sits right of the label on wide screens, below on narrow. */
	children: ReactNode;
	/** Stack the control under the label at every width (sliders, pickers). */
	stacked?: boolean;
	/** Ties the label to the control for pointer + screen-reader users. */
	htmlFor?: string;
}

/**
 * One labelled setting: title, optional explanation, and its control.
 */
export default function SettingRow({
	title,
	description,
	children,
	stacked = false,
	htmlFor,
}: SettingRowProps) {
	const Label = htmlFor ? 'label' : 'span';

	return (
		<div
			className={[
				'flex gap-4 px-4 py-3.5 sm:px-5',
				stacked
					? 'flex-col items-stretch'
					: 'flex-row items-center justify-between',
			].join(' ')}
		>
			<div className="min-w-0">
				<Label
					{...(htmlFor ? { htmlFor } : {})}
					className="block text-sm font-semibold text-ink-deep"
				>
					{title}
				</Label>
				{description && (
					<p className="mt-0.5 text-xs leading-snug text-ink-muted">
						{description}
					</p>
				)}
			</div>

			<div className={stacked ? '' : 'flex-shrink-0'}>{children}</div>
		</div>
	);
}
