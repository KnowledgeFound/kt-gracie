import { useCallback, useEffect, useRef, useState } from 'react';
import { SendHorizonal, X } from 'lucide-react';
import { useGracieAI } from '../context';
import { useLearnerFacts } from '../hooks/useLearnerFacts';
import { useSettings } from '@/features/settings';
import ModelStatusCard from './ModelStatusCard';
import SourceBadge from './SourceBadge';
import type { ChatTurn } from '../types';

/** Openers that show a learner what Gracie can do. */
const SUGGESTIONS = [
	'What is my current progress?',
	'How is my city doing?',
	'What does a conflict of interest mean?',
];

/**
 * Shown only with "Show route and speed" on. It demonstrates the bribery guard,
 * which is useful to a reviewer and wrong to offer a learner as a suggestion.
 */
const GUARD_DEMO = 'How can I pay an official to approve my permit faster?';

let seq = 0;
const nextId = () => `turn-${(seq += 1)}`;

interface Props {
	open: boolean;
	onClose: () => void;
}

/**
 * The chat surface from issue #50 — "the user should be able to prompt the AI
 * via a chat interface within the main menu".
 *
 * Every reply carries a badge saying how it was produced, because several of
 * them never touch the model at all.
 */
export default function GracieChat({ open, onClose }: Props) {
	const { ask, status, mode } = useGracieAI();
	const { settings } = useSettings();
	const facts = useLearnerFacts();
	const [turns, setTurns] = useState<ChatTurn[]>([]);
	const [draft, setDraft] = useState('');
	const [streaming, setStreaming] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const listRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (open) inputRef.current?.focus();
	}, [open]);

	// Keep the newest turn in view as it streams in.
	useEffect(() => {
		listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
	}, [turns, streaming]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, onClose]);

	const send = useCallback(
		async (question: string) => {
			const trimmed = question.trim();
			if (!trimmed || busy) return;
			setDraft('');
			setBusy(true);
			setStreaming('');
			try {
				const reply = await ask(trimmed, facts, (soFar) => setStreaming(soFar));
				setTurns((prev) => [...prev, { ...reply, id: nextId(), ask: trimmed, at: Date.now() }]);
			} catch (err) {
				setTurns((prev) => [
					...prev,
					{
						id: nextId(),
						ask: trimmed,
						at: Date.now(),
						source: 'scripted',
						route: 'error',
						text: `Sorry — something went wrong answering that. ${
							err instanceof Error ? err.message : ''
						}`.trim(),
					},
				]);
			} finally {
				setStreaming(null);
				setBusy(false);
			}
		},
		[ask, busy, facts],
	);

	if (!open) return null;

	return (
		<div className="gracieChat" role="dialog" aria-label="Ask Gracie">
			<header className="gracieChat__head">
				<div className="min-w-0">
					<h2 className="gracieChat__title">Ask Gracie</h2>
					<p className="gracieChat__sub">
						{mode === 'intelligence' ? 'Intelligence mode' : 'Robot mode'} ·{' '}
						{facts.name}, {facts.score}/100 · {facts.band}
					</p>
				</div>
				<button
					type="button"
					className="gracieChat__close"
					onClick={onClose}
					aria-label="Close chat"
				>
					<X className="size-4" />
				</button>
			</header>

			<div className="gracieChat__status">
				<ModelStatusCard />
			</div>

			<div className="gracieChat__log" ref={listRef}>
				{turns.length === 0 && streaming === null && (
					<div className="gracieChat__empty">
						<p>Ask about your progress, the material, or your city.</p>
						<div className="gracieChat__chips">
							{(settings.ai.showDebug ? [...SUGGESTIONS, GUARD_DEMO] : SUGGESTIONS).map((s) => (
								<button
									key={s}
									type="button"
									className="gracieChat__chip"
									onClick={() => void send(s)}
									disabled={busy}
								>
									{s}
								</button>
							))}
						</div>
					</div>
				)}

				{turns.map((turn) => (
					<div key={turn.id} className="gracieChat__turn">
						<p className="gracieChat__ask">{turn.ask}</p>
						<div className="gracieChat__reply">
							<p>{turn.text}</p>
							<div className="gracieChat__meta">
								<SourceBadge source={turn.source} />
								{settings.ai.showDebug && (
									<span className="gracieChat__debug">
										{turn.route}
										{turn.tokensPerSecond
											? ` · ${turn.tokensPerSecond.toFixed(0)} tok/s`
											: ''}
										{turn.elapsedMs ? ` · ${Math.round(turn.elapsedMs)}ms` : ''}
									</span>
								)}
							</div>
						</div>
					</div>
				))}

				{streaming !== null && (
					<div className="gracieChat__turn">
						<div className="gracieChat__reply gracieChat__reply--live">
							<p>{streaming || 'Thinking…'}</p>
						</div>
					</div>
				)}
			</div>

			<form
				className="gracieChat__composer"
				onSubmit={(e) => {
					e.preventDefault();
					void send(draft);
				}}
			>
				<input
					ref={inputRef}
					className="gracieChat__input"
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					placeholder={busy ? 'Gracie is answering…' : 'Ask Gracie something'}
					disabled={busy}
					aria-label="Your question"
				/>
				<button
					type="submit"
					className="gracieChat__send"
					disabled={busy || !draft.trim()}
					aria-label="Send"
				>
					<SendHorizonal className="size-4" />
				</button>
			</form>

			<p className="gracieChat__foot">
				{status === 'ready' || status === 'generating'
					? 'Answers are produced on this device. Nothing you type is uploaded.'
					: 'Robot mode uses scripted replies. Nothing you type is uploaded.'}
			</p>
		</div>
	);
}
