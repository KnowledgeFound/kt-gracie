import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface SettingsCardProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	children: ReactNode;
	/** Rendered under the rows, hairline-separated (notes, danger actions). */
	footer?: ReactNode;
}

/**
 * A group of related settings. Rows are separated by hairlines, so children
 * should be <SettingRow> elements (or anything with its own padding).
 */
export default function SettingsCard({
	icon: Icon,
	title,
	description,
	children,
	footer,
}: SettingsCardProps) {
	return (
		<section className="overflow-hidden rounded-2xl border border-line-soft bg-surface-card shadow-sm">
			<header className="flex items-start gap-3 border-b border-line-soft px-4 py-4 sm:px-5">
				<span className="mt-0.5 flex size-8 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
					<Icon className="size-4" />
				</span>
				<div className="min-w-0">
					<h2 className="text-sm font-black uppercase tracking-wider text-ink-deep">
						{title}
					</h2>
					{description && (
						<p className="mt-0.5 text-xs leading-snug text-ink-muted">
							{description}
						</p>
					)}
				</div>
			</header>

			<div className="divide-y divide-line-soft">{children}</div>

			{footer && (
				<div className="border-t border-line-soft bg-surface-muted px-4 py-3 sm:px-5">
					{footer}
				</div>
			)}
		</section>
	);
}
