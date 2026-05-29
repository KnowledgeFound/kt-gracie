import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser, CreateUserForm } from '@/features/auth';
import type { CreateUserInput } from '@/features/auth';
import { MainLayout } from '@/components/layout';
import { ArrowLeft } from 'lucide-react';

const fade = {
	initial: { opacity: 0, y: 16 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -16 },
	transition: { duration: 0.25 },
};

export default function AuthPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, createUser } = useUser();

	// Where to send the user after profile creation.
	// ProtectedRoute passes the blocked path via location.state.from — fall back to /city.
	const from: string =
		(location.state as { from?: string } | null)?.from ?? '/city';

	// Already has a profile — skip straight to the destination
	useEffect(() => {
		if (user) navigate(from, { replace: true });
	}, [user, from, navigate]);

	function handleCreate(input: CreateUserInput) {
		createUser(input);
		// navigate happens via the useEffect above once user state updates
	}

	return (
		<MainLayout>
			<div className="h-full w-full">
				<AnimatePresence mode="wait">
					<motion.div
						key="create"
						{...fade}
						className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
					>
						<div className="max-w-lg flex justify-start items-start py-4 my-2 gap-3">
							<button
								onClick={() => navigate(-1)}
								className="p-2 rounded-full hover:bg-brand-100 text-ink-muted hover:text-ink-deep transition-colors"
								aria-label="Go back"
							>
								<ArrowLeft className="w-4 h-4" />
							</button>
						</div>
						<CreateUserForm onSubmit={handleCreate} />
					</motion.div>
				</AnimatePresence>
			</div>
		</MainLayout>
	);
}
