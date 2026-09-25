import { CheckCircle2, Circle, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AssessmentType } from '@/ENUMS/enums';
import type { Module, ModuleAssessment } from '@/features/city/types';

interface SummaryScreenProps {
	module: Module;
	activities: ModuleAssessment[];
	isDone: (a: ModuleAssessment) => boolean;
	percent: number;
	nextModule: Module | null;
	onOpen: (i: number) => void;
	onChoose: () => void;
}

/** End of the course: what was covered, what is left, and where to go next. */
export default function SummaryScreen({ module, activities, isDone, percent, nextModule, onOpen, onChoose }: SummaryScreenProps) {
	const navigate = useNavigate();
	const steps = activities.filter((a) => a.type !== AssessmentType.SUMMARY);
	const remaining = steps.filter((a) => !isDone(a));

	return (
		<div className="mx-auto w-full max-w-xl px-4 pb-16">
			<div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-8 text-center">
				<PartyPopper className="mx-auto size-10 text-brand-500" />
				<h2 className="mt-3 text-2xl font-extrabold text-ink-deep">
					{steps.length === 0 ? 'Coming soon' : percent >= 100 ? 'Module complete!' : 'Nice progress'}
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
						{remaining.length} activit{remaining.length === 1 ? 'y' : 'ies'} still to do — tap one to jump in.
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
		</div>
	);
}
