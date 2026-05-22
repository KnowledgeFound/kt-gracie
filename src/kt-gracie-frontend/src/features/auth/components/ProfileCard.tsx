import {
	ArrowLeft,
	Pencil,
	Trash2,
	Trophy,
	Zap,
	Target,
	Flame,
	BookOpen,
	ShieldCheck,
	LogOut,
	Heart,
	Coins,
} from 'lucide-react';
import type { User } from '../types';
import { AGE_BUCKET_LABELS, GENDER_LABELS, REGION_LABELS } from '../constants';
import { Button } from '@/components/ui';

interface ProfileCardProps {
	user: User;
	onBack: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

export default function ProfileCard({
	user,
	onBack,
	onEdit,
	onDelete,
}: ProfileCardProps) {
	const accuracy =
		user.progression.totalAnswered > 0
			? Math.round(
					(user.progression.totalCorrect / user.progression.totalAnswered) *
						100,
				)
			: 0;

	return (
		<div className="max-w-lg mx-auto px-4 py-8 space-y-5 shadow-lg">
			{/* ── Top nav ── */}
			<div className="flex items-center justify-between">
				<button
					onClick={onBack}
					className="flex items-center gap-1.5 text-ink-muted hover:text-ink-deep transition-colors text-sm font-medium"
				>
					<ArrowLeft className="w-4 h-4" />
					Back
				</button>
				<div className="flex gap-2">
					<button
						onClick={onEdit}
						aria-label="Edit profile"
						className="p-2 rounded-full hover:bg-brand-100 text-ink-muted hover:text-brand-600 transition-colors"
					>
						<Pencil className="w-4 h-4" />
					</button>
				</div>
			</div>

			{/* ── Hero card ── */}
			<div className="rounded-card p-6 text-brand-500 shadow-card-lg">
				<div className="flex items-center gap-4">
					{/* Avatar */}
					<div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-3xl font-bold select-none shrink-0">
						{user.firstName.charAt(0).toUpperCase()}
					</div>
					<div className="min-w-0">
						<h1 className="text-2xl font-bold truncate">{user.firstName}</h1>
						<p className="text-brand-500/70 text-xs font-mono truncate mt-0.5">
							{user.anonymousId}
						</p>
						<p className="text-brand-500/80 text-sm mt-1">
							{REGION_LABELS[user.region]}
							{user.country ? ` · ${user.country}` : ''}
						</p>
					</div>
				</div>

				{/* Token balance pill */}
				<div className="mt-5 inline-flex items-center gap-2 bg-white/15 rounded-pill px-4 py-2">
					<Coins className="w-4 h-4" />
					<span className="font-bold">{user.tokenBalance}</span>
					<span className="text-white/70 text-sm">KT Tokens</span>
				</div>
			</div>

			{/* ── Stat grid ── */}
			<div className="grid grid-cols-2 gap-3">
				<StatCard
					icon={<Trophy className="w-5 h-5 text-warning-400" />}
					label="High Score"
					value={`${user.progression.highScore}/10`}
					bg="bg-warning-50"
				/>
				<StatCard
					icon={<Target className="w-5 h-5 text-brand-500" />}
					label="Accuracy"
					value={`${accuracy}%`}
					bg="bg-brand-50"
				/>
				<StatCard
					icon={<BookOpen className="w-5 h-5 text-brand-500" />}
					label="Quizzes"
					value={user.progression.quizzesCompleted}
					bg="bg-brand-50"
				/>
				<StatCard
					icon={<Flame className="w-5 h-5 text-danger-500" />}
					label="Streak"
					value={`${user.progression.streakDays}d`}
					bg="bg-danger-50"
				/>
			</div>

			{/* ── Progress bar ── */}
			<Section title="Overall Progress">
				<div className="space-y-3">
					<ProgressRow
						label="Quiz Accuracy"
						value={accuracy}
						max={100}
						color="bg-brand-500"
					/>
					<ProgressRow
						label="City Health"
						value={user.city.health}
						max={100}
						color="bg-brand-500"
					/>
					<ProgressRow
						label="Gracie Integrity"
						value={user.gracie.integrityScore}
						max={100}
						color="bg-success-600"
					/>
				</div>
			</Section>

			{/* ── Gracie ── */}
			<Section title="Gracie">
				<div className="flex items-center gap-4 bg-brand-50 rounded-badge p-4">
					<div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-800 flex items-center justify-center text-2xl shrink-0">
						🛡️
					</div>
					<div className="min-w-0">
						<p className="font-semibold text-ink-deep">{user.gracie.name}</p>
						<div className="flex items-center gap-3 mt-1 text-sm text-ink-muted">
							<span className="flex items-center gap-1">
								<ShieldCheck className="w-3.5 h-3.5" />
								{user.gracie.integrityScore}/100
							</span>
							<span className="flex items-center gap-1">
								<Zap className="w-3.5 h-3.5" />
								{user.gracie.interactionCount} interactions
							</span>
						</div>
					</div>
				</div>
			</Section>

			{/* ── City ── */}
			<Section title="Knowledge City">
				<div className="flex items-center gap-4 bg-brand-50 rounded-badge p-4">
					<div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-2xl shrink-0">
						🏙️
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between">
							<p className="font-semibold text-ink-deep">
								Tier {user.city.tier}
							</p>
							<span className="text-sm text-ink-muted flex items-center gap-1">
								<Heart className="w-3.5 h-3.5 text-brand-400" />
								{user.city.health}/100
							</span>
						</div>
						<div className="mt-2 h-2 bg-brand-200 rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-[width] duration-500"
								style={{ width: `${user.city.health}%` }}
							/>
						</div>
					</div>
				</div>
			</Section>

			{/* ── Demographics ── */}
			<Section title="About">
				<dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
					<InfoRow
						label="Age Range"
						value={AGE_BUCKET_LABELS[user.ageBucket]}
					/>
					<InfoRow label="Gender" value={GENDER_LABELS[user.gender]} />
					<InfoRow label="Region" value={REGION_LABELS[user.region]} />
					<InfoRow label="Country" value={user.country || '—'} />
					<InfoRow
						label="Member Since"
						value={new Date(user.createdAt).toLocaleDateString()}
					/>
					<InfoRow
						label="Last Active"
						value={new Date(user.lastActiveAt).toLocaleDateString()}
					/>
				</dl>
			</Section>

			{/* ── Badges ── */}
			{user.progression.badges.length > 0 && (
				<Section title="Badges">
					<div className="flex flex-wrap gap-2">
						{user.progression.badges.map((badge) => (
							<span
								key={badge}
								className="px-3 py-1 bg-warning-50 text-warning-400 border border-warning-300 rounded-pill text-xs font-semibold"
							>
								{badge}
							</span>
						))}
					</div>
				</Section>
			)}
			<div className="flex gap-3 pt-2 pb-8">
				<Button
					variant="danger"
					size="lg"
					onClick={onDelete}
					className="flex-1 justify-center"
				>
					<LogOut className="w-4 h-4 mr-2" />
					Logout
				</Button>
			</div>
		</div>
	);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
	icon,
	label,
	value,
	bg,
}: {
	icon: React.ReactNode;
	label: string;
	value: string | number;
	bg: string;
}) {
	return (
		<div className={`${bg} rounded-card p-4 flex items-center gap-3`}>
			<div className="shrink-0">{icon}</div>
			<div>
				<p className="text-xl font-bold text-ink-deep leading-none">{value}</p>
				<p className="text-xs text-ink-muted mt-0.5">{label}</p>
			</div>
		</div>
	);
}

function ProgressRow({
	label,
	value,
	max,
	color,
}: {
	label: string;
	value: number;
	max: number;
	color: string;
}) {
	const pct = Math.min(Math.round((value / max) * 100), 100);
	return (
		<div>
			<div className="flex justify-between text-sm mb-1">
				<span className="text-ink-muted">{label}</span>
				<span className="font-semibold text-ink-deep">
					{value}/{max}
				</span>
			</div>
			<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
				<div
					className={`h-full ${color} rounded-full transition-[width] duration-500`}
					style={{ width: `${pct}%` }}
				/>
			</div>
		</div>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-3">
			<h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">
				{title}
			</h2>
			{children}
		</div>
	);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<>
			<dt className="text-ink-muted">{label}</dt>
			<dd className="font-medium text-ink-deep">{value}</dd>
		</>
	);
}
