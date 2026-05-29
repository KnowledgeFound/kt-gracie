import { MainLayout } from '@/components/layout';
import { useOptionalUser } from '@/features/auth';
import { LeaderboardTable } from '@/features/leaderboard';
import type { LeaderboardEntry } from '@/features/leaderboard';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Placeholder — replace with a canister call via useLeaderboard() hook
const MOCK_ENTRIES: LeaderboardEntry[] = [
	{
		principal: 'abc123',
		rank: 1,
		displayName: 'Alice',
		score: 95,
		completedAt: '2026-06-01',
	},
	{
		principal: 'def456',
		rank: 2,
		displayName: 'Bob',
		score: 90,
		completedAt: '2026-06-01',
	},
	{
		principal: 'ghi789',
		rank: 3,
		displayName: 'Charlie',
		score: 85,
		completedAt: '2026-06-01',
	},
];

export default function LeaderboardPage() {
	const user = useOptionalUser();
	const navigate = useNavigate();
	return (
		<MainLayout>
			<div className="max-w-3xl mx-auto px-4 py-12 w-full">
				<div className="flex items-center justify-start gap-4 mb-8">
					<button
						onClick={() => navigate(-1)}
						className="p-2 rounded-full hover:bg-brand-100 text-ink-muted hover:text-ink-deep transition-colors"
								aria-label="Go back"
							>
						<ArrowLeft className="w-4 h-4" />
					
					</button>
					<h1 className="text-3xl md:text-4xl font-bold text-indigo-600 text-center">
						🏆 Leaderboard
					</h1>
				</div>

				{/* Personal stats card — only shown when a profile exists */}
				{user && (
					<div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 flex flex-wrap gap-6 items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
								{user.firstName.charAt(0).toUpperCase()}
							</div>
							<span className="font-semibold text-gray-800">
								{user.firstName}
							</span>
						</div>
						<div className="flex gap-6">
							<Stat label="High Score" value={user.progression.highScore} />
							<Stat label="Quizzes" value={user.progression.quizzesCompleted} />
							<Stat
								label="Accuracy"
								value={
									user.progression.totalAnswered > 0
										? `${Math.round((user.progression.totalCorrect / user.progression.totalAnswered) * 100)}%`
										: '—'
								}
							/>
							<Stat label="Streak" value={`${user.progression.streakDays}d`} />
						</div>
					</div>
				)}

				<LeaderboardTable entries={MOCK_ENTRIES} />
			</div>
		</MainLayout>
	);
}

function Stat({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="flex flex-col items-center">
			<span className="text-xl font-bold text-indigo-600">{value}</span>
			<span className="text-xs text-gray-500 mt-0.5">{label}</span>
		</div>
	);
}
