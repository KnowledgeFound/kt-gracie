import { useQuery } from '@tanstack/react-query';
import { fetchSubjectById } from '../services/subjectService';

/**
 * Fetch a single subject by its canister ID.
 *
 * @param id  String route param (e.g. from useParams). Pass undefined to
 *            skip the query entirely — the hook returns { data: undefined }.
 */
export function useSubjectById(id: string | undefined) {
	return useQuery({
		queryKey: ['subject', id],
		queryFn: () => fetchSubjectById(BigInt(id!)),
		// Only run when id is a non-empty string that looks numeric
		enabled: typeof id === 'string' && id.length > 0 && !isNaN(Number(id)),
		staleTime: 30_000, // 30 s — subjects don't change often
	});
}
