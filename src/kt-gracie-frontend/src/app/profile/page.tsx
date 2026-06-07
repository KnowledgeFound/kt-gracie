import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser, EditUserForm, DeleteConfirm, ProfileCard} from '@/features/auth';
import { MainLayout } from '@/components/layout';

type View = 'profile' | 'edit' | 'delete';

const slide = {
	initial:    { opacity: 0, y: 20 },
	animate:    { opacity: 1, y: 0, transition: { duration: 0.25 } },
	exit:       { opacity: 0, y: -12, transition: { duration: 0.18 } },
};

export default function ProfilePage() {
	const navigate = useNavigate();
	const { user, updateUser, deleteUser } = useUser();
	const [view, setView] = useState<View>('profile');

	// ProtectedRoute guarantees user is non-null here, but we guard anyway
	if (!user) return null;

	return (
		<MainLayout>
			<div className="w-full h-full">
				<AnimatePresence mode="wait">
					{/* ── Profile view ── */}
					{view === 'profile' && (
						<motion.div key="profile" {...slide}>
							<ProfileCard
								user={user}
								onBack={() => navigate(-1)}
								onEdit={() => setView('edit')}
								onDelete={() => setView('delete')}
							/>
						</motion.div>
					)}

					{/* ── Edit form ── */}
					{view === 'edit' && (
						<motion.div
							key="edit"
							{...slide}
							className="min-h-screen flex items-center justify-center px-4 py-12"
						>
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
						<motion.div
							key="delete"
							{...slide}
							className="min-h-screen flex items-center justify-center px-4 py-12"
						>
							<DeleteConfirm
								onConfirm={() => {
									deleteUser();
									navigate('/auth');
								}}
								onCancel={() => setView('profile')}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</MainLayout>
	);
}
