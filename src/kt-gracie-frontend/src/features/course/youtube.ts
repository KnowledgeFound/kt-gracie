/** Extract the 11-character video id from any common YouTube URL, or null. */
export function youtubeId(url: string | undefined | null): string | null {
	if (!url) return null;
	try {
		const u = new URL(url);
		const host = u.hostname.replace(/^www\.|^m\./, '');
		let id: string | null = null;

		if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
		else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
			if (u.pathname === '/watch') id = u.searchParams.get('v');
			else {
				const m = /^\/(embed|shorts|live|v)\/([^/?]+)/.exec(u.pathname);
				id = m ? m[2] : null;
			}
		}
		return id && /^[\w-]{11}$/.test(id) ? id : null;
	} catch {
		return null;
	}
}

/**
 * Embeddable player URL.
 *
 * `enablejsapi` together with `origin` is what lets the page hear the
 * player's state over postMessage (see {@link parsePlayerMessage}) — YouTube
 * stays silent for a frame whose parent origin it was never told about, which
 * would leave a compulsory video permanently un-watchable. `playsinline`
 * stops iOS hijacking the video into its own fullscreen player.
 */
export function youtubeEmbedUrl(id: string): string {
	const params = new URLSearchParams({
		enablejsapi: '1',
		rel: '0',
		modestbranding: '1',
		playsinline: '1',
	});
	if (typeof window !== 'undefined' && window.location?.origin) {
		params.set('origin', window.location.origin);
	}
	return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

/** Public watch page — the escape hatch when an embed is blocked. */
export function youtubeWatchUrl(id: string): string {
	return `https://www.youtube.com/watch?v=${id}`;
}

/** The handshake an embed needs before it will report anything back. */
export function playerHandshake(): string[] {
	return [
		JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }),
		JSON.stringify({
			event: 'command',
			func: 'addEventListener',
			args: ['onStateChange'],
			id: 1,
			channel: 'widget',
		}),
	];
}

/** Player states YouTube reports. Only ENDED gates the lesson. */
export const PLAYER_ENDED = 0;

export interface PlayerMessage {
	/** -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued. */
	state?: number;
	currentTime?: number;
	duration?: number;
}

/**
 * Read one postMessage from the embed. The player uses two shapes: a plain
 * `onStateChange` event, and the chattier `infoDelivery` payload it sends
 * while playing — the latter carries the clock, which is how a video that is
 * scrubbed to the end still counts as watched.
 */
export function parsePlayerMessage(data: unknown): PlayerMessage | null {
	let msg: unknown = data;
	if (typeof data === 'string') {
		try {
			msg = JSON.parse(data);
		} catch {
			return null;
		}
	}
	if (!msg || typeof msg !== 'object') return null;

	const { event, info } = msg as { event?: string; info?: unknown };

	if (event === 'onStateChange') {
		return typeof info === 'number' ? { state: info } : null;
	}
	if (event === 'infoDelivery' && info && typeof info === 'object') {
		const { playerState, currentTime, duration } = info as Record<string, unknown>;
		return {
			state: typeof playerState === 'number' ? playerState : undefined,
			currentTime: typeof currentTime === 'number' ? currentTime : undefined,
			duration: typeof duration === 'number' ? duration : undefined,
		};
	}
	return null;
}

/** YouTube player state 0 = ended. Handles both message shapes the embed posts. */
export function isEndedMessage(data: unknown): boolean {
	return parsePlayerMessage(data)?.state === PLAYER_ENDED;
}

/**
 * Close enough to the end to count as watched. Players routinely stop
 * reporting a second or two short of `duration`, and skipping the outro is
 * not the kind of cheating worth blocking a learner over.
 */
export const WATCHED_FRACTION = 0.95;

export function isWatchedMessage(data: unknown): boolean {
	const msg = parsePlayerMessage(data);
	if (!msg) return false;
	if (msg.state === PLAYER_ENDED) return true;
	return (
		typeof msg.currentTime === 'number' &&
		typeof msg.duration === 'number' &&
		msg.duration > 0 &&
		msg.currentTime / msg.duration >= WATCHED_FRACTION
	);
}
