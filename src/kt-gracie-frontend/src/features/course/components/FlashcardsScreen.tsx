import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import classnames from 'classnames';
import {
	ArrowLeft,
	ArrowRight,
	Check,
	Layers,
	Lightbulb,
	RotateCw,
} from 'lucide-react';
import type { FlashcardQuestion } from '@/types/types';

interface FlashcardsScreenProps {
	cards: FlashcardQuestion[];
	index: number;
	onIndex: (i: number) => void;
	onFinish: () => void;
}

const FACE: React.CSSProperties = {
	backfaceVisibility: 'hidden',
	WebkitBackfaceVisibility: 'hidden',
};

/**
 * Recall cards: a deck you flip (180°) to reveal the answer, then step through.
 * Space / Enter flips, ← → move, and finishing the last card earns the module's KT.
 */
export default function FlashcardsScreen({
	cards,
	index,
	onIndex,
	onFinish,
}: FlashcardsScreenProps) {
	const [flipped, setFlipped] = useState(false);
	const [hintShown, setHintShown] = useState(false);
	const [seen, setSeen] = useState<Set<number>>(() => new Set());

	const safeIndex = Math.min(index, cards.length - 1);
	const card = cards[safeIndex];
	const last = safeIndex >= cards.length - 1;

	const go = useCallback(
		(i: number) => {
			if (i < 0 || i > cards.length - 1) return;
			setFlipped(false);
			setHintShown(false);
			onIndex(i);
		},
		[cards.length, onIndex],
	);

	const flip = useCallback(() => {
		setFlipped((f) => !f);
		setSeen((prev) => new Set(prev).add(safeIndex));
	}, [safeIndex]);

	// Keyboard: ← → move through the deck, Space flips.
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (
				e.target instanceof HTMLElement &&
				/^(INPUT|TEXTAREA)$/.test(e.target.tagName)
			)
				return;
			if (e.key === 'ArrowRight') last ? undefined : go(safeIndex + 1);
			else if (e.key === 'ArrowLeft') go(safeIndex - 1);
			else if (e.key === ' ') {
				e.preventDefault();
				flip();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [go, flip, last, safeIndex]);

	if (!card) return null;

	const reviewed = seen.size;

	return (
		<div className="mx-auto w-full max-w-xl px-4 pb-16">
			{/* Header: label, counter, segmented progress */}
			<div className="mb-5 rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-sm px-4 py-3">
				<div className="flex items-center justify-between text-sm">
					<span className="flex items-center gap-2 font-bold text-ink-deep">
						<Layers className="size-4 text-brand-500" /> Recall Cards
					</span>
					<span className="text-ink-muted tabular-nums">
						{safeIndex + 1} / {cards.length}
					</span>
				</div>
				<div className="mt-2 flex gap-1" role="tablist" aria-label="Cards">
					{cards.map((_, i) => (
						<button
							key={i}
							role="tab"
							aria-selected={i === safeIndex}
							aria-label={`Card ${i + 1}`}
							onClick={() => go(i)}
							className={classnames(
								'h-1.5 flex-1 rounded-full transition-colors',
								i === safeIndex
									? 'bg-brand-500'
									: seen.has(i)
										? 'bg-brand-300'
										: 'bg-gray-200 hover:bg-gray-300',
							)}
						/>
					))}
				</div>
			</div>

			{/* Deck: two ghost cards behind the live one */}
			<div className="relative" style={{ perspective: 1400 }}>
				{!last && (
					<>
						<div className="absolute inset-x-6 top-3 h-full rounded-3xl bg-white/50 border border-white/40" />
						<div className="absolute inset-x-3 top-1.5 h-full rounded-3xl bg-white/70 border border-white/50" />
					</>
				)}

				<motion.div
					key={safeIndex}
					role="button"
					tabIndex={0}
					aria-label={flipped ? 'Show question' : 'Show answer'}
					onClick={flip}
					onKeyDown={(e) => {
						if (e.key === 'Enter') flip();
					}}
					className="relative w-full h-[20rem] md:h-[22rem] cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-brand-300 rounded-3xl"
					initial={{ opacity: 0, x: 40, rotateY: 0 }}
					animate={{ opacity: 1, x: 0, rotateY: flipped ? 180 : 0 }}
					transition={{
						rotateY: { duration: 0.6, ease: 'easeInOut' },
						opacity: { duration: 0.25 },
						x: { duration: 0.3 },
					}}
					style={{ transformStyle: 'preserve-3d' }}
				>
					{/* Front — question */}
					<div
						className="absolute inset-0 rounded-3xl bg-white shadow-xl border border-gray-100 overflow-hidden flex flex-col"
						style={FACE}
					>
						{/* <div className="h-2 bg-gradient-to-r from-brand-400 to-brand-600" /> */}
						<div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-8">
							<span className="px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-[10px] font-bold tracking-widest text-brand-600 uppercase">
								Question
							</span>
							<p className="text-xl md:text-2xl font-bold text-ink-deep leading-snug">
								{card.front}
							</p>
						</div>
						<div className="flex items-center justify-between px-5 pb-4 min-h-[3.25rem]">
							{card.hint ? (
								hintShown ? (
									<p
										className="text-sm text-ink-mid bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5"
										onClick={(e) => e.stopPropagation()}
									>
										<Lightbulb className="inline size-3.5 text-amber-500 mr-1 -mt-0.5" />
										{card.hint}
									</p>
								) : (
									<button
										onClick={(e) => {
											e.stopPropagation();
											setHintShown(true);
										}}
										className="inline-flex items-center gap-1.5 text-sm text-amber-700 hover:underline"
									>
										<Lightbulb className="size-4" /> Show hint
									</button>
								)
							) : (
								<span />
							)}
							<span className="flex items-center gap-1 text-xs text-ink-muted ml-auto">
								<RotateCw className="size-3" />{' '}
								{hintShown ? 'Flip' : 'Tap to flip'}
							</span>
						</div>
					</div>

					{/* Back — answer */}
					<div
						className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-xl overflow-hidden flex flex-col text-white"
						style={{ ...FACE, transform: 'rotateY(180deg)' }}
					>
						<div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-8">
							<span className="px-3 py-1 rounded-full bg-white/15 border border-white/30 text-[10px] font-bold tracking-widest uppercase">
								Answer
							</span>
							<p className="text-xl md:text-2xl font-semibold leading-snug">
								{card.back}
							</p>
						</div>
						<span className="flex items-center justify-end gap-1 text-xs text-white/70 px-5 pb-4">
							<RotateCw className="size-3" /> Tap to flip back
						</span>
					</div>
				</motion.div>
			</div>

			{/* Controls */}
			<div className="mt-8 flex items-center justify-between gap-3">
				<button
					onClick={() => go(safeIndex - 1)}
					disabled={safeIndex === 0}
					className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/90 border border-gray-200 text-sm font-medium text-ink-mid hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<ArrowLeft className="size-4" /> Back
				</button>

				<button
					onClick={flip}
					className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-brand-700 border border-brand-200 text-sm font-semibold shadow-sm hover:bg-brand-50"
				>
					<RotateCw className="size-4" />{' '}
					{flipped ? 'Show question' : 'Flip card'}
				</button>

				{last ? (
					<button
						onClick={onFinish}
						className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold shadow"
					>
						<Check className="size-4" /> Finish
					</button>
				) : (
					<button
						onClick={() => go(safeIndex + 1)}
						className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 text-white text-sm font-semibold shadow"
					>
						Next <ArrowRight className="size-4" />
					</button>
				)}
			</div>

			<p className="mt-4 text-center text-xs text-white/80">
				{reviewed} of {cards.length} flipped · Space to flip · ← → to move
			</p>
		</div>
	);
}
