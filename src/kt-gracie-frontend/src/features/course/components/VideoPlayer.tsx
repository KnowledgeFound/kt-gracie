import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { isEndedMessage, youtubeEmbedUrl, youtubeId } from '../youtube';

/** Seconds before the manual "I've watched it" fallback appears (embeds can be blocked). */
const FALLBACK_AFTER_S = 20;

interface VideoPlayerProps {
	url: string;
	required: boolean;
	watched: boolean;
	onWatched: () => void;
}

/**
 * YouTube embed. A compulsory video reports back when playback ends (via the
 * embed's postMessage channel, no external script), which unlocks Continue.
 * If the embed is blocked or offline, a fallback button appears after a delay
 * so the learner is never stuck.
 */
export default function VideoPlayer({ url, required, watched, onWatched }: VideoPlayerProps) {
	const id = youtubeId(url);
	const frame = useRef<HTMLIFrameElement>(null);
	const [waited, setWaited] = useState(false);

	useEffect(() => {
		if (!required || watched) return;
		const onMessage = (e: MessageEvent) => {
			if (e.source === frame.current?.contentWindow && isEndedMessage(e.data)) onWatched();
		};
		window.addEventListener('message', onMessage);
		const t = setTimeout(() => setWaited(true), FALLBACK_AFTER_S * 1000);
		return () => {
			window.removeEventListener('message', onMessage);
			clearTimeout(t);
		};
	}, [required, watched, onWatched]);

	// Ask the embed to start posting state changes.
	const subscribe = () => {
		const w = frame.current?.contentWindow;
		if (!w) return;
		w.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*');
		w.postMessage(JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'] }), '*');
	};

	if (!id) return null;

	return (
		<div className="mb-6">
			<div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
				<iframe
					ref={frame}
					src={youtubeEmbedUrl(id)}
					title="Lesson video"
					className="absolute inset-0 w-full h-full"
					allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
					allowFullScreen
					onLoad={subscribe}
				/>
			</div>

			{required && (
				<div className="mt-2 flex items-center justify-between gap-3 text-sm">
					{watched ? (
						<span className="flex items-center gap-1.5 text-emerald-600 font-medium">
							<CheckCircle2 className="size-4" /> Video watched
						</span>
					) : (
						<span className="flex items-center gap-1.5 text-ink-muted">
							<Lock className="size-4" /> Watch to the end to continue
						</span>
					)}
					{!watched && waited && (
						<button onClick={onWatched} className="text-brand-600 hover:underline">
							I’ve watched it
						</button>
					)}
				</div>
			)}
		</div>
	);
}
