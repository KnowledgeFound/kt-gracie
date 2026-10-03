import { Trophy } from 'lucide-react';
import { CityShell, PageTitle } from '@/features/city';
import { useOptionalUser } from '@/features/auth';
import { LeaderboardTable } from '@/features/leaderboard';
import type { LeaderboardEntry } from '@/features/leaderboard';
import * as ProgressContainer from '@/services/progressContainerService';

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
	return (
		<CityShell>
			<PageTitle
				icon={Trophy}
				kicker="Top learners"
				title="Leaderboard"
				sub="See how your city compares with the rest of the class."
			/>

			{/* Personal stats card — only shown when a profile exists */}
			{user && (
				<div className="cityGlass mb-6 flex flex-wrap items-center justify-between gap-6 px-6 py-5">
					<div className="flex items-center gap-3">
						<div className="cityHeaderAvatar flex h-11 w-11 items-center justify-center rounded-full text-base font-black">
							{user.firstName.charAt(0).toUpperCase()}
						</div>
						<div>
							<p className="font-bold text-ink-deep">{user.firstName}</p>
							<p className="text-xs text-ink-muted">Your standing</p>
						</div>
					</div>
					<div className="flex flex-wrap gap-6">
						<Stat label="High Score" value={ProgressContainer.getTotalScore()} />
						<Stat label="Quizzes" value={ProgressContainer.getNumberOfQuizzesCompleted()} />
						<Stat
							label="Accuracy"
							value={
								10 // Consult Leo about this
							}
						/>
						<Stat label="Streak" value={`${5}d`} />
					</div>
				</div>
			)}

			<LeaderboardTable entries={MOCK_ENTRIES} />
		</CityShell>
	);
}

function Stat({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="flex flex-col items-center">
			<span className="text-xl font-black text-brand-600">{value}</span>
			<span className="mt-0.5 text-xs text-ink-muted">{label}</span>
		</div>
	);
}
