import { leveled, type Leveled } from '@/features/settings/readingLevel';
import { VOICE_SAMPLE } from '@/features/settings/constants';
import { getModuleProgress, isModuleLocked, modules } from './constants';
import type { Module } from './types';

/**
 * Everything Gracie says from fixed text, in one place.
 *
 * The city guide reads these at runtime, and `npm run voice` reads
 * {@link allGracieLines} to pre-generate her recorded voice. Any line built
 * here is therefore spoken with the recorded voice; text from elsewhere (chat
 * replies, lesson read-aloud) falls back to the browser's speech synthesiser.
 * After changing any wording here, run `npm run voice` to record it.
 */

// Short intro script. Each entry is one speech bubble, written per reading
// level; the user advances with the Continue button. Keep the tone warm — the
// city grows with the learner, it is never under threat.
export const SCRIPT: Leveled<string>[] = [
	leveled(
		"Hi, I'm Gracie! I'm here to show you around your city.",
		"Hi, I'm Gracie! I'm here to guide you through your Integrity City.",
		"Hi, I'm Gracie. I'll be your guide through Integrity City and its five districts.",
	),
	leveled(
		'Your city grows when you learn! Play the quizzes and games and watch it light up. Keep that health meter high!',
		'Your city grows every time you learn. Do well in the quizzes and games and watch it light up. Keep that health meter high!',
		'The city reflects your progress: every lesson and assessment you complete raises its health and brings its districts to life.',
	),
	leveled(
		"Tap any district and I'll show you what to learn there.",
		"Click on any city district and I'll guide you through each module.",
		'Select any district to open its module. I will brief you on what it covers.',
	),
];

export function idlePrompt(restore: boolean): string {
	return restore ? 'Click a district to restore it.' : 'Click a district to begin.';
}

/** Shown with the learner's name; spoken without it so it can be pre-recorded. */
export const SPOKEN_GREETING = 'Hi there!';

/** "Local Leaders & NGOs" → "local leaders and NGOs" (acronyms keep their case). */
function spokenAudience(audience: string): string {
	return audience
		.replace(/&/g, 'and')
		.split(' ')
		// Acronyms keep their case, plurals included ("NGOs").
		.map((w) => (/^[A-Z]{2,}s?$/.test(w) ? w : w.toLowerCase()))
		.join(' ');
}

/** Module descriptions open with a verb ("Discover…"), so they follow "It helps you". */
function lowerFirst(text: string): string {
	return text.charAt(0).toLowerCase() + text.slice(1);
}

function briefingIntro(module: Module): string {
	// Explain the module itself ("The Youth Led module is for young people and
	// communities…") rather than announcing it. No dashes: they read badly
	// aloud and in the bubble.
	return `The ${module.name} module is for ${spokenAudience(module.audience)}.`;
}

function aboutSentence(description: string): string {
	return `It helps you ${lowerFirst(description)}`;
}

/**
 * Progress in words rather than an exact number: easier to take in by ear, and
 * five recordings cover every percentage. The district card shows the number.
 */
const MILESTONES: { from: number; text: string }[] = [
	{ from: 100, text: "You've finished this module. Great work!" },
	{ from: 75, text: "You're nearly done." },
	{ from: 50, text: "You're halfway there." },
	{ from: 25, text: "You're about a quarter of the way through." },
	{ from: 0, text: "You're just getting started." },
];

export function progressSentence(percent: number): string {
	return (MILESTONES.find((m) => percent >= m.from) ?? MILESTONES[MILESTONES.length - 1]).text;
}

/** "What is Corruption?" keeps its own mark instead of gaining a full stop. */
function nextUpSentence(lessonTitle: string): string {
	const title = lessonTitle.trim();
	return /[.!?]$/.test(title) ? `Next up: ${title}` : `Next up: ${title}.`;
}

export const LOCKED_SENTENCE = 'This district is locked for now. Keep learning to open it.';

/**
 * What Gracie says about the district the user just clicked — the module's own
 * copy from constants.ts, plus where they left off if they have started it.
 */
export function moduleBriefing(module: Module, description: string): string {
	const intro = briefingIntro(module);
	if (isModuleLocked(module.id)) return `${intro} ${LOCKED_SENTENCE}`;

	const progress = getModuleProgress(module.id);
	if (!progress) return `${intro} ${aboutSentence(description)}`;

	const where = progressSentence(progress.percentComplete);
	if (progress.percentComplete >= 100) return `${intro} ${where}`;
	return `${intro} ${where} ${nextUpSentence(progress.currentLesson.title)}`;
}

const LEVELS = ['simple', 'standard', 'advanced'] as const;

/**
 * Every line (or sentence of one) Gracie can say from fixed text, at every
 * reading level, including each progress milestone and every lesson's
 * "Next up", so briefings stay recorded as the learner moves through a module.
 */
export function allGracieLines(): string[] {
	const lines = new Set<string>();
	const add = (text: string) => lines.add(text);

	for (const step of SCRIPT) for (const level of LEVELS) add(step[level]);
	add(idlePrompt(false));
	add(idlePrompt(true));
	add(SPOKEN_GREETING);
	add(VOICE_SAMPLE);

	for (const milestone of MILESTONES) add(milestone.text);
	add(LOCKED_SENTENCE);
	for (const module of modules) {
		add(briefingIntro(module));
		const description = module.description;
		if (typeof description === 'string') add(aboutSentence(description));
		else for (const level of LEVELS) add(aboutSentence(description[level]));
		for (const lesson of module.progress?.lessons ?? []) add(nextUpSentence(lesson.title));
	}
	return [...lines];
}
