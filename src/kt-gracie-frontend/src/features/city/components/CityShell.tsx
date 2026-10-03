import { useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useUser } from '@/features/auth';
import { useCityLook } from '../hooks/useCityLook';
import CityHeader from './CityHeader';
import DrawerMenu from './DrawerMenu';
import HealthModal from './HealthModal';
import ProgressModal from './ProgressModal';
import TokenModal from './TokenModal';
import '@/app/city/city.css';

interface CityShellProps {
	children: ReactNode;
	/** Tailwind max-width class for the content column. */
	width?: 'md' | 'lg';
}

/**
 * Chrome shared by the pages that live alongside the city (leaderboard,
 * subjects, settings): the painted city backdrop for the current look, the
 * same header as the map with its KT / health / progress modals and the
 * navigation drawer, and a scrolling content column underneath.
 */
export default function CityShell({ children, width = 'md' }: CityShellProps) {
	const { user, city } = useUser();
	const look = useCityLook(city);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [healthOpen, setHealthOpen] = useState(false);
	const [tokenOpen, setTokenOpen] = useState(false);
	const [progressOpen, setProgressOpen] = useState(false);

	return (
		<div className={`cityShell cityShell--${look}`}>
			<div aria-hidden="true" className="cityShell__bg" />

			<CityHeader
				health={city?.health ?? 0}
				tokens={user?.tokenBalance ?? 0}
				username={user?.firstName ?? '—'}
				onClickHealth={() => setHealthOpen(true)}
				onClickToken={() => setTokenOpen(true)}
				onClickTrend={() => setProgressOpen(true)}
				onClickUser={() => setDrawerOpen(true)}
			/>

			<main
				className={`cityShell__content mx-auto w-full px-4 sm:px-6 ${
					width === 'lg' ? 'max-w-5xl' : 'max-w-3xl'
				}`}
			>
				{children}
			</main>

			<DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
			<HealthModal
				open={healthOpen}
				onClose={() => setHealthOpen(false)}
				health={city?.getHealth() ?? 0}
			/>
			<TokenModal open={tokenOpen} onClose={() => setTokenOpen(false)} />
			<ProgressModal open={progressOpen} onClose={() => setProgressOpen(false)} />
		</div>
	);
}

interface PageTitleProps {
	icon?: LucideIcon;
	/** Small tracked line above the title, e.g. "Top learners". */
	kicker?: string;
	title: string;
	sub?: ReactNode;
	/** Rendered to the right of the title (a button, a status badge). */
	action?: ReactNode;
}

/** Page heading in the same voice as the city's "Protect your City" block. */
export function PageTitle({ icon: Icon, kicker, title, sub, action }: PageTitleProps) {
	return (
		<div className="pageTitle">
			{kicker && <p className="pageTitle__kicker">{kicker}</p>}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="pageTitle__title">
					{Icon && <Icon className="pageTitle__icon" aria-hidden="true" />}
					{title}
				</h1>
				{action}
			</div>
			{sub && <p className="pageTitle__sub">{sub}</p>}
		</div>
	);
}
