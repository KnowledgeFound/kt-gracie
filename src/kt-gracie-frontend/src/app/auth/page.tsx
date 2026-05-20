import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
	useUser,
	CreateUserForm,
	EditUserForm,
	UserCard,
	DeleteConfirm,
} from '@/features/auth';

type View = 'profile' | 'create' | 'edit' | 'delete';

const fade = {
	initial: { opacity: 0, y: 16 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -16 },
	transition: { duration: 0.25 },
};

/**
 * Auth page — thin route wrapper.
 * All state lives in useUser(); this file only drives the view state machine.
 */
export default function AuthPage() {
	const { user, createUser, updateUser, deleteUser } = useUser();
	const [view, setView] = useState<View>(user ? 'profile' : 'create');

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-4 py-12">
			<AnimatePresence mode="wait">
				{/* ── No user: show create form ── */}
				{view === 'create' && (
					<motion.div key="create" {...fade}>
						<CreateUserForm
							onSubmit={(input) => {
								createUser(input);
								setView('profile');
							}}
						/>
					</motion.div>
				)}

				{/* ── Has user: show profile card ── */}
				{view === 'profile' && user && (
					<motion.div key="profile" {...fade}>
						<UserCard
							user={user}
							onEdit={() => setView('edit')}
							onDelete={() => setView('delete')}
						/>
					</motion.div>
				)}

				{/* ── Edit form ── */}
				{view === 'edit' && user && (
					<motion.div key="edit" {...fade}>
						<EditUserForm
							user={user}
							onSubmit={(updates) => {
								updateUser(updates);
								setView('profile');
							}}
							onCancel={() => setView('profile')}
						/>
					</motion.div>
				)}

				{/* ── Delete confirmation ── */}
				{view === 'delete' && (
					<motion.div key="delete" {...fade}>
						<DeleteConfirm
							onConfirm={() => {
								deleteUser();
								setView('create');
							}}
							onCancel={() => setView('profile')}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
