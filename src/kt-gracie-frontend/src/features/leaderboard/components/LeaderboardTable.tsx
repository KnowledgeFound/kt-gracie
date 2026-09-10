import type { LeaderboardEntry } from '../types';

interface LeaderboardTableProps {
	entries: LeaderboardEntry[];
}

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
	if (entries.length === 0) {
		return (
			<p className="text-center text-gray-500 py-12">
				No scores yet. Be the first to complete the quiz!
			</p>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl shadow-lg">
			<table className="w-full text-left bg-white">
				<thead className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white">
					<tr>
						<th className="px-6 py-4 font-semibold">Rank</th>
						<th className="px-6 py-4 font-semibold">Player</th>
						<th className="px-6 py-4 font-semibold">Score</th>
						<th className="px-6 py-4 font-semibold">Date</th>
					</tr>
				</thead>
				<tbody>
					{entries.map((entry, i) => (
						<tr
							key={entry.principal}
							className={i % 2 === 0 ? 'bg-white' : 'bg-indigo-50'}
						>
							<td className="px-6 py-4 font-bold text-indigo-600">
								{entry.rank === 1
									? '🥇'
									: entry.rank === 2
										? '🥈'
										: entry.rank === 3
											? '🥉'
											: `#${entry.rank}`}
							</td>
							<td className="px-6 py-4 text-gray-800">{entry.displayName}</td>
							<td className="px-6 py-4 font-semibold text-gray-900">
								{entry.score}
							</td>
							<td className="px-6 py-4 text-gray-500 text-sm">
								{entry.completedAt}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
