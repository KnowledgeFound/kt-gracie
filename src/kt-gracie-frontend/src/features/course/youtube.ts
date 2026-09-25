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

export function youtubeEmbedUrl(id: string): string {
	return `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1&rel=0&modestbranding=1`;
}

/** YouTube player state 0 = ended. Handles both message shapes the embed posts. */
export function isEndedMessage(data: unknown): boolean {
	let msg: any = data;
	if (typeof data === 'string') {
		try {
			msg = JSON.parse(data);
		} catch {
			return false;
		}
	}
	if (!msg || typeof msg !== 'object') return false;
	if (msg.event === 'onStateChange') return msg.info === 0;
	if (msg.event === 'infoDelivery') return msg.info?.playerState === 0;
	return false;
}
