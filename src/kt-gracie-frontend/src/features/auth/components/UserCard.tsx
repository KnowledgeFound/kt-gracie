import type { User } from '../types';
import {
	AGE_BUCKET_LABELS,
	GENDER_LABELS,
	REGION_LABELS,
} from '../constants';
import { Button } from '@/components/ui';

interface UserCardProps {
	user: User;
	onEdit: () => void;
	onDelete: () => void;
}

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
	const stats = [
		{ label: 'Quizzes', value: user.progression.quizzesCompleted },
		{ label: 'High Score', value: user.progression.highScore },
		{ label: 'Streak', value: `${user.progression.streakDays}d` },
		{ label: 'Tokens', value: user.tokenBalance },
	];

	return (
		<div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold select-none">
					{user.firstName.charAt(0).toUpperCase()}
				</div>
				<div>
					<h2 className="text-xl font-bold text-gray-900">{user.firstName}</h2>
					<p className="text-sm text-gray-500 font-mono truncate max-w-[220px]">
						{user.anonymousId}
					</p>
				</div>
			</div>

			{/* Demographics */}
			<dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
				<Row label="Age Range" value={AGE_BUCKET_LABELS[user.ageBucket]} />
				<Row label="Gender" value={GENDER_LABELS[user.gender]} />
				<Row label="Region" value={REGION_LABELS[user.region]} />
				<Row label="Country" value={user.country || '—'} />
				<Row
					label="Member Since"
					value={new Date(user.createdAt).toLocaleDateString()}
				/>
				<Row
					label="Last Active"
					value={new Date(user.lastActiveAt).toLocaleDateString()}
				/>
			</dl>

			{/* Progression stats */}
			<div className="grid grid-cols-4 gap-3">
				{stats.map(({ label, value }) => (
					<div
						key={label}
						className="flex flex-col items-center bg-indigo-50 rounded-xl py-3"
					>
						<span className="text-xl font-bold text-indigo-600">{value}</span>
						<span className="text-xs text-gray-500 mt-0.5">{label}</span>
					</div>
				))}
			</div>

			{/* Gracie */}
			<div className="bg-purple-50 rounded-xl p-4 flex items-center gap-4">
				<span className="text-3xl">🛡️</span>
				<div>
					<p className="font-semibold text-purple-800">{user.gracie.name}</p>
					<p className="text-sm text-purple-600">
						Integrity {user.gracie.integrityScore}/100 ·{' '}
						{user.gracie.interactionCount} interactions
					</p>
				</div>
			</div>

			{/* City */}
			<div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4">
				<span className="text-3xl">🏙️</span>
				<div>
					<p className="font-semibold text-blue-800">
						City — Tier {user.city.tier}
					</p>
					<p className="text-sm text-blue-600">
						Health {user.city.health}/100
					</p>
				</div>
			</div>

			{/* Actions */}
			<div className="flex gap-3 pt-2">
				<Button variant="secondary" size="md" onClick={onEdit} className="flex-1 justify-center">
					Edit Profile
				</Button>
				<Button variant="danger" size="md" onClick={onDelete} className="flex-1 justify-center">
					Delete Profile
				</Button>
			</div>
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<>
			<dt className="text-gray-500">{label}</dt>
			<dd className="font-medium text-gray-800">{value}</dd>
		</>
	);
}
