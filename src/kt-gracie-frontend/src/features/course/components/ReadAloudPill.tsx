import { useEffect, useState } from 'react';
import { Headphones, Square } from 'lucide-react';
import classnames from 'classnames';
import { useSettings, speak, stopSpeaking, speechSupported } from '@/features/settings';

interface ReadAloudPillProps {
	/** Plain text to read. Reading stops if it changes or the pill unmounts. */
	text: string;
}

/** Toggle that reads the lesson text aloud with the browser voice chosen in Settings. */
export default function ReadAloudPill({ text }: ReadAloudPillProps) {
	const { settings } = useSettings();
	const [reading, setReading] = useState(false);

	// A new section (or leaving the page) silences the reader.
	useEffect(() => {
		setReading(false);
		return () => stopSpeaking();
	}, [text]);

	if (!speechSupported || !text.trim()) return null;

	const toggle = () => {
		if (reading) {
			stopSpeaking();
			setReading(false);
			return;
		}
		setReading(true);
		speak(text, {
			voiceURI: settings.guide.voiceURI,
			pace: settings.guide.pace,
			volume: settings.guide.volume,
			onEnd: () => setReading(false),
		});
	};

	return (
		<button
			type="button"
			onClick={toggle}
			aria-pressed={reading}
			className={classnames(
				'inline-flex items-center gap-2 px-4 py-1.5 rounded-pill border text-sm font-medium transition-colors',
				reading
					? 'bg-brand-500 border-brand-500 text-white'
					: 'bg-gray-50 border-gray-200 text-ink-mid hover:bg-gray-100',
			)}
		>
			{reading ? <Square className="size-3.5 fill-current" /> : <Headphones className="size-4" />}
			{reading ? 'Stop reading' : 'Read aloud'}
		</button>
	);
}
