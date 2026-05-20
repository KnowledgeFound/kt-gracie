import { MainLayout } from '@/components/layout';
import { LeaderboardTable } from '@/features/leaderboard';
import type { LeaderboardEntry } from '@/features/leaderboard';

// Placeholder data — replace with a canister call via useLeaderboard() hook
const MOCK_ENTRIES: LeaderboardEntry[] = [];

export default function LeaderboardPage() {
	return (
		<MainLayout>
			<div className="max-w-3xl mx-auto px-4 py-12">
				<h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-8 text-center">
					🏆 Leaderboard
				</h1>
				<LeaderboardTable entries={MOCK_ENTRIES} />
			</div>
		</MainLayout>
	);
}
