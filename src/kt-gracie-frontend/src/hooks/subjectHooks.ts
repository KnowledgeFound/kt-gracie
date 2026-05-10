import { useMutation } from '@tanstack/react-query';
import { type CreateSubjectInput } from '../types/types';
import { createSubject } from '../services/subjectServices';

export function useCreateSubjectHook() {
  return useMutation({
    mutationFn: (subject: CreateSubjectInput) => createSubject(subject),
  });
}

