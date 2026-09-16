import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import GracieChat from './GracieChat';

/**
 * Floating entry point to the chat. Kept out of the city's own layers so it
 * survives whatever the Pixi scene is doing underneath.
 */
export default function GracieChatLauncher() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				className="gracieLauncher"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				aria-label={open ? 'Close Ask Gracie' : 'Ask Gracie'}
				title="Ask Gracie"
			>
				<MessageCircle className="size-5" aria-hidden="true" />
			</button>
			<GracieChat open={open} onClose={() => setOpen(false)} />
		</>
	);
}
