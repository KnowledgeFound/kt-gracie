/**
 * Gracie's recorded voice.
 *
 * `npm run voice` pre-generates one audio clip per sentence of every fixed line
 * (see `features/city/gracieLines.ts`) with a neural voice, and writes a
 * manifest mapping each sentence to its file. A line is played from clips only
 * when *every* sentence in it has one — otherwise the caller falls back to the
 * browser's speech synthesiser, so a single unrecorded sentence never makes
 * Gracie switch voices mid-line.
 */

export const CLIPS_BASE = '/audio/gracie/';
const MANIFEST_URL = `${CLIPS_BASE}manifest.json`;

export interface ClipManifest {
	/** The voice the clips were generated with, e.g. `kokoro:am_michael`. */
	voice: string;
	/** Normalised sentence → file name inside {@link CLIPS_BASE}. */
	clips: Record<string, string>;
}

export function normalizeSentence(text: string): string {
	return text.replace(/\s+/g, ' ').trim();
}

/**
 * Splits a line into sentences. The generator and the player both use this,
 * so they always agree on where one clip ends and the next begins.
 */
export function splitSentences(text: string): string[] {
	const clean = normalizeSentence(text);
	if (!clean) return [];
	const parts = clean.match(/[^.!?]+[.!?]+["'”’)]*|[^.!?]+$/g) ?? [clean];
	return parts.map(normalizeSentence).filter(Boolean);
}

let manifest: ClipManifest | null = null;

/** Starts loading the manifest. Safe to call repeatedly. */
let loading: Promise<void> | null = null;
export function loadClipManifest(): Promise<void> {
	if (loading) return loading;
	if (typeof fetch !== 'function') return (loading = Promise.resolve());
	loading = fetch(MANIFEST_URL)
		.then((res) => (res.ok ? res.json() : null))
		.then((json: ClipManifest | null) => {
			if (json && json.clips) manifest = json;
		})
		.catch(() => {
			/* No recordings: the browser voice covers everything. */
		});
	return loading;
}

/** For tests. */
export function setClipManifest(next: ClipManifest | null): void {
	manifest = next;
	loading = Promise.resolve();
}

/** Clip URLs for `text`, or null if any sentence of it is not recorded. */
export function clipsFor(text: string): string[] | null {
	if (!manifest) return null;
	const sentences = splitSentences(text);
	if (sentences.length === 0) return null;
	const urls: string[] = [];
	for (const sentence of sentences) {
		const file = manifest.clips[sentence];
		if (!file) return null;
		urls.push(CLIPS_BASE + file);
	}
	return urls;
}

export interface PlayClipsOptions {
	/** Playback speed; 1 is the recorded speed. */
	rate?: number;
	/** 0–1. */
	volume?: number;
	onEnd?: () => void;
}

let stopCurrent: (() => void) | null = null;

/** Silences whatever clip sequence is playing. */
export function stopClips(): void {
	stopCurrent?.();
	stopCurrent = null;
}

/**
 * Plays `urls` back to back, replacing anything already playing. The next clip
 * is preloaded while the current one plays so sentences join without a stall.
 * Returns a stop function that only acts while this sequence is still current.
 */
export function playClips(urls: string[], options: PlayClipsOptions = {}): () => void {
	stopClips();
	const { rate = 1, volume = 1, onEnd } = options;
	let stopped = false;
	let index = 0;

	const make = (url: string) => {
		const audio = new Audio(url);
		audio.preload = 'auto';
		audio.volume = Math.min(1, Math.max(0, volume));
		audio.playbackRate = rate;
		return audio;
	};

	let current: HTMLAudioElement | null = null;
	let upcoming: HTMLAudioElement | null = urls.length > 0 ? make(urls[0]) : null;

	const finish = () => {
		if (stopped) return;
		stopped = true;
		if (stopCurrent === stop) stopCurrent = null;
		onEnd?.();
	};

	const next = () => {
		if (stopped) return;
		if (index >= urls.length || !upcoming) {
			finish();
			return;
		}
		current = upcoming;
		index += 1;
		upcoming = index < urls.length ? make(urls[index]) : null;
		current.onended = next;
		// A missing or broken clip is skipped rather than stalling the line.
		current.onerror = next;
		current.play().catch((err: unknown) => {
			// Blocked autoplay (no user gesture yet) — end quietly. Other
			// failures also fire `error`, which moves on to the next clip.
			if (err instanceof DOMException && err.name === 'NotAllowedError') finish();
		});
	};

	const stop = () => {
		if (stopped) return;
		stopped = true;
		current?.pause();
		current = null;
		upcoming = null;
		if (stopCurrent === stop) stopCurrent = null;
	};

	stopCurrent = stop;
	next();
	return stop;
}
