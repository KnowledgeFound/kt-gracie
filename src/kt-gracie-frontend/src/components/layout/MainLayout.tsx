import { GreetingBubbles } from '@/features/greeting';
import { ReactNode } from 'react';

interface MainLayoutProps {
	children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
	return (
		<main className="min-h-screen px-4 relative min-h-screen overflow-hidden">
			{/* Pixi background — pointer-events disabled so it doesn't block UI */}
			<div className="absolute inset-0 z-[1] pointer-events-none">
				<GreetingBubbles />
			</div>
			{/* <img src="/logo2.svg" alt="DFINITY logo" className="mb-6" /> */}
			<div className="relative z-[2]">
				{children}
			</div>
		</main>
	);
}
