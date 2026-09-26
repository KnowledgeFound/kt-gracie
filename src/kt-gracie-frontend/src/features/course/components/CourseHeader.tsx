import { useState } from 'react';
import {
	ArrowLeft,
	BookOpen,
	Brain,
	ChevronDown,
	ClipboardCheck,
	Layers,
} from 'lucide-react';
import classnames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { AssessmentType } from '@/ENUMS/enums';
import type { ModuleAssessment } from '@/features/city/types';

interface CourseHeaderProps {
	title: string;
	mode: 'lesson' | 'practice';
	activities: ModuleAssessment[];
	onLesson: () => void;
	onPractice: (type: AssessmentType) => void;
}

/** Title bar with the Lesson / Practice switch. */
export default function CourseHeader({
	title,
	mode,
	activities,
	onLesson,
	onPractice,
}: CourseHeaderProps) {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);

	const has = (t: AssessmentType) => activities.some((a) => a.type === t);
	const items = [
		{
			type: AssessmentType.FLASHCARD,
			label: 'Recall Cards',
			hint: 'Strengthen what you just learned.',
			icon: Layers,
		},
		{
			type: AssessmentType.QUIZ,
			label: 'Lesson Check',
			hint: 'Test only what this lesson taught.',
			icon: ClipboardCheck,
		},
	];

	return (
		<header className="relative z-20">
			<div className="flex items-center gap-3 px-4 h-14 bg-white/90 backdrop-blur border-b border-gray-100">
				<button
					onClick={() => navigate('/city')}
					aria-label="Back to city"
					className="p-2 -ml-2 rounded-full text-ink-mid hover:bg-gray-100"
				>
					<ArrowLeft className="size-5" />
				</button>
				<h1 className="text-base md:text-lg font-semibold text-ink-deep truncate">
					{title}
				</h1>
			</div>

			<div className="flex justify-center gap-2 py-4 relative">
				<button
					onClick={() => {
						setOpen(false);
						onLesson();
					}}
					className={classnames(
						'flex items-center gap-2 px-4 py-1.5 rounded-pill text-sm border',
						mode === 'lesson'
							? 'bg-white border-gray-200 text-ink-deep shadow-sm'
							: 'border-transparent text-white/90 hover:text-white',
					)}
				>
					<BookOpen className="size-4" /> Lesson
				</button>
				<button
					onClick={() => setOpen((v) => !v)}
					aria-expanded={open}
					className={classnames(
						'flex items-center gap-2 px-4 py-1.5 rounded-pill text-sm border',
						mode === 'practice'
							? 'bg-white border-gray-200 text-ink-deep shadow-sm'
							: 'border-transparent text-white/90 hover:text-white',
					)}
				>
					<Brain className="size-4" /> Practice
					<ChevronDown
						className={classnames(
							'size-4 transition-transform',
							open && 'rotate-180',
						)}
					/>
				</button>

				{open && (
					<div
						role="menu"
						className="absolute top-full mt-1 w-72 rounded-2xl bg-white border border-gray-100 shadow-xl p-2"
					>
						<p className="px-3 py-2 text-sm text-ink-muted">Practice modes</p>
						{items.map(({ type, label, hint, icon: Icon }) => (
							<button
								key={type}
								role="menuitem"
								disabled={!has(type)}
								onClick={() => {
									setOpen(false);
									onPractice(type);
								}}
								className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
							>
								<span className="mt-0.5 size-10 shrink-0 rounded-full border border-gray-200 flex items-center justify-center">
									<Icon className="size-5 text-ink-mid" />
								</span>
								<span>
									<span className="block font-medium text-ink-deep">
										{label}
									</span>
									<span className="block text-sm text-ink-muted">
										{has(type) ? hint : 'Not available for this module yet.'}
									</span>
								</span>
							</button>
						))}
					</div>
				)}
			</div>
		</header>
	);
}
