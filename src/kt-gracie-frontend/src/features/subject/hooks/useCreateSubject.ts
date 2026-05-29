import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSubject } from '../services/subjectService';
import { SUBJECTS_KEY } from './useSubjects';
import type { CreateSubjectInput } from '../types';

/**
 * Mutation hook for creating a subject.
 * Automatically invalidates the subjects list on success so the UI
 * re-fetches without a manual refresh.
 */
export function useCreateSubject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateSubjectInput) => createSubject(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: SUBJECTS_KEY });
		},
	});
}
