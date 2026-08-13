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

export function stopSpeaking(): void {
	if (!speechSupported) return;
	window.speechSynthesis.cancel();
}

/**
 * Speak `text`, replacing whatever is currently being said.
 * Returns a cancel function so effects can clean up on unmount.
 */
export function speak(text: string, options: SpeakOptions = {}): () => void {
	if (!speechSupported || !text.trim()) return () => {};

	const { voiceURI, pace = 'standard', volume = 1, onEnd } = options;

	window.speechSynthesis.cancel();

	const utterance = new SpeechSynthesisUtterance(text);
	utterance.rate = PACE_RATE[pace];
	utterance.volume = Math.min(1, Math.max(0, volume));
	utterance.pitch = 1.05; // a touch brighter — she is a friendly guide

	const voice = voiceURI
		? listVoices().find((v) => v.voiceURI === voiceURI)
		: undefined;
	if (voice) utterance.voice = voice;

	if (onEnd) utterance.addEventListener('end', onEnd);

	window.speechSynthesis.speak(utterance);

	return () => window.speechSynthesis.cancel();
}
