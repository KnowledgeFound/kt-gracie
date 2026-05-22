import {
	createContext,
	useContext,
	useState,
	useCallback,
	type ReactNode,
} from 'react';
import type {
	User,
	CreateUserInput,
	UpdateUserInput,
	GracieConfig,
	Progression,
} from './types';
import * as storage from './services/userStorage';

// ─── Shape ────────────────────────────────────────────────────────────────────

interface UserContextValue {
	user: User | null;
	createUser: (input: CreateUserInput) => User;
	updateUser: (updates: UpdateUserInput) => User;
	deleteUser: () => void;
	updateProgression: (progression: Partial<Progression>) => User;
	updateGracie: (gracie: Partial<GracieConfig>) => User;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const UserContext = createContext<UserContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function UserProvider({ children }: { children: ReactNode }) {
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

	return (
		<UserContext.Provider
			value={{
				user,
				createUser,
				updateUser,
				deleteUser,
				updateProgression,
				updateGracie,
			}}
		>
			{children}
		</UserContext.Provider>
	);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access the shared user state from any component in the tree.
 * Must be used inside <UserProvider>.
 */
export function useUser(): UserContextValue {
	const ctx = useContext(UserContext);
	if (!ctx) {
		throw new Error('useUser must be used inside <UserProvider>');
	}
	return ctx;
}

/**
 * Same as useUser() but returns null instead of throwing when there is
 * no logged-in user. Use this when a component should render gracefully
 * for both authenticated and unauthenticated states.
 */
export function useOptionalUser(): User | null {
	const ctx = useContext(UserContext);
	return ctx?.user ?? null;
}
