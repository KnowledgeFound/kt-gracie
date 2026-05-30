import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, User, LogOut, Home, BookOpen } from 'lucide-react';
import { useUser } from '@/features/auth';

// ─── Menu items ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
	{ icon: Home,     label: 'City',        path: '/city' },
	{ icon: BookOpen, label: 'Subjects',     path: '/subjects' },
	{ icon: Trophy,   label: 'Leaderboard',  path: '/leaderboard' },
	{ icon: User,     label: 'Profile',      path: '/profile' },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface DrawerMenuProps {
	open: boolean;
	onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DrawerMenu({ open, onClose }: DrawerMenuProps) {
	const navigate = useNavigate();
	const { user, deleteUser } = useUser();

	function handleNav(path: string) {
		onClose();
		navigate(path);
	}

	function handleLogOut() {
		onClose();
		deleteUser();
		navigate('/auth');
	}

	return (
		<AnimatePresence>
			{open && (
				<>
					{/* ── Backdrop ── */}
					<motion.div
						key="backdrop"
						className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={onClose}
					/>

					{/* ── Drawer panel ── */}
					{/* Panel — slides in from the right */}
					<motion.aside
						key="drawer"
						className="fixed top-0 right-0 h-full w-72 z-50 flex flex-col bg-surface-white shadow-card-lg"
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', stiffness: 320, damping: 32 }}
					>
						{/* Header */}
						<div
							className="flex items-center justify-between px-5 py-4 border-b border-gray-100 rounded-r-md"
							style={{
								background:
									'linear-gradient(135deg, rgba(74,152,212,0.12) 0%, rgba(99,102,241,0.08) 100%)',
							}}
						>
							{/* User info */}
							<div className="flex items-center gap-3 min-w-0">
								<div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-800 flex items-center justify-center text-white font-bold text-lg shrink-0 select-none">
									{user?.firstName?.charAt(0).toUpperCase() ?? '?'}
								</div>
								<div className="min-w-0">
									<p className="font-semibold text-ink-deep truncate">
										{user?.firstName ?? 'Guest'}
									</p>
									<p className="text-xs text-ink-muted">
										{user?.tokenBalance ?? 0} KT Tokens
									</p>
								</div>
							</div>

							{/* Close button */}
							<button
								onClick={onClose}
								aria-label="Close menu"
								className="p-2 rounded-full hover:bg-gray-100 text-ink-muted hover:text-ink-deep transition-colors shrink-0"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Nav items */}
						<nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
							{NAV_ITEMS.map(({ icon: Icon, label, path }, i) => (
								<motion.button
									key={path}
									onClick={() => handleNav(path)}
									className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-ink-deep hover:bg-brand-50 hover:text-brand-600 transition-colors group"
									initial={{ opacity: 0, x: -16 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.05 + i * 0.04 }}
								>
									<Icon className="w-5 h-5 text-ink-muted group-hover:text-brand-500 transition-colors shrink-0" />
									<span className="font-medium">{label}</span>
								</motion.button>
							))}
						</nav>

						{/* Footer — log out */}
						<div className="px-3 py-4 border-t border-gray-100">
							<button
								onClick={handleLogOut}
								className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-danger-600 hover:bg-danger-50 transition-colors"
							>
								<LogOut className="w-5 h-5 shrink-0" />
								<span className="font-medium">Log Out</span>
							</button>
						</div>
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	);
}
