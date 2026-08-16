import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Gracie is interrupted constantly — the user clicks the next district, or
 * Continue, while she is still mid-sentence. These tests drive a fake synthesiser
 * that reproduces Chromium's behaviour in that exact case: a `speak()` issued
 * while the engine is still tearing down a cancelled utterance is accepted and
 * then silently dropped, and `speaking` stays stuck on afterwards.
 */

interface FakeUtterance {
	text: string;
	rate: number;
	volume: number;
	pitch: number;
	voice?: unknown;
	listeners: Record<string, Array<() => void>>;
	addEventListener(type: string, fn: () => void): void;
	dispatch(type: string): void;
}

class FakeSynth {
	speaking = false;
	pending = false;
	paused = false;
	/** Utterances the engine actually started saying, in order. */
	spoken: FakeUtterance[] = [];
	/** Every utterance handed to `speak()`, dropped ones included. */
	queued: FakeUtterance[] = [];
	/** Chromium's bug: swallow the next N `speak()` calls after a cancel. */
	swallow = 0;
	private live: FakeUtterance | null = null;

	speak(u: FakeUtterance) {
		this.queued.push(u);
		if (this.swallow > 0) {
			this.swallow -= 1;
			this.pending = true; // accepted, queued, never spoken
			return;
		}
		this.live = u;
		this.speaking = true;
		this.pending = false;
		this.spoken.push(u);
		u.dispatch('start');
	}

	cancel() {
		const dying = this.live;
		this.live = null;
		this.pending = false;
		if (dying) {
			// Tearing down a live utterance is what breaks Chromium: `speaking`
			// stays true and the next `speak()` is swallowed.
			this.swallow += 1;
			dying.dispatch('error');
		}
	}

	pause() {
		this.paused = true;
	}

	resume() {
		this.paused = false;
	}

	getVoices() {
		return [];
	}

	/** The engine finishing a line on its own. */
	finish() {
		const done = this.live;
		this.live = null;
		this.speaking = false;
		done?.dispatch('end');
	}

	/** Clears the stuck flag, as the engine eventually does. */
	settle() {
		this.speaking = this.live !== null;
	}
}

function fakeUtteranceClass() {
	return class implements FakeUtterance {
		rate = 1;
		volume = 1;
		pitch = 1;
		listeners: Record<string, Array<() => void>> = {};
		constructor(public text: string) {}
		addEventListener(type: string, fn: () => void) {
			(this.listeners[type] ??= []).push(fn);
		}
		dispatch(type: string) {
			for (const fn of this.listeners[type] ?? []) fn();
		}
	};
}

let synth: FakeSynth;
let speak: typeof import('../speech').speak;
let stopSpeaking: typeof import('../speech').stopSpeaking;

beforeEach(async () => {
	vi.useFakeTimers();
	synth = new FakeSynth();
	vi.stubGlobal('speechSynthesis', synth);
	Object.defineProperty(window, 'speechSynthesis', {
		value: synth,
		configurable: true,
	});
	Object.defineProperty(window, 'SpeechSynthesisUtterance', {
		value: fakeUtteranceClass(),
		configurable: true,
	});
	vi.stubGlobal('SpeechSynthesisUtterance', fakeUtteranceClass());

	vi.resetModules();
	const mod = await import('../speech');
	speak = mod.speak;
	stopSpeaking = mod.stopSpeaking;
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

const texts = () => synth.spoken.map((u) => u.text);

describe('speak', () => {
	it('says the line', () => {
		speak('first');
		vi.advanceTimersByTime(1000);
		expect(texts()).toEqual(['first']);
	});

	it('says a new line that interrupts an unfinished one', () => {
		const stop = speak('first');
		vi.advanceTimersByTime(1000);
		expect(texts()).toEqual(['first']);

		// React's order when the message changes mid-sentence: clean up the old
		// effect, then run the new one.
		stop();
		speak('second');
		vi.advanceTimersByTime(2000);

		expect(texts()).toEqual(['first', 'second']);
	});

	it('says every line through a run of interruptions', () => {
		const lines = ['one', 'two', 'three', 'four'];
		let stop = () => {};
		for (const line of lines) {
			stop();
			stop = speak(line);
			vi.advanceTimersByTime(2000); // watchdog retries get a chance to land
		}
		expect(texts()).toEqual(lines);
	});

	it('retries a line the engine drops without a word', () => {
		synth.swallow = 2; // first two attempts vanish
		speak('stubborn');
		vi.advanceTimersByTime(2000);

		expect(synth.queued.length).toBeGreaterThan(1);
		expect(texts()).toEqual(['stubborn']);
	});

	it('gives up rather than retrying forever', () => {
		synth.swallow = 99;
		speak('never');
		vi.advanceTimersByTime(60_000);

		expect(texts()).toEqual([]);
		expect(synth.queued.length).toBeLessThanOrEqual(4);
	});

	it('does not report the interrupted line as finished', () => {
		const onEnd = vi.fn();
		const stop = speak('first', { onEnd });
		vi.advanceTimersByTime(1000);

		stop();
		speak('second');
		vi.advanceTimersByTime(2000);

		expect(onEnd).not.toHaveBeenCalled();
	});

	it('reports the line that actually finishes, retries included', () => {
		const onEnd = vi.fn();
		synth.swallow = 1;
		speak('line', { onEnd });
		vi.advanceTimersByTime(2000);
		expect(onEnd).not.toHaveBeenCalled();

		synth.finish();
		expect(onEnd).toHaveBeenCalledTimes(1);
	});

	it('a stale canceller cannot mute the line that replaced it', () => {
		const stale = speak('first');
		vi.advanceTimersByTime(1000);

		speak('second'); // takes over without the old cleanup having run
		stale(); // ...which arrives late
		vi.advanceTimersByTime(2000);

		expect(texts()).toEqual(['first', 'second']);
		expect(synth.speaking).toBe(true);
	});

	it('stopSpeaking silences the current line', () => {
		speak('first');
		vi.advanceTimersByTime(1000);
		stopSpeaking();
		vi.advanceTimersByTime(2000);

		expect(texts()).toEqual(['first']);
		expect(synth.pending).toBe(false);
	});

	it('ignores empty text', () => {
		speak('   ');
		vi.advanceTimersByTime(1000);
		expect(synth.queued).toEqual([]);
	});
});
