import type { LeaderboardEntry } from '../types';

interface LeaderboardTableProps {
	entries: LeaderboardEntry[];
}

function medal(rank: number): string {
	if (rank === 1) return '🥇';
	if (rank === 2) return '🥈';
	if (rank === 3) return '🥉';
	return `#${rank}`;
}

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
	if (entries.length === 0) {
		return (
			<p className="cityGlass px-6 py-12 text-center text-ink-muted">
				No scores yet. Be the first to complete the quiz!
			</p>
		);
	}

	return (
		<div className="cityGlass overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full text-left">
					<thead className="bg-brand-500/10 text-xs font-bold uppercase tracking-wider text-ink-mid">
						<tr>
							<th className="px-6 py-3.5">Rank</th>
							<th className="px-6 py-3.5">Player</th>
							<th className="px-6 py-3.5">Score</th>
							<th className="px-6 py-3.5">Date</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-line-soft">
						{entries.map((entry) => (
							<tr key={entry.principal} className="transition-colors hover:bg-brand-500/5">
								<td className="px-6 py-4 text-lg font-bold text-brand-600">
									{medal(entry.rank)}
								</td>
								<td className="px-6 py-4 font-semibold text-ink-deep">
									{entry.displayName}
								</td>
								<td className="px-6 py-4 font-black text-ink-deep">{entry.score}</td>
								<td className="px-6 py-4 text-sm text-ink-muted">{entry.completedAt}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
