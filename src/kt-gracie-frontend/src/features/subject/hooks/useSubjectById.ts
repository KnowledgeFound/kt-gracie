import { useQuery } from '@tanstack/react-query';
import { fetchSubjectById } from '../services/subjectService';

/**
 * Fetch a single subject by id.
 * Skips the query when id is undefined (e.g. standalone quiz with no subject).
 */
export function useSubjectById(id: string | undefined) {
	return useQuery({
		queryKey: ['subject', id],
		queryFn: () => fetchSubjectById(BigInt(id!)),
		enabled: id !== undefined && id !== '',
		staleTime: 5 * 60 * 1000, // 5 min — subjects don't change often
	});
}
