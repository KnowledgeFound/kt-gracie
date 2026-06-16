import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
	X,
	ArrowRight,
	CheckCircle2,
	Circle,
	Clock,
	Zap,
	BookOpen,
	PlayCircle,
} from 'lucide-react';
import { modules } from '../constants';
import {
	getModuleProgress,
	type ModuleProgress,
	type Lesson,
} from '../mockProgress';

const CITY_SRC = '/assets/city/city.png';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ModuleDrawerProps {
	open: boolean;
	onClose: () => void;
	moduleId: number | null;
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function ModuleDrawer({
	open,
	onClose,
	moduleId,
}: ModuleDrawerProps) {
	const navigate = useNavigate();
	const module = modules.find((m) => m.id === moduleId) ?? null;

	// TODO: replace with useModuleProgress(moduleId) when backend is ready
	const progress = moduleId !== null ? getModuleProgress(moduleId) : null;
	const isStarted = progress !== null;

	function handleCTA() {
		if (!module) return;
		onClose();
		navigate(`/quiz/${module.id}`);
	}

	return (
		<AnimatePresence>
			{open && (
				<>
					{/* ── Backdrop ── */}
					<motion.div
						key="backdrop"
						className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={onClose}
					/>

					{/* ── Drawer ── */}
					<motion.aside
						key="drawer"
						role="dialog"
						aria-modal="true"
						aria-label={module?.name ?? 'Module details'}
						className="fixed top-0 right-0 h-full w-full md:w-[50%] max-w-lg z-50 flex flex-col bg-white shadow-2xl"
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', stiffness: 320, damping: 32 }}
					>
						{module ? (
							<>
								<ModuleHeader
									module={module}
									progress={progress}
									onClose={onClose}
								/>

								<div className="flex-1 overflow-y-auto">
									{isStarted ? (
										<InProgressBody progress={progress!} />
									) : (
										<NotStartedBody module={module} />
									)}
								</div>

								<DrawerFooter isStarted={isStarted} onCTA={handleCTA} />
							</>
						) : (
							<div className="flex flex-col items-center justify-center flex-1 gap-4 text-ink-muted p-6">
								<p>No module selected.</p>
								<button onClick={onClose} className="text-sm underline">
									Close
								</button>
							</div>
						)}
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	);
}

// ─── Header ───────────────────────────────────────────────────────────────────

interface ModuleHeaderProps {
	module: (typeof modules)[number];
	progress: ModuleProgress | null;
	onClose: () => void;
}

function ModuleHeader({ module, progress, onClose }: ModuleHeaderProps) {
	const Icon = module.icon;
	const pct = progress?.percentComplete ?? 0;

	return (
		<>
			<div className="relative px-5 pt-5 pb-4 border-b border-gray-100 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shrink-0">
				{/* Close */}
				<button
					onClick={onClose}
					aria-label="Close drawer"
					className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
				>
					<X className="w-4 h-4" />
				</button>

				{/* Icon + title */}
				<div className="flex items-center gap-3 pr-10">
					<div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
						<Icon className="w-6 h-6" />
					</div>
					<div className="min-w-0">
						<p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-0.5">
							Module
						</p>
						<h2 className="text-xl font-bold leading-tight truncate">
							{module.name}
						</h2>
					</div>
				</div>

				{/* Progress bar — only when started */}
				{progress ? (
					<div className="mt-4">
						<div className="flex justify-between text-xs text-blue-100 mb-1.5">
							<span>
								{progress.completedLessons} / {progress.totalLessons} lessons
							</span>
							<span className="font-semibold">{pct}%</span>
						</div>
						<div
							className="h-2 bg-white/20 rounded-full overflow-hidden"
							role="progressbar"
							aria-valuenow={pct}
							aria-valuemin={0}
							aria-valuemax={100}
						>
							<motion.div
								className="h-full bg-white rounded-full"
								initial={{ width: 0 }}
								animate={{ width: `${pct}%` }}
								transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
							/>
						</div>
					</div>
				) : (
					<div className="mt-4">
						{/* Description */}
						<p className="text-sm text-white leading-tight">
							{module.description}
						</p>
					</div>
				)}
			</div>
			{/* Video Frame */}
			<div className="relative w-full bg-blue-50 overflow-hidden max-h-[250px] ">
				<img src={CITY_SRC} alt="city image" className="w-full h-full" />
			</div>
		</>
	);
}

// ─── In-progress body ─────────────────────────────────────────────────────────

function InProgressBody({ progress }: { progress: ModuleProgress }) {
	const remaining = progress.totalLessons - progress.completedLessons;

	return (
		<section className="bg-white px-5 py-5 space-y-5">
			{/* ── Stats row ── */}
			<div className="grid grid-cols-2 gap-3 bg-white">
				<StatCard
					icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
					label="Completed"
					value={`${progress.completedLessons} lessons`}
				/>
				<StatCard
					icon={<BookOpen className="w-4 h-4 text-blue-500" />}
					label="Remaining"
					value={`${remaining} lesson${remaining !== 1 ? 's' : ''}`}
				/>
				<StatCard
					icon={<Zap className="w-4 h-4 text-amber-500" />}
					label="XP Earned"
					value={`${progress.xpEarned} / ${progress.xpTotal} XP`}
				/>
				<StatCard
					icon={<Clock className="w-4 h-4 text-ink-muted" />}
					label="Est. remaining"
					value={formatRemaining(progress.lessons)}
				/>
			</div>

			{/* ── Continue from ── */}
			<section className="bg-white">
				<h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
					Continue from
				</h3>
				<div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
					<div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
						<PlayCircle className="w-4 h-4 text-white" />
					</div>
					<div className="min-w-0">
						<p className="text-sm font-semibold text-ink-deep truncate">
							{progress.currentLesson.title}
						</p>
						<p className="text-xs text-ink-muted">
							Lesson {progress.currentLesson.id} ·{' '}
							{progress.currentLesson.durationMin} min
						</p>
					</div>
				</div>
			</section>

			{/* ── Lesson list ── */}
			<section className="bg-white">
				<h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
					All lessons
				</h3>
				<ol className="space-y-1.5">
					{progress.lessons.map((lesson) => (
						<LessonRow
							key={lesson.id}
							lesson={lesson}
							isCurrent={lesson.id === progress.currentLesson.id}
						/>
					))}
				</ol>
			</section>
		</section>
	);
}

// ─── Not-started body ─────────────────────────────────────────────────────────

function NotStartedBody({ module }: { module: (typeof modules)[number] }) {
	return (
		<section className="px-5 py-5 space-y-5 bg-white">
			{/* Overview stats */}
			<div className="grid grid-cols-2 gap-3">
				<StatCard
					icon={<BookOpen className="w-4 h-4 text-blue-500" />}
					label="Lessons"
					value="8 lessons"
				/>
				<StatCard
					icon={<Clock className="w-4 h-4 text-ink-muted" />}
					label="Duration"
					value="~2 hrs"
				/>
				<StatCard
					icon={<Zap className="w-4 h-4 text-amber-500" />}
					label="XP Reward"
					value="400 XP"
				/>
				<StatCard
					icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
					label="Level"
					value="Beginner"
				/>
			</div>
			<div>
				<h3 className="text-md font-semibold capitailze mb-2 flex items-center ">
					<BookOpen className="w-6 h-6 text-blue-500 mr-2" />
					What You'll Learn
				</h3>
				<ol className="space-y-1.5">
					{module.expectations.map((item, index) => (
						<li
							key={index}
							className="
							flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors border border-transparent"
						>
							<CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />

							<span className="flex-1 truncate text-ink-deep">{item}</span>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function DrawerFooter({
	isStarted,
	onCTA,
}: {
	isStarted: boolean;
	onCTA: () => void;
}) {
	return (
		<div className="px-5 py-4 border-t border-gray-100 shrink-0 bg-white">
			<button
				onClick={onCTA}
				className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-white font-semibold transition-colors bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
			>
				{isStarted ? (
					<>
						<PlayCircle className="w-4 h-4 shrink-0" />
						<span>Continue Learning</span>
					</>
				) : (
					<>
						<span>Start Learning</span>
						<ArrowRight className="w-4 h-4 shrink-0" />
					</>
				)}
			</button>
		</div>
	);
}

// ─── Shared sub-components ────────────────────────────────────────────────────

interface StatCardProps {
	icon: React.ReactNode;
	label: string;
	value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
	return (
		<div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex items-start gap-2">
			<span className="mt-0.5 shrink-0">{icon}</span>
			<div className="min-w-0">
				<p className="text-xs text-ink-muted">{label}</p>
				<p className="text-sm font-semibold text-ink-deep truncate">{value}</p>
			</div>
		</div>
	);
}

interface LessonRowProps {
	lesson: Lesson;
	isCurrent: boolean;
}

function LessonRow({ lesson, isCurrent }: LessonRowProps) {
	return (
		<li
			className={[
				'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
				isCurrent
					? 'bg-blue-50 border border-blue-200'
					: lesson.completed
						? 'bg-gray-50 border border-transparent'
						: 'border border-transparent',
			].join(' ')}
		>
			{lesson.completed ? (
				<CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
			) : isCurrent ? (
				<PlayCircle className="w-4 h-4 text-blue-500 shrink-0" />
			) : (
				<Circle className="w-4 h-4 text-gray-300 shrink-0" />
			)}

			<span
				className={[
					'flex-1 truncate',
					lesson.completed ? 'text-ink-muted line-through' : 'text-ink-deep',
					isCurrent ? 'font-semibold text-blue-700' : '',
				].join(' ')}
			>
				{lesson.title}
			</span>

			<span className="text-xs text-ink-muted shrink-0 ml-auto pl-2">
				{lesson.durationMin}m
			</span>
		</li>
	);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRemaining(lessons: Lesson[]): string {
	const mins = lessons
		.filter((l) => !l.completed)
		.reduce((acc, l) => acc + l.durationMin, 0);
	if (mins < 60) return `${mins} min`;
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
