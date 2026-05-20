import { useState, useCallback } from 'react';
import type { User, CreateUserInput, UpdateUserInput, GracieConfig, Progression } from '../types';
import * as storage from '../services/userStorage';

interface UseUserReturn {
	user: User | null;
	createUser: (input: CreateUserInput) => User;
	updateUser: (updates: UpdateUserInput) => User;
	deleteUser: () => void;
	updateProgression: (progression: Partial<Progression>) => User;
	updateGracie: (gracie: Partial<GracieConfig>) => User;
}

/**
 * React hook that wraps the userStorage service and keeps a reactive
 * copy of the current user in component state.
 */
export function useUser(): UseUserReturn {
	const [user, setUser] = useState<User | null>(() => storage.getUser());

	const createUser = useCallback((input: CreateUserInput): User => {
		const created = storage.createUser(input);
		setUser(created);
		return created;
	}, []);

	const updateUser = useCallback((updates: UpdateUserInput): User => {
		const updated = storage.updateUser(updates);
		setUser(updated);
		return updated;
	}, []);

	const deleteUser = useCallback((): void => {
		storage.deleteUser();
		setUser(null);
	}, []);

	const updateProgression = useCallback(
		(progression: Partial<Progression>): User => {
			const updated = storage.updateProgression(progression);
			setUser(updated);
			return updated;
		},
		[],
	);

	const updateGracie = useCallback((gracie: Partial<GracieConfig>): User => {
		const updated = storage.updateGracie(gracie);
		setUser(updated);
		return updated;
	}, []);

	return {
		user,
		createUser,
		updateUser,
		deleteUser,
		updateProgression,
		updateGracie,
	};
}
