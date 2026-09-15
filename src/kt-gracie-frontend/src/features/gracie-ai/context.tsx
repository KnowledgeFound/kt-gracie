import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import { useSettings } from '@/features/settings';
import { askGracie } from './ask';
import { MODEL, engineLoaded, engineSupported, loadEngine, unloadEngine } from './engine';
import type { DownloadProgress, EngineStatus, GracieMode, GracieReply, LearnerFacts } from './types';

interface GracieAIContextValue {
	/** Which brain is selected in Settings. */
	mode: GracieMode;
	status: EngineStatus;
	/** Byte counts while downloading, else null. */
	download: DownloadProgress | null;
	error: string | null;
	modelLabel: string;
	approxMB: number;
	/** Pull the model down and initialise it. Safe to call twice. */
	enable: () => Promise<void>;
	/** Drop the model from memory and go back to Robot mode. */
	disable: () => Promise<void>;
	/** Whether the setup dialog is showing. Rendered by the app shell, opened
	 *  from Settings or from the chat, so there is only ever one of them. */
	setupOpen: boolean;
	openSetup: () => void;
	closeSetup: () => void;
	/** Answer one turn. Falls back to scripted copy whenever the model is not up. */
	ask: (
		question: string,
		facts: LearnerFacts,
		onToken?: (soFar: string) => void,
	) => Promise<GracieReply>;
}

const GracieAIContext = createContext<GracieAIContextValue | null>(null);

/**
 * Owns the on-device model's lifecycle for the whole app.
 *
 * Deliberately opt-in: nothing is downloaded until the learner turns
 * Intelligence mode on, because the weights are a ~229MB pull and a large part
 * of the intended audience is on metered data.
 */
export function GracieAIProvider({ children }: { children: ReactNode }) {
	const { settings } = useSettings();
	const mode = settings.ai.brain;

	const [status, setStatus] = useState<EngineStatus>(() =>
		engineSupported() ? 'idle' : 'unsupported',
	);
	const [download, setDownload] = useState<DownloadProgress | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [setupOpen, setSetupOpen] = useState(false);
	// Guards against a second enable() while one is already in flight.
	const enabling = useRef(false);

	const enable = useCallback(async () => {
		if (!engineSupported()) {
			setStatus('unsupported');
			return;
		}
		if (enabling.current || status === 'ready') return;
		enabling.current = true;
		setError(null);
		setStatus('downloading');
		try {
			await loadEngine(({ loaded, total }) => {
				const ratio = total ? loaded / total : null;
				setDownload({ loaded, total, ratio });
				// Weights are in; the runtime still has to bring them up.
				if (ratio !== null && ratio >= 1) setStatus('loading');
			});
			setDownload(null);
			setStatus('ready');
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
			setStatus('error');
		} finally {
			enabling.current = false;
		}
	}, [status]);

	const disable = useCallback(async () => {
		await unloadEngine();
		setDownload(null);
		setStatus(engineSupported() ? 'idle' : 'unsupported');
	}, []);

	// Follow the setting: switching to Robot frees the memory. Switching to
	// Intelligence explains itself first rather than silently pulling ~229MB —
	// unless the learner has asked for it to be ready up front.
	useEffect(() => {
		if (mode === 'robot') {
			setSetupOpen(false);
			void disable();
			return;
		}
		if (settings.ai.preload) {
			void enable();
			return;
		}
		if (!engineLoaded() && engineSupported()) setSetupOpen(true);
	}, [mode, settings.ai.preload, enable, disable]);

	const ask = useCallback(
		async (question: string, facts: LearnerFacts, onToken?: (soFar: string) => void) => {
			// Settings promises the model is "fetched the first time you ask her
			// something", so honour that here rather than quietly answering from
			// scripted copy. Failures fall through — askGracie degrades on its own.
			if (mode === 'intelligence' && !engineLoaded() && engineSupported()) {
				await enable().catch(() => {});
			}
			const generating = mode === 'intelligence' && engineLoaded();
			if (generating) setStatus('generating');
			try {
				return await askGracie(question, facts, { mode, onToken });
			} finally {
				if (generating) setStatus('ready');
			}
		},
		[mode, enable],
	);

	const value = useMemo<GracieAIContextValue>(
		() => ({
			mode,
			status,
			download,
			error,
			modelLabel: MODEL.label,
			approxMB: MODEL.approxMB,
			setupOpen,
			openSetup: () => setSetupOpen(true),
			closeSetup: () => setSetupOpen(false),
			enable,
			disable,
			ask,
		}),
		[mode, status, download, error, setupOpen, enable, disable, ask],
	);

	return <GracieAIContext.Provider value={value}>{children}</GracieAIContext.Provider>;
}

export function useGracieAI(): GracieAIContextValue {
	const ctx = useContext(GracieAIContext);
	if (!ctx) throw new Error('useGracieAI must be used inside <GracieAIProvider>');
	return ctx;
}
