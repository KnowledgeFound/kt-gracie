import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	ArrowRight,
	FileText,
	ExternalLink,
	ListTree,
	MessageCircle,
	Rows3,
	CheckCircle2,
	Circle,
	ArrowLeft,
} from 'lucide-react';
import classnames from 'classnames';
import type { ModuleAssessment } from '@/features/city/types';
import type { LessonSection } from '../types';
import Markdown from '../Markdown';
import VideoPlayer from './VideoPlayer';
import ReadAloudPill from './ReadAloudPill';
import { markdownToSpeech } from '../utils';
import { youtubeId } from '../youtube';
import { driveEmbedUrl, driveFileId } from '../drive';

interface LessonScreenProps {
	teaching: ModuleAssessment;
	sections: LessonSection[];
	sectionIndex: number;
	activities: ModuleAssessment[];
	activityIndex: number;
	isDone: (a: ModuleAssessment) => boolean;
	onSection: (i: number) => void;
	onContinue: () => void;
	onActivity: (i: number) => void;
	onAsk: () => void;
	isLastSection: boolean;
	/** Section ids whose compulsory video is already finished. */
	watched: string[];
	onWatched: (sectionId: string) => void;
}

type Sheet = 'lessons' | 'outline' | null;

/** One lesson section at a time, with a floating Lessons / Outline / Question / Continue bar. */
export default function LessonScreen({
	teaching,
	sections,
	sectionIndex,
	activities,
	activityIndex,
	isDone,
	onSection,
	onContinue,
	onActivity,
	onAsk,
	isLastSection,
	watched,
	onWatched,
}: LessonScreenProps) {
	const [sheet, setSheet] = useState<Sheet>(null);
	const section = sections[Math.min(sectionIndex, sections.length - 1)];
	const progress = sections.length
		? ((sectionIndex + 1) / sections.length) * 100
		: 0;
	// A finished lesson is never gated; otherwise stop at the first unwatched compulsory video.
	const gated = (s: LessonSection) =>
		!isDone(teaching) &&
		!!s.video &&
		s.video.required !== false &&
		!watched.includes(s.id);
	const firstGate = sections.findIndex(gated);
	const reachable = firstGate < 0 ? sections.length - 1 : firstGate;
	const blocked = section ? gated(section) : false;
	const showSource =
		!!teaching.content?.url && !youtubeId(teaching.content.url);
	const toggle = (s: Sheet) => setSheet((cur) => (cur === s ? null : s));

	if (!section) return null;

	return (
		<div className="relative mx-auto w-full max-w-3xl px-4 pb-40">
			{/* Progress rail */}
			<div
				aria-hidden="true"
				className="fixed left-0 top-28 bottom-6 w-1.5 bg-gray-100 rounded-r-full overflow-hidden hidden sm:block"
			>
				<div
					className="w-full bg-gradient-to-b from-amber-400 via-brand-400 to-emerald-400 transition-all duration-500"
					style={{ height: `${progress}%` }}
				/>
			</div>

			<AnimatePresence mode="wait">
				<motion.article
					key={section.id}
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -12 }}
					transition={{ duration: 0.25 }}
					className="rounded-sm  md:rounded-2xl bg-white shadow-sm border border-gray-100 p-4 md:p-6"
				>
					<p className="mb-4 text-xs font-bold tracking-widest text-ink-subtle uppercase">
						Section {sectionIndex + 1} of {sections.length}
					</p>
					{section.video && (
						<VideoPlayer
							key={section.id}
							url={section.video.url}
							required={section.video.required !== false && !isDone(teaching)}
							watched={watched.includes(section.id) || isDone(teaching)}
							onWatched={() => onWatched(section.id)}
						/>
					)}
					{section.embed && driveFileId(section.embed.url) && (
						<div className="mb-6">
							<div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
								<iframe
									src={driveEmbedUrl(driveFileId(section.embed.url)!)}
									title={section.embed.title ?? 'Lesson material'}
									className="absolute inset-0 w-full h-full"
									allow="autoplay; fullscreen"
									allowFullScreen
									loading="lazy"
								/>
							</div>
							<a
								href={section.embed.url}
								target="_blank"
								rel="noreferrer"
								className="mt-2 inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline"
							>
								<FileText className="size-4" /> Open in Drive
							</a>
						</div>
					)}
					<Markdown source={section.markdown} />

					{(!section.video || showSource) && (
						<>
							<hr className="my-4 border-gray-200" />
							<div className="flex flex-wrap items-center gap-x-6 gap-y-2">
								{!section.video && (
									<ReadAloudPill text={markdownToSpeech(section.markdown)} />
								)}
								{showSource && (
									<a
										href={teaching.content!.url}
										target="_blank"
										rel="noreferrer"
										className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline"
									>
										<ExternalLink className="size-4" /> Source:{' '}
										{teaching.content!.name}
									</a>
								)}
							</div>
						</>
					)}
				</motion.article>
			</AnimatePresence>

			{/* Floating bar */}
			<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-xl">
				<AnimatePresence>
					{sheet && (
						<motion.div
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 8 }}
							className="mb-2 max-h-72 overflow-y-auto rounded-2xl bg-white border border-gray-100 shadow-xl p-2"
						>
							{sheet === 'outline' &&
								sections.map((s, i) => (
									<button
										key={s.id}
										disabled={i > reachable}
										onClick={() => {
											onSection(i);
											setSheet(null);
										}}
										className={classnames(
											'w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed',
											i === sectionIndex
												? 'font-semibold text-brand-700 bg-brand-50'
												: 'text-ink-mid',
										)}
									>
										{i + 1}. {s.title}
									</button>
								))}
							{sheet === 'lessons' &&
								activities.map((a, i) => (
									<button
										key={`${a.type}-${a.id}`}
										onClick={() => {
											onActivity(i);
											setSheet(null);
										}}
										className={classnames(
											'w-full flex items-center gap-2 text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-50',
											i === activityIndex
												? 'font-semibold text-brand-700 bg-brand-50'
												: 'text-ink-mid',
										)}
									>
										{isDone(a) ? (
											<CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
										) : (
											<Circle className="size-4 text-gray-300 shrink-0" />
										)}
										<span className="truncate">{a.title}</span>
									</button>
								))}
						</motion.div>
					)}
				</AnimatePresence>

				<div className="flex items-center justify-between gap-1 rounded-full bg-white/95 backdrop-blur border border-gray-100 shadow-xl p-2">
					{/* Previous */}
					{sections.length > 0 && (
						<>
							<button
								onClick={() => onSection(sectionIndex - 1)}
								disabled={sectionIndex === 0}
								aria-label="Previous section"
								className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 text-white text-sm font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<ArrowLeft className="size-3" />
								Previous
							</button>

							<span className="w-px h-6 bg-gray-200" />
						</>
					)}

					<BarButton
						icon={<Rows3 className="size-4" />}
						label="Lessons"
						onClick={() => toggle('lessons')}
					/>
					<BarButton
						icon={<ListTree className="size-4" />}
						label="Outline"
						onClick={() => toggle('outline')}
					/>
					<span className="w-px h-6 bg-gray-200" />
					<button
						onClick={onContinue}
						disabled={blocked}
						title={blocked ? 'Watch the video to the end first' : undefined}
						className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 text-white text-sm font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLastSection ? 'Finish lesson' : 'Continue'}{' '}
						<ArrowRight className="size-3" />
					</button>
				</div>
			</div>
		</div>
	);
}

function BarButton({
	icon,
	label,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-ink-mid hover:bg-gray-100"
		>
			{icon}
			<span className="hidden sm:inline">{label}</span>
		</button>
	);
}
