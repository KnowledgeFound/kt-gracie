import { useEffect, useRef, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { useGracieAI } from '../context';
import { useLearnerFacts } from '../hooks/useLearnerFacts';
import { useSettings } from '@/features/settings';
import SourceBadge from './SourceBadge';
import type { GracieReply, LearnerFacts } from '../types';

interface Props {
	/** The turn to put to Gracie. Phrase it as the event, not as a UI label. */
	ask: string;
	/** Facts true for this moment only — a quiz result, tokens just awarded. */
	facts?: Partial<LearnerFacts>;
	/** Heading above the reply. */
	title?: string;
	className?: string;
}

/**
 * Gracie's reaction to something that just happened — a submitted assessment,
 * tokens awarded, a city-health change.
 *
 * Runs once when it appears and once more if the learner asks for a re-word.
 * Deliberately not re-run on every render: a reply that changes underneath the
 * learner while they are reading it is worse than one that is slightly stale.
 */
export default function GracieFeedback({ ask, facts, title, className }: Props) {
	const { ask: askAI, status } = useGracieAI();
	const { settings } = useSettings();
	const learner = useLearnerFacts(facts);
	const [reply, setReply] = useState<GracieReply | null>(null);
	const [streaming, setStreaming] = useState<string | null>(null);
	const [nonce, setNonce] = useState(0);
	// Ignore an in-flight answer if this unmounts or is asked again.
	const runId = useRef(0);

	useEffect(() => {
		const id = ++runId.current;
		let cancelled = false;
		setReply(null);
		setStreaming('');

		void askAI(ask, learner, (soFar) => {
			if (!cancelled && id === runId.current) setStreaming(soFar);
		})
			.then((r) => {
				if (cancelled || id !== runId.current) return;
				setReply(r);
			})
			.catch(() => {
				if (cancelled || id !== runId.current) return;
				setReply({
					text: `${learner.name}, I couldn't put that into words just now.`,
					source: 'scripted',
					route: 'error',
				});
			})
			.finally(() => {
				if (!cancelled && id === runId.current) setStreaming(null);
			});

		return () => {
			cancelled = true;
		};
		// `learner` is rebuilt per render by useMemo; keying on the fields that
		// actually change keeps this from re-asking on every parent render.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ask, nonce, learner.score, learner.modulesDone, learner.quizScore, learner.tokensJustEarned, status === 'ready']);

	const body = reply?.text ?? streaming ?? '';

	return (
		<section className={`gracieFeedback${className ? ` ${className}` : ''}`}>
			<header className="gracieFeedback__head">
				<h3 className="gracieFeedback__title">{title ?? 'Gracie says'}</h3>
				<button
					type="button"
					className="gracieFeedback__again"
					onClick={() => setNonce((n) => n + 1)}
					disabled={streaming !== null}
					title="Ask Gracie to say it another way"
				>
					<RotateCw className="size-3.5" aria-hidden="true" />
					Again
				</button>
			</header>

			<p className="gracieFeedback__body" aria-live="polite">
				{body || 'Thinking…'}
			</p>

			{reply && (
				<div className="gracieFeedback__meta">
					<SourceBadge source={reply.source} />
					{settings.ai.showDebug && (
						<span className="gracieFeedback__debug">
							{reply.route}
							{reply.tokensPerSecond ? ` · ${reply.tokensPerSecond.toFixed(0)} tok/s` : ''}
						</span>
					)}
				</div>
			)}
		</section>
	);
}
