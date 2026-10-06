/**
 * Layer B — the shipped pipeline, end to end.
 *
 * Drives the real modules through the real runtime: Vite serves
 * `src/features/gracie-ai/*` to a real Chromium, wllama loads the real
 * LFM2-350M GGUF, and every probe goes through the real `askGracie()` —
 * classify, guard or template, generate, shape. Nothing is re-implemented
 * here, so a change to the safety layer changes these numbers.
 *
 * It calls askGracie() rather than typing into the chat box. Same function the
 * chat calls with the same arguments (GracieChat.tsx: `ask(trimmed, facts,
 * onToken)`), minus several minutes per probe of UI animation. The one thing
 * this skips is rendering, which e2e/gracie-ai.spec.ts already covers.
 *
 * The browser profile is persistent so the 229 MB download happens once.
 *
 *   npm run start                       # in another terminal
 *   node safety/run-pipeline.mjs [--samples 2] [--headed]
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { loadCorpus, FACTS } from './lib/corpus.mjs';
import { scoreReply, tally, pct } from './lib/score.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (n, d) => {
	const i = process.argv.indexOf(`--${n}`);
	return i > -1 ? process.argv[i + 1] : d;
};
const SAMPLES = Number(arg('samples', 2));
const BASE = arg('base', 'http://localhost:3000');
const PROFILE = join(HERE, '.browser-profile');
const OUT = arg('json', join(HERE, '..', '..', '..', 'docs', 'ai-safety', 'results', 'layer-b-pipeline.json'));

const { probes } = loadCorpus();

const ctx = await chromium.launchPersistentContext(PROFILE, {
	headless: !process.argv.includes('--headed'),
	viewport: { width: 1280, height: 900 },
	// wllama wants cross-origin isolation for its threaded build; vite.config.js
	// sets COOP/COEP, and these flags keep headless from second-guessing it.
	args: ['--enable-features=SharedArrayBuffer'],
});

const page = ctx.pages()[0] ?? (await ctx.newPage());
page.on('console', (m) => {
	if (m.type() === 'error') console.error('  [page error]', m.text().slice(0, 160));
});

console.log(`\nLayer B — shipped pipeline.  ${probes.length} probes x ${SAMPLES} samples\n`);
await page.goto(BASE, { waitUntil: 'domcontentloaded' });

// Load the model once, through the app's own engine module.
process.stdout.write('  loading LFM2-350M (229 MB on a cold profile) ');
const load = await page.evaluate(async (base) => {
	const t0 = performance.now();
	const engine = await import(`${base}/src/features/gracie-ai/engine.ts`);
	let last = 0;
	await engine.loadEngine(({ loaded, total }) => {
		last = total ? Math.round((loaded / total) * 100) : 0;
	});
	globalThis.__gracieAsk = (await import(`${base}/src/features/gracie-ai/ask.ts`)).askGracie;
	return { ms: Math.round(performance.now() - t0), percent: last, model: engine.MODEL };
}, BASE);
console.log(`— ready in ${(load.ms / 1000).toFixed(1)}s (${load.model.label})\n`);

const results = [];
const started = Date.now();
let done = 0;
const totalRuns = probes.length * SAMPLES;

for (const probe of probes) {
	for (let s = 0; s < SAMPLES; s++) {
		let out = null;
		let error = null;
		try {
			out = await page.evaluate(
				async ({ turns, facts }) => {
					// Replayed exactly as the chat does it: one call per turn, no
					// history — askGracie takes none.
					const replies = [];
					for (const t of turns) replies.push(await globalThis.__gracieAsk(t, facts, { mode: 'intelligence' }));
					return replies;
				},
				{ turns: probe.turns, facts: FACTS },
			);
		} catch (e) {
			error = String(e.message ?? e).slice(0, 300);
		}

		const final = out?.[out.length - 1];
		results.push({
			...scoreReply(probe, final?.text ?? '', final?.route ?? 'error'),
			sample: s,
			ask: probe.ask,
			source: final?.source ?? null,
			elapsedMs: final?.elapsedMs ?? null,
			tokensPerSecond: final?.tokensPerSecond ?? null,
			perTurn: probe.multiTurn ? out?.map((r) => ({ route: r.route, text: r.text })) : undefined,
			error,
		});

		done++;
		if (done % 10 === 0 || done === totalRuns) {
			const rate = done / ((Date.now() - started) / 1000);
			process.stdout.write(`\r  ${done}/${totalRuns}  ${rate.toFixed(1)}/s  eta ${Math.round((totalRuns - done) / rate)}s   `);
		}
	}
}
process.stdout.write('\n\n');
await ctx.close();

const RANK = { attack: 0, stonewall: 1, engaged: 2, overblock: 3, uncertain: 4, safe: 5 };
const worst = probes.map((p) => {
	const set = results.filter((r) => r.id === p.id);
	return set.slice().sort((a, b) => RANK[a.outcome] - RANK[b.outcome])[0];
});

const refuse = worst.filter((r) => r.expect === 'refuse');
const answer = worst.filter((r) => r.expect === 'answer');
const ground = worst.filter((r) => r.expect === 'ground');
const nonRefusal = refuse.filter((r) => r.outcome === 'attack' || r.outcome === 'engaged');
const generated = results.filter((r) => r.source === 'model' || r.source === 'blended');

const bySource = ['guard', 'data', 'scripted', 'blended', 'model'].map((s) => ({
	source: s,
	replies: results.filter((r) => r.source === s).length,
}));

const speeds = generated.map((r) => r.tokensPerSecond).filter(Boolean).sort((a, b) => a - b);
const latencies = generated.map((r) => r.elapsedMs).filter(Boolean).sort((a, b) => a - b);
const median = (a) => (a.length ? a[Math.floor(a.length / 2)] : null);

const summary = {
	generated: new Date().toISOString(),
	layer: 'B — shipped pipeline (classify + guard/template + model + shape)',
	model: load.model,
	modelLoadMs: load.ms,
	samples: SAMPLES,
	probes: probes.length,
	...tally(worst),
	mustRefuse: refuse.length,
	refused: refuse.filter((r) => r.outcome === 'safe').length,
	nonRefusal: nonRefusal.length,
	nonRefusalRate: pct(nonRefusal.length, refuse.length),
	harmfulContent: refuse.filter((r) => r.outcome === 'attack').length,
	harmfulContentRate: pct(refuse.filter((r) => r.outcome === 'attack').length, refuse.length),
	mustAnswer: answer.length,
	overBlocked: answer.filter((r) => r.outcome === 'overblock').length,
	overBlockRate: pct(answer.filter((r) => r.outcome === 'overblock').length, answer.length),
	groundingProbes: ground.length,
	emittedFigures: ground.filter((r) => r.figures?.length).length,
	stonewalled: worst.filter((r) => r.outcome === 'stonewall').length,
	bySource,
	medianTokensPerSecond: median(speeds),
	medianReplyMs: median(latencies),
	elapsedSeconds: Math.round((Date.now() - started) / 1000),
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ summary, worst, results }, null, '\t'));

const line = (l, v) => console.log(`  ${l.padEnd(30)} ${v}`);
line('Must refuse', summary.mustRefuse);
line('  refused', summary.refused);
line('  answered anyway', `${summary.nonRefusal}  (${summary.nonRefusalRate})`);
line('  harmful content', `${summary.harmfulContent}  (${summary.harmfulContentRate})`);
line('Must answer', summary.mustAnswer);
line('  over-blocked', `${summary.overBlocked}  (${summary.overBlockRate})`);
line('Grounding probes', summary.groundingProbes);
line('  emitted a figure', summary.emittedFigures);
line('Stonewalled', summary.stonewalled);
line('Median decode', `${summary.medianTokensPerSecond?.toFixed(1)} tok/s`);
line('Median reply', `${summary.medianReplyMs?.toFixed(0)} ms`);
console.log(`\n  ${summary.elapsedSeconds}s · written to ${OUT}\n`);
