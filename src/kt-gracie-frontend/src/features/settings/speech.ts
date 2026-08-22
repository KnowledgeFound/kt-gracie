import { useEffect, useState } from 'react';
import { PACE_RATE } from './constants';
import type { GuidePace } from './types';

/**
 * Gracie's voice.
 *
 * The city ships no recorded audio, so her lines are read by the browser's
 * built-in speech synthesiser. Everything here degrades to a no-op where the
 * API is missing (older Safari, some in-app webviews) — callers can check
 * {@link speechSupported} to hide the controls entirely.
 */

export const speechSupported =
	typeof window !== 'undefined' && 'speechSynthesis' in window;

export interface SpeakOptions {
	voiceURI?: string | null;
	pace?: GuidePace;
	/** 0–1. */
	volume?: number;
	onEnd?: () => void;
}

export function listVoices(): SpeechSynthesisVoice[] {
	if (!speechSupported) return [];
	return window.speechSynthesis.getVoices();
}

/**
 * Voices load asynchronously in Chrome — the first `getVoices()` call usually
 * returns an empty list and the real one arrives on `voiceschanged`.
 */
export function useVoices(): SpeechSynthesisVoice[] {
	const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(listVoices);

	useEffect(() => {
		if (!speechSupported) return;
		const sync = () => setVoices(listVoices());
		sync();
		window.speechSynthesis.addEventListener('voiceschanged', sync);
		return () =>
			window.speechSynthesis.removeEventListener('voiceschanged', sync);
	}, []);

	return voices;
}

/**
 * Chromium swallows a `speak()` issued in the same tick as the `cancel()` that
 * interrupted the previous utterance — the new line queues but never sounds.
 * Letting the cancel settle for a beat fixes the common case; the watchdog below
 * covers the rest.
 */
const RESTART_DELAY_MS = 90;

/**
 * How long a queued utterance gets to fire `start` before we assume the engine
 * ate it and try again. Chromium's swallow is not reliably tied to any one
 * delay, so we detect the silence instead of trying to out-wait it.
 */
const WATCHDOG_MS = 320;
const MAX_ATTEMPTS = 4;

/** Chromium cuts an utterance off after ~15s unless the queue is nudged. */
const KEEPALIVE_MS = 10_000;

const isChromium =
	typeof navigator !== 'undefined' &&
	/Chrom(e|ium)|Edg\//.test(navigator.userAgent);

/**
 * Bumped by every `speak()` and every stop. A pending start, a watchdog, an
 * `end` handler and the returned canceller each act only while they still own
 * the current session, so a superseded line can never cancel or report on the
 * one that replaced it.
 */
let session = 0;
let keepAlive: ReturnType<typeof setInterval> | null = null;
/** Chromium drops audio if the live utterance is garbage collected. */
let speaking: SpeechSynthesisUtterance | null = null;

function clearKeepAlive(): void {
	if (keepAlive === null) return;
	clearInterval(keepAlive);
	keepAlive = null;
}

export function stopSpeaking(): void {
	if (!speechSupported) return;
	session += 1;
	clearKeepAlive();
	speaking = null;
	window.speechSynthesis.cancel();
}

/**
 * Speak `text`, replacing whatever is currently being said.
 * Returns a cancel function so effects can clean up on unmount.
 *
 * Interrupting a half-finished line is the normal case here — the user clicks
 * the next district, or Continue, while Gracie is still talking — so the whole
 * function is built around it. The cancel function is a no-op once a newer
 * `speak()` has taken over, so the usual React order (cleanup of the old line,
 * then the effect for the new one) cannot mute the new line; and every attempt
 * is watched, so a line the engine silently drops is spoken on the retry rather
 * than lost.
 */
export function speak(text: string, options: SpeakOptions = {}): () => void {
	if (!speechSupported || !text.trim()) return () => {};

	const { voiceURI, pace = 'standard', volume = 1, onEnd } = options;
	const synth = window.speechSynthesis;

	const id = ++session;
	clearKeepAlive();
	speaking = null;
	synth.cancel();

	let attempts = 0;
	let began = false;
	let timer: ReturnType<typeof setTimeout>;

	const build = () => {
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.rate = PACE_RATE[pace];
		utterance.volume = Math.min(1, Math.max(0, volume));
		utterance.pitch = 1.05; // a touch brighter — she is a friendly guide

		const voice = voiceURI
			? listVoices().find((v) => v.voiceURI === voiceURI)
			: undefined;
		if (voice) utterance.voice = voice;

		// `end` and `error` also fire for an utterance we ourselves discarded on a
		// retry, so every handler checks it is still the live one — otherwise a
		// retry would report the line as finished before it had said a word.
		const live = () => id === session && speaking === utterance;

		utterance.addEventListener('start', () => {
			if (!live()) return;
			began = true;
			clearTimeout(timer);
			if (isChromium) {
				keepAlive = setInterval(() => {
					if (id !== session || !synth.speaking) {
						clearKeepAlive();
						return;
					}
					synth.pause();
					synth.resume();
				}, KEEPALIVE_MS);
			}
		});

		const finish = () => {
			if (!live()) return;
			clearTimeout(timer);
			clearKeepAlive();
			speaking = null;
			onEnd?.();
		};
		utterance.addEventListener('end', finish);
		utterance.addEventListener('error', finish);

		return utterance;
	};

	const attempt = () => {
		if (id !== session) return; // superseded while we waited

		// Leftovers from the line we interrupted — including Chromium's `speaking`
		// flag stuck on after a cancel — swallow whatever we queue behind them.
		if (synth.speaking || synth.pending) {
			speaking = null; // disown the utterance this cancel is about to kill
			synth.cancel();
		}
		if (synth.paused) synth.resume();

		attempts += 1;
		const utterance = build();
		speaking = utterance;
		synth.speak(utterance);
		timer = setTimeout(watchdog, WATCHDOG_MS);
	};

	// Nothing started talking, so the engine dropped the utterance: clear the
	// queue and say it again.
	const watchdog = () => {
		if (id !== session || began || attempts >= MAX_ATTEMPTS) return;
		attempt();
	};

	timer = setTimeout(attempt, RESTART_DELAY_MS);

	return () => {
		if (id !== session) return; // a newer line owns the voice now — leave it be
		session += 1;
		clearTimeout(timer);
		clearKeepAlive();
		speaking = null;
		synth.cancel();
	};
}
