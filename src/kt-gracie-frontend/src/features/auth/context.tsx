import {
	createContext,
	useContext,
	useState,
	useCallback,
	type ReactNode,
} from 'react';
import * as userServices from '../../services/userServices';
import type { 
	User,
	CreateUserInput,
	UpdateUserInput,
	GracieConfig,
	Progression,
} from '../../types/user';

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
	const [user, setUser] = useState<User | null>(() => userServices.getUser());

	const createUser = useCallback((input: CreateUserInput): User => {
		const created = userServices.createUser(input);
		setUser(created);
		return created;
	}, []);

	const updateUser = useCallback((updates: UpdateUserInput): User => {
		const updated = userServices.updateUser(updates);
		setUser(updated);
		return updated;
	}, []);

	const deleteUser = useCallback((): void => {
		userServices.deleteUser();
		setUser(null);
	}, []);

	const updateProgression = useCallback(
		(progression: Partial<Progression>): User => {
			const updated = userServices.updateProgression(progression);
			setUser(updated);
			return updated;
		},
		[],
	);

	const updateGracie = useCallback((gracie: Partial<GracieConfig>): User => {
		const updated = userServices.updateGracie(gracie);
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
