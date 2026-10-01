import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ExternalLink, Lock } from 'lucide-react';
import {
	isWatchedMessage,
	parsePlayerMessage,
	playerHandshake,
	youtubeEmbedUrl,
	youtubeId,
	youtubeWatchUrl,
} from '../youtube';

/** Seconds before the manual "I've watched it" fallback appears (embeds can be blocked). */
const FALLBACK_AFTER_S = 20;
/** How often to re-offer the handshake until the player answers. */
const HANDSHAKE_EVERY_MS = 500;
/** Give up handshaking after this long — the player is not going to talk. */
const HANDSHAKE_FOR_MS = 15_000;

interface VideoPlayerProps {
	url: string;
	required: boolean;
	watched: boolean;
	onWatched: () => void;
}

/**
 * YouTube embed. A compulsory video reports back when playback reaches the
 * end (over the embed's postMessage channel, no external script), which
 * unlocks Continue. If the embed is blocked or the player never answers, a
 * fallback button and a link out to YouTube keep the learner moving.
 */
export default function VideoPlayer({ url, required, watched, onWatched }: VideoPlayerProps) {
	const id = youtubeId(url);
	const frame = useRef<HTMLIFrameElement>(null);
	const [waited, setWaited] = useState(false);

	// Latest callback without re-running the listener effect on every render.
	const watchedRef = useRef(onWatched);
	watchedRef.current = onWatched;

	useEffect(() => {
		if (!id) return;

		const post = (message: string) =>
			frame.current?.contentWindow?.postMessage(message, '*');

		// The player only starts reporting once it has been asked to, and it
		// ignores anything sent before it is ready — so keep asking until it
		// replies rather than firing once on load and hoping.
		let handshake: ReturnType<typeof setInterval> | null = setInterval(() => {
			playerHandshake().forEach(post);
		}, HANDSHAKE_EVERY_MS);

		const stopHandshake = () => {
			if (handshake) clearInterval(handshake);
			handshake = null;
		};

		const onMessage = (e: MessageEvent) => {
			if (e.source !== frame.current?.contentWindow) return;
			// Any reply means the channel is open; no need to keep pinging.
			if (parsePlayerMessage(e.data)) stopHandshake();
			if (isWatchedMessage(e.data)) watchedRef.current();
		};

		window.addEventListener('message', onMessage);
		playerHandshake().forEach(post);

		const giveUp = setTimeout(stopHandshake, HANDSHAKE_FOR_MS);
		const fallback = setTimeout(() => setWaited(true), FALLBACK_AFTER_S * 1000);

		return () => {
			window.removeEventListener('message', onMessage);
			stopHandshake();
			clearTimeout(giveUp);
			clearTimeout(fallback);
		};
	}, [id]);

	if (!id) return null;

	return (
		<div className="mb-6">
			<div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
				<iframe
					ref={frame}
					src={youtubeEmbedUrl(id)}
					title="Lesson video"
					className="absolute inset-0 w-full h-full"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
					allowFullScreen
				/>
			</div>

			<div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
				{required ? (
					watched ? (
						<span className="flex items-center gap-1.5 text-emerald-600 font-medium">
							<CheckCircle2 className="size-4" /> Video watched
						</span>
					) : (
						<span className="flex items-center gap-1.5 text-ink-muted">
							<Lock className="size-4" /> Watch to the end to continue
						</span>
					)
				) : (
					<span />
				)}

				<span className="flex items-center gap-4">
					{required && !watched && waited && (
						<button onClick={onWatched} className="text-brand-600 hover:underline">
							I’ve watched it
						</button>
					)}
					<a
						href={youtubeWatchUrl(id)}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1.5 text-ink-muted hover:text-brand-600 hover:underline"
					>
						<ExternalLink className="size-4" /> Watch on YouTube
					</a>
				</span>
			</div>
		</div>
	);
}
