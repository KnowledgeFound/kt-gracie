import type { Wllama } from '@wllama/wllama';
import type { ChatMessage } from './prompts';

/**
 * The on-device model, wrapped as a lazily-created singleton.
 *
 * LFM2-350M was picked over the alternatives on measurements taken in
 * `gracie-llm-lab`: fastest decode on the pure-WASM path that budget Android
 * devices are stuck on (75 tok/s, roughly three times Granite at the same
 * size), quickest to first token, and Apache 2.0. Pin the LFM2 generation —
 * LFM2.5 moved to a proprietary licence.
 */
export const MODEL = {
	label: 'LFM2-350M',
	repo: 'LiquidAI/LFM2-350M-GGUF',
	file: 'LFM2-350M-Q4_K_M.gguf',
	/** Approximate download, shown before the learner opts in. */
	approxMB: 229,
} as const;

export interface LoadProgress {
	loaded: number;
	total: number;
}

export interface GenerateResult {
	text: string;
	elapsedMs: number;
	tokensPerSecond: number | null;
}

let instance: Wllama | null = null;
let loading: Promise<void> | null = null;

/** Whether this browser could host the model at all. */
export function engineSupported(): boolean {
	return typeof WebAssembly === 'object' && typeof Worker === 'function';
}

export function engineLoaded(): boolean {
	return instance !== null && loading === null;
}

/**
 * Downloads (first run) and initialises the model. Safe to call repeatedly —
 * concurrent callers share the one in-flight load.
 */
export function loadEngine(onProgress?: (p: LoadProgress) => void): Promise<void> {
	if (instance && !loading) return Promise.resolve();
	if (loading) return loading;

	loading = (async () => {
		// Imported here rather than at module scope so Robot mode — the default —
		// never pays for the runtime it will not use. Splitting this out keeps
		// roughly 400KB of JavaScript out of the initial bundle.
		const [{ Wllama }, { default: wasmUrl }] = await Promise.all([
			import('@wllama/wllama'),
			import('@wllama/wllama/esm/wasm/wllama.wasm?url'),
		]);
		const wllama = new Wllama({ default: wasmUrl }, { parallelDownloads: 3 });
		await wllama.loadModelFromHF(
			{ repo: MODEL.repo, file: MODEL.file },
			{
				n_ctx: 2048,
				// Offload to WebGPU where it exists; 0 keeps it on the WASM path,
				// which is the only path a large share of the target fleet has.
				n_gpu_layers: wllama.isSupportWebGPU() ? 99 : 0,
				useCache: true,
				progressCallback: ({ loaded, total }) => onProgress?.({ loaded, total }),
			},
		);
		instance = wllama;
	})();

	try {
		return loading;
	} finally {
		loading.finally(() => {
			loading = null;
		});
	}
}

/** Frees the model and its memory. */
export async function unloadEngine(): Promise<void> {
	const current = instance;
	instance = null;
	await current?.exit().catch(() => {});
}

/**
 * Runs one completion.
 *
 * Note wllama's chat params expose no stop-sequence option, so context replay
 * is trimmed afterwards in `shape.ts` rather than prevented here.
 */
export async function generate(
	messages: ChatMessage[],
	opts: { maxTokens?: number; onToken?: (soFar: string) => void } = {},
): Promise<GenerateResult> {
	if (!instance) throw new Error('Gracie’s model is not loaded yet.');
	const { maxTokens = 80, onToken } = opts;

	const started = performance.now();
	let firstTokenAt: number | null = null;
	let tokens = 0;
	let text = '';

	await instance.createChatCompletion({
		messages,
		max_tokens: maxTokens,
		temperature: 0.3,
		stream: true,
		onData: (chunk) => {
			const delta = chunk?.choices?.[0]?.delta as
				| { content?: string; reasoning_content?: string }
				| undefined;
			const piece = delta?.content || delta?.reasoning_content || '';
			if (!piece) return;
			if (firstTokenAt === null) firstTokenAt = performance.now();
			tokens += 1;
			text += piece;
			onToken?.(text);
		},
	});

	const elapsedMs = performance.now() - started;
	const decodeMs = firstTokenAt === null ? 0 : performance.now() - firstTokenAt;
	return {
		text: text.trim(),
		elapsedMs,
		tokensPerSecond: tokens > 1 && decodeMs > 0 ? ((tokens - 1) / decodeMs) * 1000 : null,
	};
}
