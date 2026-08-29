import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
	X,
	Trophy,
	BookOpen,
	LogOut,
	Home,
	Map,
	Settings,
	ChevronRight,
	Flame,
	Zap,
	ShieldCheck,
} from 'lucide-react';
import { useUser } from '@/features/auth';

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
	{ icon: Home,     label: 'City',        path: '/city',        description: 'Return to the city map'        },
	{ icon: Trophy,   label: 'Leaderboard', path: '/leaderboard', description: 'See how you rank'              },
	{ icon: Map,      label: 'Subjects',    path: '/subjects',    description: 'Browse all learning modules'   },
	{ icon: BookOpen, label: 'Assessments', path: '/',           description: 'Take a knowledge assessment'   },
	{ icon: Settings, label: 'Settings',    path: '/settings',   description: 'Theme, guide audio and more'   },
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

	const accuracy = 10; // Consult Leo about this

	function handleNav(path: string) {
		onClose();
		navigate(path);
	}

	function handleLogOut() {
		onClose();
		deleteUser();
		navigate('/');
	}

	const initial = user?.firstName?.charAt(0).toUpperCase() ?? '?';

	return (
		<AnimatePresence>
			{open && (
				<>
					{/* Backdrop */}
					<motion.div
						key="backdrop"
						className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={onClose}
					/>

					{/* Drawer — slides from right */}
					<motion.aside
						key="drawer"
						role="dialog"
						aria-modal="true"
						aria-label="User menu"
						className="fixed top-0 right-0 h-full w-full md:w-[50%] max-w-sm z-50 flex flex-col bg-white shadow-card-lg overflow-hidden"
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', stiffness: 320, damping: 32 }}
					>
						{/* ── Profile header ───────────────────────────────── */}
						<div className="relative px-5 pt-10 pb-5 flex-shrink-0 bg-gradient-to-br from-brand-500 to-brand-700 text-white overflow-hidden">
							{/* Decorative rings */}
							<div className="absolute -top-8 -right-8 w-36 h-36 rounded-full border-[20px] border-white/10 pointer-events-none" />
							<div className="absolute -bottom-10 -left-4 w-28 h-28 rounded-full border-[14px] border-white/8 pointer-events-none" />

							{/* Close */}
							<button
								onClick={onClose}
								aria-label="Close menu"
								className="absolute top-3 right-3 p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
							>
								<X className="size-4" />
							</button>

							{/* Avatar */}
							<div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-black select-none mb-3 shadow-md">
								{initial}
							</div>

							{/* Name + role */}
							<h2 className="text-xl font-black leading-tight">
								{user ? `Mayor ${user.firstName}` : 'Guest'}
							</h2>
							<p className="text-sm text-white/70 mt-0.5">
								{user?.anonymousId
									? `ID: ${user.anonymousId.slice(0, 8)}…`
									: 'No profile yet'}
							</p>

							{/* Quick stats strip */}
							{user && (
								<div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/20">
									<div className="flex items-center gap-1.5 text-sm font-bold">
										<Zap className="size-3.5 text-amber-300" />
										<span>{user.tokenBalance.toLocaleString()} KT</span>
									</div>
									<div className="w-px h-3.5 bg-white/25" />
									<div className="flex items-center gap-1.5 text-sm font-bold">
										<Flame className="size-3.5 text-orange-300" />
										<span>{5}d streak</span> {/* Consult Leo about this */}
									</div>
									<div className="w-px h-3.5 bg-white/25" />
									<div className="flex items-center gap-1.5 text-sm font-bold">
										<ShieldCheck className="size-3.5 text-emerald-300" />
										<span>{accuracy}%</span>
									</div>
								</div>
							)}
						</div>

						{/* ── Gracie companion card ─────────────────────────── */}
						{user && (
							<motion.div
								className="mx-4 mt-4 mb-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 border border-brand-100"
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.12 }}
							>
								<span className="text-2xl select-none">🛡️</span>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-bold text-ink-deep truncate">
										{user.gracie.name || 'Gracie'}
									</p>
									<p className="text-xs text-ink-muted">
										Integrity {user.gracie.integrityScore}/100
									</p>
								</div>
								<div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
									<div
										className="h-full bg-gradient-to-r from-brand-400 to-emerald-400 rounded-full"
										style={{ width: `${user.gracie.integrityScore}%` }}
									/>
								</div>
							</motion.div>
						)}

						{/* ── Nav items ─────────────────────────────────────── */}
						<nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
							<p className="px-3 pt-1 pb-2 text-[10px] font-black tracking-widest text-ink-subtle uppercase">
								Navigate
							</p>
							{NAV_ITEMS.map(({ icon: Icon, label, path, description }, i) => (
								<motion.button
									key={path}
									onClick={() => handleNav(path)}
									className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-brand-50 group transition-colors"
									initial={{ opacity: 0, x: 16 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.06 + i * 0.04 }}
								>
									{/* Icon box */}
									<div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center flex-shrink-0 transition-colors">
										<Icon className="size-4 text-ink-muted group-hover:text-brand-600 transition-colors" />
									</div>

									{/* Labels */}
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-ink-deep group-hover:text-brand-700 leading-tight transition-colors">
											{label}
										</p>
										<p className="text-[11px] text-ink-subtle leading-tight mt-0.5 truncate">
											{description}
										</p>
									</div>

									<ChevronRight className="size-4 text-gray-300 group-hover:text-brand-400 transition-colors flex-shrink-0" />
								</motion.button>
							))}
						</nav>

						{/* ── Footer ────────────────────────────────────────── */}
						<div className="flex-shrink-0 px-3 py-4 border-t border-gray-100 space-y-1">
							<button
								onClick={handleLogOut}
								className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-rose-600 hover:bg-rose-50 transition-colors group"
							>
								<div className="w-9 h-9 rounded-xl bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center flex-shrink-0 transition-colors">
									<LogOut className="size-4 text-rose-500" />
								</div>
								<span className="text-sm font-semibold">Log Out</span>
							</button>
						</div>
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	);
}
