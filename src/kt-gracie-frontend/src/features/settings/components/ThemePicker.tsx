import { Check, Monitor, Moon, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { THEME_OPTIONS } from '../constants';
import type { ThemeMode } from '../types';
import '../settings.css';

const ICONS: Record<ThemeMode, LucideIcon> = {
	light: Sun,
	dark: Moon,
	system: Monitor,
};

interface ThemePickerProps {
	value: ThemeMode;
	onChange: (theme: ThemeMode) => void;
	/** What `system` currently resolves to — shown on that tile. */
	resolved: 'light' | 'dark';
}

/**
 * Three tiles, each a miniature of the app in that theme, so the choice is
 * visible before it is applied.
 */
export default function ThemePicker({
	value,
	onChange,
	resolved,
}: ThemePickerProps) {
	return (
		<div
			role="radiogroup"
			aria-label="Theme"
			className="grid grid-cols-3 gap-2.5 sm:gap-3"
		>
			{THEME_OPTIONS.map((option) => {
				const Icon = ICONS[option.value];
				const selected = value === option.value;

				return (
					<button
						key={option.value}
						type="button"
						role="radio"
						aria-checked={selected}
						onClick={() => onChange(option.value)}
						className={[
							'group relative overflow-hidden rounded-xl border-2 p-1.5 text-left transition-all',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
							'focus-visible:ring-offset-surface-card',
							selected
								? 'border-brand-500 shadow-md'
								: 'border-line-soft hover:border-brand-300',
						].join(' ')}
					>
						{/* Miniature app window */}
						<span
							className={`themePreview themePreview--${option.value} block rounded-lg p-2`}
							aria-hidden="true"
						>
							<span className="flex h-14 flex-col gap-1.5 sm:h-16">
								{/* Header bar */}
								<span className="flex items-center gap-1 rounded-md bg-[var(--preview-card)] px-1.5 py-1">
									<span className="size-1.5 rounded-full bg-brand-500" />
									<span className="h-1 w-6 rounded-full bg-[var(--preview-line)]" />
									<span className="ml-auto h-1 w-3 rounded-full bg-[var(--preview-line)]" />
								</span>
								{/* Body */}
								<span className="flex flex-1 gap-1.5">
									<span className="flex-1 rounded-md bg-[var(--preview-card)] p-1.5">
										<span className="mb-1 block h-1 w-8 rounded-full bg-brand-500" />
										<span className="mb-1 block h-1 w-full rounded-full bg-[var(--preview-line)]" />
										<span className="block h-1 w-2/3 rounded-full bg-[var(--preview-line)]" />
									</span>
								</span>
							</span>
						</span>

						{/* Caption */}
						<span className="mt-2 flex items-center gap-1.5 px-1 pb-0.5">
							<Icon
								className={`size-3.5 flex-shrink-0 ${
									selected ? 'text-brand-600 dark:text-brand-300' : 'text-ink-muted'
								}`}
							/>
							<span className="truncate text-xs font-bold text-ink-deep">
								{option.label}
							</span>
							{selected && (
								<span className="ml-auto flex size-4 flex-shrink-0 items-center justify-center rounded-full bg-brand-500">
									<Check className="size-2.5 text-white" strokeWidth={3.5} />
								</span>
							)}
						</span>

						{option.value === 'system' && (
							<span className="block px-1 pb-1 text-[10px] leading-none text-ink-subtle">
								Now: {resolved}
							</span>
						)}
					</button>
				);
			})}
		</div>
	);
}
