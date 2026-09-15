/**
 * Output shaping.
 *
 * Small models will not reliably obey "at most two sentences" — they comply
 * roughly six times in ten, and the overrun is exactly where invented numbers
 * appear. Truncating in code is cheaper and more reliable than bargaining with
 * the prompt, so the length rule is enforced here rather than asked for there.
 */

const LABEL = /^\s*(gracie|assistant|answer|reply)\s*:\s*/i;
/** Lines where the model has started replaying its own context back at us. */
const REPLAY = /^\s*(learner|city score|modules finished|modules still to do|band)\s*:/i;
/** Reasoning models sometimes narrate without <think> tags. */
const PREAMBLE = /^(okay|alright|ok|hmm|sure)[,.!]?\s+/i;
const META = /^(let(?:'s| us) see|first,?|i need to|the user (?:wants|is asking)|we need to)\b[^.!?]*[.!?]\s*/gi;

/** The model restating its brief instead of speaking to the learner. */
const INSTRUCTION =
	/\b(congratulate|encourage|remind (?:him|her|them)|tell (?:him|her|them)|point (?:him|her|them)|write (?:only|one))\b/i;
/** Anything that characterises the score — the app's job, not the model's. */
const CLAIMS =
	/\b(\d+|score|band|ghost town|struggling|developing town|utopia|strongest|weakest|percent|%|out of|module[s]? (?:left|to go|remaining))\b/i;

const isFragment = (s: string) => s.replace(/[^a-z ]/gi, '').trim().split(/\s+/).length < 4;

export interface ShapeOptions {
	name?: string;
	maxSentences?: number;
	/** Any figure not in this list is dropped with its sentence. */
	allowedNums?: number[];
}

export function shapeReply(raw: string, opts: ShapeOptions = {}): string {
	const { name, maxSentences = 2, allowedNums } = opts;
	let t = (raw ?? '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
	t = t.replace(LABEL, '').replace(PREAMBLE, '').replace(META, '');

	// Drop everything from the first replayed-context line onward.
	const kept: string[] = [];
	for (const line of t.split('\n')) {
		if (REPLAY.test(line)) break;
		kept.push(line);
	}
	t = kept.join(' ').replace(/\s+/g, ' ').trim();

	let parts = t.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 2);

	// A learner must never be shown a statistic the app cannot account for.
	if (allowedNums) {
		parts = parts.filter((p) =>
			(p.match(/\d+/g) ?? []).map(Number).every((n) => allowedNums.includes(n)),
		);
	}
	t = parts.slice(0, maxSentences).join(' ').trim();

	// A truncated trailing fragment reads worse than no fragment.
	if (t && !/[.!?]$/.test(t)) {
		const cut = t.lastIndexOf(',');
		t = cut > 30 ? `${t.slice(0, cut)}.` : `${t}.`;
	}

	if (t && name) {
		const opening = t.split(/\s+/).slice(0, 5).join(' ');
		if (!new RegExp(`\\b${name}\\b`, 'i').test(opening)) {
			t = `${name}, ${t[0].toLowerCase()}${t.slice(1)}`;
		}
	}
	return t;
}

/**
 * Validates the model's closing clause for a blended reply. Returns null when
 * it strayed into stating facts, restating its brief, or produced a fragment —
 * the caller then falls back to scripted copy.
 */
export function usableNudge(raw: string, name: string): string | null {
	let s = shapeReply(raw, { maxSentences: 1 });
	s = s
		.replace(new RegExp(`^${name},?\\s*`, 'i'), '')
		.replace(new RegExp(`,?\\s*${name}!?$`, 'i'), '')
		.trim();
	if (!s || CLAIMS.test(s) || INSTRUCTION.test(s) || isFragment(s)) return null;
	s = s[0].toUpperCase() + s.slice(1);
	if (!/[.!?]$/.test(s)) s += '.';
	return s;
}
