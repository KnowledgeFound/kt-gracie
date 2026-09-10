import { ReactNode } from 'react';

interface MainLayoutProps {
	children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
	return (
		<main className="min-h-screen relative overflow-hidden">
			{children}
		</main>
	);
}
