import {
	useEffect,
	useRef,
	useState,
	type ComponentType,
	type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
	ArrowLeft,
	Check,
	Cloud,
	Palette,
	SlidersHorizontal,
	UserRound,
	Volume2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
	AccountPanel,
	AppearancePanel,
	CityPanel,
	GuidePanel,
	useSettings,
} from '@/features/settings';
import '@/features/settings/settings.css';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type TabId = 'appearance' | 'guide' | 'city' | 'account';

const TABS: {
	id: TabId;
	label: string;
	blurb: string;
	icon: LucideIcon;
	Panel: ComponentType;
}[] = [
	{
		id: 'appearance',
		label: 'Appearance',
		blurb: 'Theme, accent and readability',
		icon: Palette,
		Panel: AppearancePanel,
	},
	{
		id: 'guide',
		label: 'Guide & audio',
		blurb: 'Gracie, her voice and when she speaks',
		icon: Volume2,
		Panel: GuidePanel,
	},
	{
		id: 'city',
		label: 'City',
		blurb: 'Clouds, cursor and island motion',
		icon: Cloud,
		Panel: CityPanel,
	},
	{
		id: 'account',
		label: 'Account',
		blurb: 'Your profile and device data',
		icon: UserRound,
		Panel: AccountPanel,
	},
];

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * Settings.
 *
 * A rail of sections on the left (a scrollable chip row on mobile) and the
 * active panel on the right. Every control writes straight through to the
 * settings context, which persists to local storage and repaints the app — so
 * there is no Save button, just a "Saved" confirmation.
 */
export default function SettingsPage() {
	const navigate = useNavigate();
	const { hash } = useLocation();
	const { isDirty } = useSettings();

	// The section lives in the URL hash (/settings#guide), so a link can point
	// straight at it and the back button steps between sections.
	const fromHash = TABS.find((t) => `#${t.id}` === hash)?.id;
	const [tab, setTab] = useState<TabId>(fromHash ?? 'appearance');
	useEffect(() => {
		if (fromHash && fromHash !== tab) setTab(fromHash);
	}, [fromHash]); // eslint-disable-line react-hooks/exhaustive-deps

	const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

	function selectTab(id: TabId) {
		setTab(id);
		navigate({ hash: id }, { replace: true });
	}

	/** Roving focus: arrows move between sections the way a tablist should. */
	function handleTabKey(e: ReactKeyboardEvent, index: number) {
		const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight';
		const back = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
		if (!forward && !back) return;

		e.preventDefault();
		const next = TABS[(index + (forward ? 1 : TABS.length - 1)) % TABS.length];
		selectTab(next.id);
		tabRefs.current[next.id]?.focus();
	}

	const active = TABS.find((t) => t.id === tab) ?? TABS[0];
	const ActivePanel = active.Panel;

	return (
		<div className="settingsPage pb-16 text-ink-deep">
			{/* ── Header ──────────────────────────────────────────────────────── */}
			<header className="sticky top-0 z-20 border-b border-line-soft bg-surface-page/85 backdrop-blur-md">
				<div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3.5 sm:px-6">
					<button
						type="button"
						onClick={() => navigate(-1)}
						aria-label="Go back"
						className="flex size-9 flex-shrink-0 items-center justify-center rounded-xl border border-line-soft bg-surface-card text-ink-mid transition-colors hover:bg-surface-raised hover:text-ink-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
					>
						<ArrowLeft className="size-4" />
					</button>

					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<SlidersHorizontal className="size-4 flex-shrink-0 text-brand-600 dark:text-brand-300" />
							<h1 className="truncate text-lg font-black tracking-tight">
								Settings
							</h1>
						</div>
						<p className="truncate text-xs text-ink-muted">
							Saved on this device — nothing leaves your browser.
						</p>
					</div>

					{/* Autosave confirmation */}
					<AnimatePresence>
						{isDirty && (
							<motion.span
								key="saved"
								initial={{ opacity: 0, scale: 0.9, y: -4 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.9 }}
								className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400"
								role="status"
							>
								<Check className="size-3" strokeWidth={3} />
								Saved
							</motion.span>
						)}
					</AnimatePresence>
				</div>
			</header>

			{/* ── Body ────────────────────────────────────────────────────────── */}
			<div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 pt-5 sm:px-6 md:flex-row md:gap-8">
				{/* Section rail — chips on mobile, list on desktop */}
				<nav
					role="tablist"
					aria-orientation="vertical"
					aria-label="Settings sections"
					className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:w-56 md:flex-shrink-0 md:flex-col md:overflow-visible md:px-0 md:pb-0"
				>
					{TABS.map(({ id, label, blurb, icon: Icon }, i) => {
						const selected = id === tab;
						return (
							<button
								key={id}
								type="button"
								role="tab"
								id={`settings-tab-${id}`}
								aria-selected={selected}
								aria-controls={`settings-panel-${id}`}
								tabIndex={selected ? 0 : -1}
								ref={(el) => {
									tabRefs.current[id] = el;
								}}
								onKeyDown={(e) => handleTabKey(e, i)}
								onClick={() => selectTab(id)}
								className={[
									'relative flex flex-shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
									'md:w-full',
									selected
										? 'border-brand-500/40 bg-brand-500/10 text-brand-700 dark:text-brand-200'
										: 'border-transparent text-ink-muted hover:bg-surface-raised hover:text-ink-deep',
								].join(' ')}
							>
								<Icon
									className={`size-4 flex-shrink-0 ${
										selected ? 'text-brand-600 dark:text-brand-300' : ''
									}`}
								/>
								<span className="min-w-0">
									<span className="block whitespace-nowrap text-sm font-bold md:whitespace-normal">
										{label}
									</span>
									<span className="hidden text-[11px] leading-tight text-ink-subtle md:block">
										{blurb}
									</span>
								</span>
							</button>
						);
					})}
				</nav>

				{/* Active panel */}
				<main className="min-w-0 flex-1">
					<AnimatePresence mode="wait">
						<motion.div
							key={tab}
							id={`settings-panel-${tab}`}
							role="tabpanel"
							aria-labelledby={`settings-tab-${tab}`}
							tabIndex={0}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.2 }}
							className="focus-visible:outline-none"
						>
							<ActivePanel />
						</motion.div>
					</AnimatePresence>

					<p className="mt-6 text-center text-[11px] text-ink-subtle">
						Changes apply immediately and are saved automatically.
					</p>
				</main>
			</div>
		</div>
	);
}
