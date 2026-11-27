#!/usr/bin/env node
/**
 * Records Gracie's voice: one clip per sentence of every fixed line she says.
 *
 *   npm run voice
 *
 * Lines come from `src/features/city/gracieLines.ts` (allGracieLines), split
 * with the same `splitSentences` the player uses. Clips are generated with
 * Kokoro (free, open-source, runs locally — no API key) and written to
 * `public/audio/gracie/` with a `manifest.json` the site reads at runtime.
 *
 * Incremental: only new or changed sentences are generated, and clips no
 * longer used are deleted. Change VOICE (or SPEED) to re-record everything.
 *
 * Env:
 *   GRACIE_VOICE_MODEL_DIR  folder holding onnx-community/Kokoro-82M-v1.0-ONNX
 *                           (otherwise the model, ~90 MB, is downloaded once)
 *   GRACIE_VOICE_FORCE=1    re-record every sentence
 *   GRACIE_VOICE_DRY=1      only list the sentences, generate nothing
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const VOICE = 'am_puck';
const SPEED = 1;
const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const VOICE_TAG = `kokoro:${VOICE}@${SPEED}`;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public/audio/gracie');
const manifestPath = path.join(outDir, 'manifest.json');

// ── 1. Collect sentences, using the app's own modules ─────────────────────────
const vite = await createServer({
	root,
	logLevel: 'error',
	server: { middlewareMode: true, hmr: false },
	appType: 'custom',
	optimizeDeps: { noDiscovery: true, include: [] },
});
let sentences;
try {
	const { allGracieLines } = await vite.ssrLoadModule('/src/features/city/gracieLines.ts');
	const { splitSentences } = await vite.ssrLoadModule('/src/features/settings/voiceClips.ts');
	sentences = [...new Set(allGracieLines().flatMap(splitSentences))];
} finally {
	await vite.close();
}
console.log(`${sentences.length} sentences to voice with ${VOICE_TAG}`);
if (process.env.GRACIE_VOICE_DRY === '1') {
	for (const sentence of sentences) console.log(`  ${sentence}`);
	process.exit(0);
}

// ── 2. Work out what is missing ───────────────────────────────────────────────
fs.mkdirSync(outDir, { recursive: true });
const previous = fs.existsSync(manifestPath)
	? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
	: { voice: null, clips: {} };
const canEncodeAac = (() => {
	try {
		// macOS ships afconvert; `-h` exits non-zero, so locate it instead.
		execFileSync('which', ['afconvert'], { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
})();
const ext = canEncodeAac ? 'm4a' : 'wav';

const fileFor = (sentence) =>
	createHash('sha1').update(`${VOICE_TAG}\n${sentence}`).digest('hex').slice(0, 12) + '.' + ext;

const force = process.env.GRACIE_VOICE_FORCE === '1';
const clips = {};
const todo = [];
for (const sentence of sentences) {
	const kept = previous.voice === VOICE_TAG && previous.clips[sentence];
	if (!force && kept && fs.existsSync(path.join(outDir, kept))) clips[sentence] = kept;
	else todo.push(sentence);
}

// ── 3. Generate ───────────────────────────────────────────────────────────────
if (todo.length > 0) {
	console.log(`recording ${todo.length} new or changed sentences…`);
	const { env } = await import('@huggingface/transformers');
	const modelDir = process.env.GRACIE_VOICE_MODEL_DIR;
	if (modelDir) {
		env.localModelPath = path.resolve(modelDir);
		env.allowRemoteModels = false;
	}
	const { KokoroTTS } = await import('kokoro-js');
	const tts = await KokoroTTS.from_pretrained(MODEL_ID, { dtype: 'q8', device: 'cpu' });

	for (const [i, sentence] of todo.entries()) {
		const file = fileFor(sentence);
		const target = path.join(outDir, file);
		const audio = await tts.generate(sentence, { voice: VOICE, speed: SPEED });
		if (canEncodeAac) {
			const wav = target.replace(/\.m4a$/, '.tmp.wav');
			await audio.save(wav);
			// AAC in an MP4 container: plays in every current browser, ~10x smaller than WAV.
			execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '64000', wav, target]);
			fs.unlinkSync(wav);
		} else {
			await audio.save(target);
		}
		clips[sentence] = file;
		console.log(`  [${i + 1}/${todo.length}] ${sentence}`);
	}
}

// ── 4. Write the manifest and drop clips nothing uses ─────────────────────────
const ordered = Object.fromEntries(Object.entries(clips).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(manifestPath, JSON.stringify({ voice: VOICE_TAG, clips: ordered }, null, '\t') + '\n');
const used = new Set(Object.values(clips));
let removed = 0;
for (const file of fs.readdirSync(outDir)) {
	if (file === 'manifest.json' || used.has(file)) continue;
	fs.unlinkSync(path.join(outDir, file));
	removed += 1;
}
console.log(
	`done: ${Object.keys(clips).length} clips (${todo.length} new, ${removed} removed) in public/audio/gracie/`,
);
