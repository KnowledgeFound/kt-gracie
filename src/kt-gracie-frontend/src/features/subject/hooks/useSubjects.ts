import { useQuery } from '@tanstack/react-query';
import { fetchSubjects } from '../services/subjectService';

export const SUBJECTS_KEY = ['subjects'] as const;

/** Reactive query — fetches all subjects and caches them. */
export function useSubjects() {
	return useQuery({
		queryKey: SUBJECTS_KEY,
		queryFn: fetchSubjects,
	});
}
