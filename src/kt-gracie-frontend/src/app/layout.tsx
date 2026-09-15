import { Outlet } from 'react-router-dom';
import { useOptionalUser } from '@/features/auth';
import { GracieChatLauncher, ModelSetupModal, useGracieAI } from '@/features/gracie-ai';
import { useSettings } from '@/features/settings';
import '@/features/gracie-ai/gracie-ai.css';

/**
 * Root layout shell.
 * Wrap shared chrome (nav bar, toasts, modals) here.
 * Each page controls its own background — this shell stays transparent.
 */
export default function RootLayout() {
	// Ask Gracie needs a learner to talk about, so it appears once there is a
	// profile rather than on the landing and sign-in screens. "Show Gracie" off
	// means she is not on screen at all, and that includes the chat.
	const user = useOptionalUser();
	const { settings } = useSettings();
	const { setupOpen, closeSetup } = useGracieAI();

	return (
		<>
			<Outlet />
			{user && settings.guide.visible && <GracieChatLauncher />}
			{/* One dialog for the whole app — opened from Settings or the chat. */}
			<ModelSetupModal open={setupOpen} onClose={closeSetup} />
		</>
	);
}
