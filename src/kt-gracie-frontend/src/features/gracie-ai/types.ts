/**
 * Which of the two Gracie brains is answering.
 *
 *  - `robot`        — scripted replies only. No model, no download. The default,
 *                     and the only mode offered on devices that cannot host one.
 *  - `intelligence` — a small language model runs in this browser tab and writes
 *                     Gracie's wording. Nothing leaves the device.
 *
 * See issue #50 (AI Gracie Phase 1).
 */
export type GracieMode = 'robot' | 'intelligence';

/** Lifecycle of the on-device model. */
export type EngineStatus =
	| 'idle'          // nothing loaded, nothing asked for
	| 'downloading'   // fetching weights (first run only, then cached)
	| 'loading'       // weights in hand, initialising the runtime
	| 'ready'
	| 'generating'
	| 'unsupported'   // this browser cannot run it at all
	| 'error';

/**
 * How a reply was produced. Shown to the learner, because "the model wrote
 * this" and "your own saved data says this" are very different claims.
 */
export type ReplySource =
	/** Refused before the model was consulted. */
	| 'guard'
	/** Read straight from stored learner data — no model involved. */
	| 'data'
	/** Facts from stored data, closing encouragement written on-device. */
	| 'blended'
	/** Written on-device by the model. */
	| 'model'
	/** Scripted copy, used in robot mode and as the fallback everywhere. */
	| 'scripted';

/** Byte counts for the one-off weight download. */
export interface DownloadProgress {
	loaded: number;
	total: number;
	/** 0–1, or null when the total is not known yet. */
	ratio: number | null;
}

/** The learner state Gracie is allowed to talk about. */
export interface LearnerFacts {
	name: string;
	/** City Score, 0–100. */
	score: number;
	/** Band name for {@link score} — see `tiers.ts`. */
	band: string;
	modulesDone: number;
	modulesTotal: number;
	tokens: number;
	/** Set when the learner has just finished an assessment. */
	quizScore?: number;
	quizTotal?: number;
	/** Set when tokens were just awarded. */
	tokensJustEarned?: number;
	/** Where they left off, for a returning learner. */
	lastModule?: string;
	/** Subject currently being studied. */
	subject?: string;
}

/** Everything the UI needs to render one Gracie turn. */
export interface GracieReply {
	text: string;
	source: ReplySource;
	/** Which classifier branch fired — useful in the debug strip. */
	route: string;
	/** Wall-clock ms for the model call, when there was one. */
	elapsedMs?: number;
	/** Decode throughput, when the model was used. */
	tokensPerSecond?: number;
}

export interface ChatTurn extends GracieReply {
	id: string;
	/** What the learner typed or which event triggered this. */
	ask: string;
	at: number;
}
