import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { useUser, CreateUserForm } from '@/features/auth';
import type { CreateUserInput } from '@/features/auth';
import { ArrowLeft } from 'lucide-react';
import gracieVideo from './animation-home/gracie-wave-in-ballon.mp4';

const fade = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -20 },
	transition: { duration: 0.3 },
};

export default function HomePage() {
	const navigate = useNavigate();
	const { createUser, user } = useUser();
	const [showForm, setShowForm] = useState(false);

	// Navigate to city once the user profile is ready in the global context
	useEffect(() => {
		if (user) {
			navigate('/city', { replace: true });
		}
	}, [user, navigate]);

	function handleCreate(input: CreateUserInput) {
		createUser(input);
	}

	return (
		<MainLayout>
			<div className="min-h-screen bg-white flex">
				{/* ── Left: auto-playing looping video ── */}
				<div className="w-1/2 flex items-center justify-end py-8 pl-8 pr-0 lg:pr-4">
					<div className="w-full h-full max-w-[600px] max-h-[600px] flex items-center justify-center">
						<video
							src={gracieVideo}
							autoPlay
							loop
							muted
							playsInline
							className="w-full h-full object-contain"
						/>
					</div>
				</div>

				{/* ── Right: buttons or create-profile form ── */}
				<div className="w-1/2 flex items-center justify-start py-8 pr-8 pl-0 lg:pl-4">
					<AnimatePresence mode="wait">
						{!showForm ? (
							<motion.div
								key="welcome"
								{...fade}
								className="flex flex-col items-center gap-8 max-w-md w-full"
							>
								<h1 className="text-3xl font-bold text-ink-deep text-center">
									Welcome to Integrity City
								</h1>
								<p className="text-ink-mid text-center text-base">
									Learn, explore, and protect your city from corruption.
								</p>

								{/* Get Started — blue button */}
								<button
									onClick={() => setShowForm(true)}
									className="w-full max-w-xs px-8 py-3 rounded-xl font-semibold text-lg text-white
									           bg-gradient-to-r from-brand-500 to-brand-600
									           shadow-md hover:shadow-lg hover:scale-[1.02]
									           transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
								>
									Get Started
								</button>

								{/* Already have an account — outlined blue */}
								<button
									onClick={() => setShowForm(true)}
									className="w-full max-w-xs px-8 py-3 rounded-xl font-semibold text-lg
									           text-brand-500 border-2 border-brand-500
									           hover:bg-brand-50 hover:scale-[1.02]
									           transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
								>
									Already have an account
								</button>
							</motion.div>
						) : (
							<motion.div
								key="create-form"
								{...fade}
								className="max-w-md w-full"
							>
								<div className="flex items-center gap-3 mb-6">
									<button
										onClick={() => setShowForm(false)}
										className="p-2 rounded-full hover:bg-brand-50 text-ink-muted hover:text-ink-deep transition-colors"
										aria-label="Go back"
									>
										<ArrowLeft className="w-5 h-5" />
									</button>
									<span className="text-sm text-ink-muted font-medium">
										Back
									</span>
								</div>
								<CreateUserForm onSubmit={handleCreate} />
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</MainLayout>
	);
}
