import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, BookOpen, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
	useSubjects,
	useCreateSubject,
	SubjectCard,
	CreateSubjectForm,
} from '@/features/subject';
import type { Subject, CreateSubjectInput } from '@/features/subject';
import { Button } from '@/components/ui';

const fade = {
	initial: { opacity: 0, y: 12 },
	animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
	exit:    { opacity: 0, y: -8,  transition: { duration: 0.15 } },
};

export default function SubjectPage() {
	const navigate = useNavigate();
	const [showForm, setShowForm] = useState(false);
	const [selected, setSelected] = useState<Subject | null>(null);

	// ── Data ──────────────────────────────────────────────────────────────────
	const { data: subjects, isLoading, isError, error } = useSubjects();
	const createMutation = useCreateSubject();

	// ── Handlers ──────────────────────────────────────────────────────────────
	function handleCreate(input: CreateSubjectInput) {
		createMutation.mutate(input, {
			onSuccess: () => setShowForm(false),
		});
	}

	// ── Render ────────────────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-50 via-surface-page to-quiz-50">
			<div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

				{/* ── Header ── */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<button
							onClick={() => navigate(-1)}
							className="p-2 rounded-full hover:bg-brand-100 text-ink-muted hover:text-ink-deep transition-colors"
							aria-label="Go back"
						>
							<ArrowLeft className="w-4 h-4" />
						</button>
						<div>
							<h1 className="text-2xl font-bold text-ink-deep">Subjects</h1>
							<p className="text-sm text-ink-muted">
								{subjects ? `${subjects.length} subject${subjects.length !== 1 ? 's' : ''}` : 'Loading…'}
							</p>
						</div>
					</div>

					{!showForm && !selected && (
						<Button size="md" onClick={() => setShowForm(true)}>
							<Plus className="w-4 h-4 mr-1.5" />
							New Subject
						</Button>
					)}
				</div>

				<AnimatePresence mode="wait">
					{/* ── Create form ── */}
					{showForm && (
						<motion.div key="form" {...fade}>
							<CreateSubjectForm
								onSubmit={handleCreate}
								onCancel={() => setShowForm(false)}
								isPending={createMutation.isPending}
								error={
									createMutation.isError
										? (createMutation.error as Error).message
										: undefined
								}
							/>
						</motion.div>
					)}

					{/* ── Subject detail ── */}
					{selected && (
						<motion.div key="detail" {...fade}>
							<SubjectDetail
								subject={selected}
								onBack={() => setSelected(null)}
							/>
						</motion.div>
					)}

					{/* ── List ── */}
					{!showForm && !selected && (
						<motion.div key="list" {...fade} className="space-y-3">
							{/* Loading */}
							{isLoading && (
								<div className="flex items-center justify-center py-16 gap-3 text-ink-muted">
									<Loader2 className="w-5 h-5 animate-spin" />
									<span>Loading subjects…</span>
								</div>
							)}

							{/* Error */}
							{isError && (
								<div className="flex items-center gap-3 bg-danger-50 border border-danger-100 rounded-card px-5 py-4 text-danger-600">
									<AlertCircle className="w-5 h-5 shrink-0" />
									<p className="text-sm">
										{(error as Error)?.message ?? 'Failed to load subjects.'}
									</p>
								</div>
							)}

							{/* Empty state */}
							{!isLoading && !isError && subjects?.length === 0 && (
								<div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
									<div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
										<BookOpen className="w-8 h-8 text-brand-400" />
									</div>
									<div>
										<p className="font-semibold text-ink-deep">No subjects yet</p>
										<p className="text-sm text-ink-muted mt-1">
											Create your first subject to get started.
										</p>
									</div>
									<Button size="sm" onClick={() => setShowForm(true)}>
										<Plus className="w-4 h-4 mr-1.5" />
										New Subject
									</Button>
								</div>
							)}

							{/* Subject cards */}
							{subjects?.map((subject) => (
								<SubjectCard
									key={subject.id.toString()}
									subject={subject}
									onClick={setSelected}
								/>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

// ─── Subject detail panel ─────────────────────────────────────────────────────

function SubjectDetail({
	subject,
	onBack,
}: {
	subject: Subject;
	onBack: () => void;
}) {
	return (
		<div className="space-y-4">
			{/* Back */}
			<button
				onClick={onBack}
				className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink-deep transition-colors"
			>
				<ArrowLeft className="w-4 h-4" />
				All Subjects
			</button>

			{/* Hero */}
			<div className="bg-gradient-to-br from-brand-500 to-quiz-600 rounded-card p-6 text-white shadow-card-lg">
				<div className="flex items-center gap-3 mb-3">
					<div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
						<BookOpen className="w-5 h-5" />
					</div>
					<span className="text-sm font-mono bg-white/15 px-2 py-0.5 rounded-badge">
						{subject.code}
					</span>
				</div>
				<h2 className="text-xl font-bold">{subject.name}</h2>
				{subject.description && (
					<p className="mt-2 text-white/80 text-sm leading-relaxed">
						{subject.description}
					</p>
				)}
				<p className="mt-3 text-white/60 text-xs">
					{subject.duration.toString()} hrs · ID #{subject.id.toString()}
				</p>
			</div>

			{/* Assessments */}
			<div className="space-y-3">
				<h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
					Assessments ({subject.assessments.length})
				</h3>

				{subject.assessments.length === 0 ? (
					<p className="text-sm text-ink-muted bg-surface-card rounded-card px-5 py-4">
						No assessments for this subject yet.
					</p>
				) : (
					subject.assessments.map((a) => (
						<div
							key={a.id.toString()}
							className="bg-surface-card rounded-card px-5 py-4 shadow-card flex items-center justify-between gap-4"
						>
							<div>
								<p className="font-semibold text-ink-deep text-sm">{a.title}</p>
								<p className="text-xs text-ink-muted mt-0.5">{a.assessmentType}</p>
							</div>
							<div className="text-right shrink-0">
								<p className="text-sm font-bold text-brand-600">
									{a.currentScore.toString()}/{a.maxScore.toString()}
								</p>
								<p className="text-xs text-ink-muted">score</p>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
