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
	Check,
	Cloud,
	Cpu,
	GraduationCap,
	Palette,
	SlidersHorizontal,
	UserRound,
	Volume2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
	AccountPanel,
	AppearancePanel,
	AiPanel,
	CityPanel,
	GuidePanel,
	LearningPanel,
	useSettings,
} from '@/features/settings';
import { CityShell, PageTitle } from '@/features/city';
import '@/features/settings/settings.css';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type TabId = 'appearance' | 'learning' | 'guide' | 'ai' | 'city' | 'account';

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
		id: 'learning',
		label: 'Learning',
		blurb: 'Reading level of lessons and districts',
		icon: GraduationCap,
		Panel: LearningPanel,
	},
	{
		id: 'guide',
		label: 'Guide & audio',
		blurb: 'Gracie, her voice and when she speaks',
		icon: Volume2,
		Panel: GuidePanel,
	},
	{
		id: 'ai',
		label: 'Gracie AI',
		blurb: 'On-device answers, and what they cost',
		icon: Cpu,
		Panel: AiPanel,
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
		<CityShell width="lg">
			<PageTitle
				icon={SlidersHorizontal}
				kicker="Preferences"
				title="Settings"
				sub="Saved on this device — nothing leaves your browser."
				action={
					/* Autosave confirmation */
					<AnimatePresence>
						{isDirty && (
							<motion.span
								key="saved"
								initial={{ opacity: 0, scale: 0.9, y: -4 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.9 }}
								className="cityGlass flex flex-shrink-0 items-center gap-1.5 !rounded-full px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
								role="status"
							>
								<Check className="size-3" strokeWidth={3} />
								Saved
							</motion.span>
						)}
					</AnimatePresence>
				}
			/>

			{/* ── Body ────────────────────────────────────────────────────────── */}
			<div className="flex flex-col gap-5 text-ink-deep md:flex-row md:gap-8">
				{/* Section rail — chips on mobile, list on desktop */}
				<nav
					role="tablist"
					aria-orientation="vertical"
					aria-label="Settings sections"
					className="cityGlass flex gap-2 overflow-x-auto p-2 md:w-60 md:flex-shrink-0 md:flex-col md:self-start md:overflow-visible"
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

					<p
						className="mt-6 text-center text-[11px]"
						style={{ color: 'var(--hero-sub)' }}
					>
						Changes apply immediately and are saved automatically.
					</p>
				</main>
			</div>
		</CityShell>
	);
}
