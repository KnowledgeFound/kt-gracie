import { Outlet } from 'react-router-dom';

/**
 * Root layout shell.
 * Wrap shared chrome (nav bar, toasts, modals) here.
 * Each page controls its own background — this shell stays transparent.
 */
export default function RootLayout() {
	return <Outlet />;
}
