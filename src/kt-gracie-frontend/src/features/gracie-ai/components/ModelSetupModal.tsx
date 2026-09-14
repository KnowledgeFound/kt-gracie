import { useEffect } from 'react';
import { AlertTriangle, Check, Cpu, Download, Loader2, ShieldCheck, WifiOff, X } from 'lucide-react';
import { useGracieAI } from '../context';

const mb = (bytes: number) => `${(bytes / 1e6).toFixed(0)} MB`;

/**
 * The setup flow for Intelligence mode.
 *
 * A ~229MB download deserves more than a spinner: the learner is told what it
 * is, what it costs and where it runs *before* anything is fetched, then gets
 * real byte progress, and can close the dialog and carry on while it finishes.
 */
export default function ModelSetupModal({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const { status, download, error, modelLabel, approxMB, enable, disable } = useGracieAI();

	// Esc closes, like the other dialogs in the app.
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, onClose]);

	if (!open) return null;

	const pct = download?.ratio == null ? null : Math.round(download.ratio * 100);
	const step =
		status === 'downloading' ? 1 : status === 'loading' ? 2 : status === 'ready' || status === 'generating' ? 3 : 0;

	return (
		<div className="gracieSetup" role="dialog" aria-modal="true" aria-label="Set up Gracie's brain">
			<div className="gracieSetup__scrim" onClick={onClose} aria-hidden="true" />
			<div className="gracieSetup__card">
				<button type="button" className="gracieSetup__close" onClick={onClose} aria-label="Close">
					<X className="size-4" />
				</button>

				{/* ── Not started ─────────────────────────────────────────────── */}
				{step === 0 && status !== 'error' && status !== 'unsupported' && (
					<>
						<div className="gracieSetup__icon"><Cpu className="size-6" /></div>
						<h2 className="gracieSetup__title">Give Gracie her own brain</h2>
						<p className="gracieSetup__blurb">
							Intelligence mode downloads a small language model and runs it inside this
							browser tab, so Gracie can answer in her own words instead of reading from a
							script.
						</p>

						<ul className="gracieSetup__facts">
							<li>
								<Download className="size-4" aria-hidden="true" />
								<span>
									<strong>About {approxMB} MB, once.</strong> It is cached on this device
									afterwards, so it only downloads again if you clear your browser data.
								</span>
							</li>
							<li>
								<ShieldCheck className="size-4" aria-hidden="true" />
								<span>
									<strong>Nothing you type leaves your device.</strong> Your questions and
									your progress are never uploaded.
								</span>
							</li>
							<li>
								<WifiOff className="size-4" aria-hidden="true" />
								<span>
									<strong>Works offline afterwards.</strong> Once it is downloaded, Gracie
									answers with no connection at all.
								</span>
							</li>
						</ul>

						<div className="gracieSetup__actions">
							<button type="button" className="gracieSetup__ghost" onClick={onClose}>
								Not now
							</button>
							<button type="button" className="gracieSetup__primary" onClick={() => void enable()}>
								<Download className="size-4" aria-hidden="true" />
								Download {modelLabel}
							</button>
						</div>
						<p className="gracieSetup__fine">
							On a slow or metered connection you may prefer Robot mode, which needs no
							download at all.
						</p>
					</>
				)}

				{/* ── In progress ─────────────────────────────────────────────── */}
				{(step === 1 || step === 2) && (
					<>
						<div className="gracieSetup__icon"><Loader2 className="size-6 animate-spin" /></div>
						<h2 className="gracieSetup__title">
							{step === 1 ? 'Downloading Gracie’s brain' : 'Starting her up'}
						</h2>
						<p className="gracieSetup__blurb">
							{step === 1
								? 'You can close this and keep using the app — it will keep going in the background.'
								: 'Almost there. The model is unpacking into memory.'}
						</p>

						<div className="gracieSetup__track" role="progressbar" aria-valuenow={pct ?? undefined} aria-valuemin={0} aria-valuemax={100}>
							<div
								className={`gracieSetup__bar${pct === null ? ' gracieSetup__bar--indeterminate' : ''}`}
								style={pct === null ? undefined : { width: `${pct}%` }}
							/>
						</div>
						<p className="gracieSetup__count">
							{step === 2
								? 'Loading into memory…'
								: download && download.total
								? `${mb(download.loaded)} of ${mb(download.total)}${pct === null ? '' : ` · ${pct}%`}`
								: 'Starting download…'}
						</p>

						<ol className="gracieSetup__steps">
							<li className={step >= 1 ? 'is-done' : ''}>Download</li>
							<li className={step >= 2 ? 'is-active' : ''}>Start up</li>
							<li>Ready</li>
						</ol>

						<div className="gracieSetup__actions">
							<button type="button" className="gracieSetup__ghost" onClick={onClose}>
								Continue in background
							</button>
						</div>
					</>
				)}

				{/* ── Ready ───────────────────────────────────────────────────── */}
				{step === 3 && (
					<>
						<div className="gracieSetup__icon gracieSetup__icon--ok"><Check className="size-6" /></div>
						<h2 className="gracieSetup__title">Gracie is ready</h2>
						<p className="gracieSetup__blurb">
							{modelLabel} is running in this tab. Ask her about your progress, your city, or
							anything in the course material.
						</p>
						<div className="gracieSetup__actions">
							<button
								type="button"
								className="gracieSetup__ghost"
								onClick={() => void disable()}
							>
								Unload
							</button>
							<button type="button" className="gracieSetup__primary" onClick={onClose}>
								Start asking
							</button>
						</div>
					</>
				)}

				{/* ── Problems ────────────────────────────────────────────────── */}
				{status === 'error' && (
					<>
						<div className="gracieSetup__icon gracieSetup__icon--warn"><AlertTriangle className="size-6" /></div>
						<h2 className="gracieSetup__title">The download didn’t finish</h2>
						<p className="gracieSetup__blurb">
							{error ?? 'Something interrupted it.'} Your connection may have dropped, or the
							device may have run out of room.
						</p>
						<div className="gracieSetup__actions">
							<button type="button" className="gracieSetup__ghost" onClick={onClose}>
								Stay in Robot mode
							</button>
							<button type="button" className="gracieSetup__primary" onClick={() => void enable()}>
								Try again
							</button>
						</div>
					</>
				)}

				{status === 'unsupported' && (
					<>
						<div className="gracieSetup__icon gracieSetup__icon--warn"><AlertTriangle className="size-6" /></div>
						<h2 className="gracieSetup__title">This browser can’t run it</h2>
						<p className="gracieSetup__blurb">
							Intelligence mode needs WebAssembly, which this browser does not offer. Robot
							mode works everywhere and needs no download.
						</p>
						<div className="gracieSetup__actions">
							<button type="button" className="gracieSetup__primary" onClick={onClose}>
								Continue in Robot mode
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
