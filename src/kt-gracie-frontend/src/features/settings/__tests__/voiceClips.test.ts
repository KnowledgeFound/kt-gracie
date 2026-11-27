import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** Minimal HTMLAudioElement: records what played and lets tests end clips. */
class FakeAudio {
	static played: string[] = [];
	static live: FakeAudio[] = [];
	onended: (() => void) | null = null;
	onerror: (() => void) | null = null;
	preload = '';
	volume = 1;
	playbackRate = 1;
	paused = true;
	constructor(public src: string) {}
	play() {
		this.paused = false;
		FakeAudio.played.push(this.src);
		FakeAudio.live.push(this);
		return Promise.resolve();
	}
	pause() {
		this.paused = true;
	}
	/** The clip reaching its end. */
	end() {
		this.onended?.();
	}
}

const MANIFEST = {
	voice: 'kokoro:test',
	clips: {
		'Hi there!': 'a.m4a',
		'Click a district to begin.': 'b.m4a',
	},
};

let mod: typeof import('../voiceClips');
let speech: typeof import('../speech');

beforeEach(async () => {
	FakeAudio.played = [];
	FakeAudio.live = [];
	vi.stubGlobal('Audio', FakeAudio);
	vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false })));
	vi.resetModules();
	mod = await import('../voiceClips');
	speech = await import('../speech');
	mod.setClipManifest(MANIFEST);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

const lastClip = () => FakeAudio.live[FakeAudio.live.length - 1];

describe('splitSentences', () => {
	it('splits on sentence ends and keeps punctuation', () => {
		expect(mod.splitSentences("Hi there!  Click a district to begin.")).toEqual([
			'Hi there!',
			'Click a district to begin.',
		]);
		expect(mod.splitSentences('Next up: What is Corruption?.')).toEqual([
			'Next up: What is Corruption?.',
		]);
		expect(mod.splitSentences('no full stop')).toEqual(['no full stop']);
	});
});

describe('clipsFor', () => {
	it('returns a clip per sentence when every sentence is recorded', () => {
		expect(mod.clipsFor('Hi there! Click a district to begin.')).toEqual([
			'/audio/gracie/a.m4a',
			'/audio/gracie/b.m4a',
		]);
	});

	it('returns null if any sentence is missing, so voices never mix', () => {
		expect(mod.clipsFor('Hi lynn! Click a district to begin.')).toBeNull();
	});
});

describe('speak with recordings', () => {
	it('plays the clips in order and reports the end once', async () => {
		const onEnd = vi.fn();
		speech.speak('Hi there! Click a district to begin.', { onEnd, pace: 'brisk', volume: 0.5 });
		await Promise.resolve();
		expect(FakeAudio.played).toEqual(['/audio/gracie/a.m4a']);
		expect(lastClip().volume).toBe(0.5);
		expect(lastClip().playbackRate).toBeGreaterThan(1);

		lastClip().end();
		expect(FakeAudio.played).toEqual(['/audio/gracie/a.m4a', '/audio/gracie/b.m4a']);
		expect(onEnd).not.toHaveBeenCalled();

		lastClip().end();
		expect(onEnd).toHaveBeenCalledTimes(1);
	});

	it('a new line stops the one playing', () => {
		const first = vi.fn();
		speech.speak('Hi there!', { onEnd: first });
		const clip = lastClip();
		speech.speak('Click a district to begin.');
		expect(clip.paused).toBe(true);
		clip.end(); // a stale end event must not report the old line
		expect(first).not.toHaveBeenCalled();
		expect(FakeAudio.played).toEqual(['/audio/gracie/a.m4a', '/audio/gracie/b.m4a']);
	});

	it('stopSpeaking silences the clips', () => {
		speech.speak('Hi there!');
		const clip = lastClip();
		speech.stopSpeaking();
		expect(clip.paused).toBe(true);
	});

	it('uses the browser voice when the user picked one', () => {
		speech.speak('Hi there!', { voiceURI: 'some-voice' });
		expect(FakeAudio.played).toEqual([]);
	});

	it('uses the browser voice for unrecorded text', () => {
		speech.speak('Something nobody recorded.');
		expect(FakeAudio.played).toEqual([]);
	});
});
