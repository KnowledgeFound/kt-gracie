import {
	CheckCircle2,
	Circle,
	ExternalLink,
	Headphones,
	Image,
	PartyPopper,
	Presentation,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import { AssessmentType } from '@/ENUMS/enums';
import type { Module, ModuleAssessment } from '@/features/city/types';
import type { Content, SummarySection } from '@/types/types';
import { absoluteUrl } from '../utils';

interface SummaryScreenProps {
	module: Module;
	activities: ModuleAssessment[];
	isDone: (a: ModuleAssessment) => boolean;
	percent: number;
	nextModule: Module | null;
	onOpen: (i: number) => void;
	onChoose: () => void;
	/** Extra material for the unit: infographic, slide deck, podcast. */
	summarySection?: SummarySection | null;
}

/** One downloadable/explorable resource from the unit's summary. */
interface Resource {
	kind: string;
	label: string;
	Icon: typeof Image;
	content: Content;
	href: string;
}

const RESOURCE_LABELS: {
	key: keyof SummarySection;
	label: string;
	Icon: typeof Image;
}[] = [
	{ key: 'inforgraphic', label: 'Infographic', Icon: Image },
	{ key: 'slideDeck', label: 'Slide deck', Icon: Presentation },
	{ key: 'podcast', label: 'Podcast', Icon: Headphones },
];

/**
 * Turn the summary record into links worth showing. A resource with no usable
 * address is left out entirely — a dead link here reads as broken content.
 */
function resourcesOf(summary: SummarySection | null | undefined): Resource[] {
	if (!summary) return [];

	return RESOURCE_LABELS.flatMap(({ key, label, Icon }) => {
		const content = summary[key] as Content | null;
		const href = absoluteUrl(content?.url);
		return content && href ? [{ kind: key, label, Icon, content, href }] : [];
	});
}

/** End of the course: what was covered, what is left, and where to go next. */
export default function SummaryScreen({
	module,
	activities,
	isDone,
	percent,
	nextModule,
	onOpen,
	onChoose,
	summarySection,
}: SummaryScreenProps) {
	const navigate = useNavigate();
	const steps = activities.filter((a) => a.type !== AssessmentType.SUMMARY);
	const remaining = steps.filter((a) => !isDone(a));
	const resources = resourcesOf(summarySection);

	return (
		<div
			className={classnames(
				'mx-auto w-full px-4 pb-16 mt-4',
				// One column on a phone; side by side once there is room, but only
				// when there is a second column to show.
				resources.length > 0
					? 'max-w-5xl grid gap-4 items-start md:grid-cols-2'
					: 'max-w-xl',
			)}
		>
			<div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 text-center">
				<PartyPopper className="mx-auto size-10 text-brand-500" />
				<h2 className="mt-3 text-2xl font-extrabold text-ink-deep">
					{steps.length === 0
						? 'Coming soon'
						: percent >= 100
							? 'Module complete!'
							: 'Nice progress'}
				</h2>
				<p className="mt-1 text-ink-mid">
					{steps.length === 0
						? `${module.name} — lessons for this module are coming soon.`
						: `${module.name} — ${percent}% done`}
				</p>

				<div className="mt-6 text-left space-y-1">
					{steps.map((a) => {
						const i = activities.indexOf(a);
						return (
							<button
								key={`${a.type}-${a.id}`}
								onClick={() => onOpen(i)}
								className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left"
							>
								{isDone(a) ? (
									<CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
								) : (
									<Circle className="size-5 text-gray-300 shrink-0" />
								)}
								<span className="text-sm text-ink-deep">{a.title}</span>
							</button>
						);
					})}
				</div>

				{remaining.length > 0 && (
					<p className="mt-4 text-sm text-ink-muted">
						{remaining.length} activit{remaining.length === 1 ? 'y' : 'ies'}{' '}
						still to do — tap one to jump in.
					</p>
				)}

				<div className="mt-6 flex flex-col gap-2">
					{nextModule && percent >= 100 && (
						<button
							onClick={() => navigate(`/course/${nextModule.id}`)}
							className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-500 to-brand-700"
						>
							Continue to {nextModule.name} →
						</button>
					)}
					{steps.length > 0 && (
						<button
							onClick={onChoose}
							className="w-full py-2.5 rounded-xl border border-brand-200 bg-brand-50 text-brand-700 text-sm font-semibold hover:bg-brand-100"
						>
							Choose a lesson, flashcards or quiz
						</button>
					)}
					<button
						onClick={() => navigate('/city')}
						className="w-full py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-ink-mid text-sm font-semibold hover:bg-gray-100"
					>
						← Back to City
					</button>
				</div>
			</div>

			{resources.length > 0 && (
				<section className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
					<h3 className="text-sm font-bold tracking-widest text-ink-subtle uppercase">
						Go further
					</h3>
					<p className="mt-1 text-sm text-ink-muted">
						Extra material on {module.name}, hosted by the original publisher.
					</p>

					<ul className="mt-4 space-y-2">
						{resources.map(({ kind, label, Icon, content, href }) => (
							<li key={kind}>
								<a
									href={href}
									target="_blank"
									rel="noreferrer"
									className="group flex items-start gap-3 rounded-2xl border border-gray-100 p-3 hover:border-brand-200 hover:bg-brand-50/40 transition-colors"
								>
									<span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 border border-brand-100">
										<Icon className="size-5 text-brand-600" />
									</span>
									<span className="min-w-0 flex-1">
										<span className="flex items-center gap-1.5 font-semibold text-ink-deep">
											<span className="truncate">{content.name}</span>
											<ExternalLink className="size-3.5 shrink-0 text-ink-subtle group-hover:text-brand-600" />
										</span>
										<span className="block text-[11px] font-bold tracking-widest text-brand-600 uppercase">
											{label}
										</span>
										{content.description && (
											<span className="mt-1 block text-sm text-ink-mid">
												{content.description}
											</span>
										)}
										<span className="mt-1 block truncate text-xs text-ink-subtle">
											{href}
										</span>
									</span>
								</a>
							</li>
						))}
					</ul>
				</section>
			)}
		</div>
	);
}
