import { BookOpen, Clock, Hash, ChevronRight } from 'lucide-react';
import type { Subject } from '../types';

interface SubjectCardProps {
	subject: Subject;
	onClick?: (subject: Subject) => void;
}

export default function SubjectCard({ subject, onClick }: SubjectCardProps) {
	return (
		<button
			onClick={() => onClick?.(subject)}
			className="w-full text-left bg-surface-card rounded-card p-5 shadow-card hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
		>
			<div className="flex items-start justify-between gap-3">
				{/* Icon */}
				<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0">
					<BookOpen className="w-5 h-5 text-brand-600" />
				</div>

				<ChevronRight className="w-4 h-4 text-ink-subtle mt-1 shrink-0 group-hover:text-brand-500 transition-colors" />
			</div>

			{/* Name */}
			<h3 className="mt-3 font-bold text-ink-deep text-base leading-snug">
				{subject.name}
			</h3>

			{/* Description */}
			{subject.description && (
				<p className="mt-1 text-sm text-ink-muted line-clamp-2">
					{subject.description}
				</p>
			)}

			{/* Meta row */}
			<div className="mt-3 flex items-center gap-4 text-xs text-ink-subtle">
				<span className="flex items-center gap-1">
					<Hash className="w-3 h-3" />
					{subject.code}
				</span>
				<span className="flex items-center gap-1">
					<Clock className="w-3 h-3" />
					{subject.duration.toString()} hrs
				</span>
				{subject.assessments.length > 0 && (
					<span className="ml-auto bg-brand-50 text-brand-600 font-semibold px-2 py-0.5 rounded-badge">
						{subject.assessments.length} assessment
						{subject.assessments.length !== 1 ? 's' : ''}
					</span>
				)}
			</div>
		</button>
	);
}
