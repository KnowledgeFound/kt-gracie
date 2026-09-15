import { AlertTriangle, Check, CloudDownload, Cpu, Loader2 } from 'lucide-react';
import { useGracieAI } from '../context';

/**
 * The model's state, in the learner's terms.
 *
 * Download size is stated before anything is fetched — a large part of the
 * intended audience is on metered data, and a silent 229MB pull would be a
 * poor way to introduce the feature.
 */
export default function ModelStatusCard() {
	const {
		status,
		download,
		error,
		modelLabel,
		approxMB,
		disable,
		openSetup,
		mode,
	} = useGracieAI();

	const pct = download?.ratio == null ? null : Math.round(download.ratio * 100);

	if (status === 'unsupported') {
		return (
			<div className="gracieModel gracieModel--warn">
				<AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
				<div>
					<p className="gracieModel__title">This browser can't run Gracie's brain</p>
					<p className="gracieModel__blurb">
						Intelligence mode needs WebAssembly. Robot mode still works everywhere.
					</p>
				</div>
			</div>
		);
	}

	if (status === 'error') {
		return (
			<div className="gracieModel gracieModel--warn">
				<AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
				<div className="min-w-0">
					<p className="gracieModel__title">Couldn't load the model</p>
					<p className="gracieModel__blurb">{error ?? 'Unknown error.'}</p>
					<button type="button" className="gracieModel__action" onClick={openSetup}>
						Try again
					</button>
				</div>
			</div>
		);
	}

	if (status === 'downloading' || status === 'loading') {
		return (
			<div className="gracieModel">
				<Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
				<div className="min-w-0 flex-1">
					<p className="gracieModel__title">
						{status === 'downloading'
							? `Downloading ${modelLabel}${pct === null ? '' : ` — ${pct}%`}`
							: `Starting ${modelLabel}`}
					</p>
					<p className="gracieModel__blurb">
						One-off, then it is cached on this device.
					</p>
					<div className="gracieModel__track" role="progressbar" aria-valuenow={pct ?? undefined}>
						<div
							className="gracieModel__fill"
							style={{ width: pct === null ? '35%' : `${pct}%` }}
						/>
					</div>
				</div>
			</div>
		);
	}

	if (status === 'ready' || status === 'generating') {
		return (
			<div className="gracieModel gracieModel--ok">
				<Check className="size-4 shrink-0" aria-hidden="true" />
				<div className="min-w-0 flex-1">
					<p className="gracieModel__title">{modelLabel} is running in this tab</p>
					<p className="gracieModel__blurb">Nothing you type leaves this device.</p>
				</div>
				<button type="button" className="gracieModel__action" onClick={() => void disable()}>
					Unload
				</button>
			</div>
		);
	}

	// idle
	return (
		<div className="gracieModel">
			<Cpu className="size-4 shrink-0" aria-hidden="true" />
			<div className="min-w-0 flex-1">
				<p className="gracieModel__title">
					{mode === 'robot' ? 'Robot mode' : `${modelLabel} not loaded yet`}
				</p>
				<p className="gracieModel__blurb">
					{mode === 'robot'
						? 'Gracie is using scripted replies. Switch to Intelligence mode in Settings for answers written on your device.'
						: `About ${approxMB} MB to download, once.`}
				</p>
			</div>
			{mode === 'intelligence' && (
				<button type="button" className="gracieModel__action" onClick={openSetup}>
					<CloudDownload className="size-3.5" aria-hidden="true" />
					Load
				</button>
			)}
		</div>
	);
}
