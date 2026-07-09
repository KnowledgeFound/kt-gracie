import {
	createContext,
	useContext,
	useState,
	useCallback,
	type ReactNode,
} from 'react';
import * as userServices from '../../services/userServices';
import * as cityServices from '../../services/cityService';
import type { 
	User,
	CreateUserInput,
	UpdateUserInput,
	GracieConfig,
	Progression,
} from '../../types/user';
import { City } from '@/models/City';

// ─── Shape ────────────────────────────────────────────────────────────────────

interface UserContextValue {
	user: User | null;
	city: City | null;
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
	const [city, setCity] = useState(() => cityServices.getCityFromLocalStorage());

	const createUser = useCallback((input: CreateUserInput): User => {
		// Create the user profile
		const created = userServices.createUser(input);
		setUser(created);

		// Create and persist the city, and reflect it in context state so
		// consumers (e.g. the auth redirect gate) see it without a page reload.
		const newCity = cityServices.createCity('UN City');
		cityServices.saveCityToLocalStorage(newCity);
		setCity(newCity);

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
		cityServices.deleteCityFromLocalStorage();
		setCity(null);
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
				city,
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
