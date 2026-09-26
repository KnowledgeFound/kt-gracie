import {
	createContext,
	useContext,
	useState,
	useCallback,
	type ReactNode,
} from 'react';
import * as userServices from '../../services/userServices';
import * as cityServices from '../../services/cityService';
import {
	createAccountForUser,
	syncTokenBalance as syncTokenBalanceWithBackend,
	creditTokens as creditTokensWithBackend,
	debitTokens as debitTokensWithBackend,
} from '../../services/knowledgeTokenService';
import type { 
	User,
	CreateUserInput,
	UpdateUserInput,
	GracieConfig,
} from '../../types/user';
import { City } from '@/models/City';

// ─── Shape ────────────────────────────────────────────────────────────────────

interface UserContextValue {
	user: User | null;
	city: City | null;
	createUser: (input: CreateUserInput) => User;
	updateUser: (updates: UpdateUserInput) => User;
	deleteUser: () => void;
	updateGracie: (gracie: Partial<GracieConfig>) => User;
	updateTokenBalance: (tokenBalance: number) => User;
	/** Fire-and-forget: pull the authoritative balance from the backend into localStorage + UI. */
	syncTokenBalance: () => void;
	/** Fire-and-forget optimistic credit (backend reconciles in the background). */
	creditTokens: (amount: bigint, txType: string, reference?: string) => void;
	/** Fire-and-forget optimistic debit (backend reconciles in the background). */
	debitTokens: (amount: bigint, txType: string, reference?: string) => void;
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

		// Create the user's token account in the backend ledger. Fire-and-forget
		// so registration stays instant — the backend method is idempotent and
		// getBalance already returns 0 for an unknown user.
		void createAccountForUser(created.anonymousId).catch((err) => {
			console.error('Failed to create backend token account:', err);
		});

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

	const updateGracie = useCallback((gracie: Partial<GracieConfig>): User => {
		const updated = userServices.updateGracie(gracie);
		setUser(updated);
		return updated;
	}, []);

	const updateTokenBalance = useCallback((tokenBalance: number): User => {
		const updated = userServices.updateTokenBalance(tokenBalance);
		setUser(updated);
		return updated;
	}, []);

	// The knowledgeTokenService helpers already persist to localStorage; this
	// callback only mirrors the value into React state so the UI updates live
	// without a second localStorage write.
	const applyBalanceToState = useCallback((value: number): void => {
		const current = userServices.getUser();
		if (current) setUser({ ...current, tokenBalance: value });
	}, []);

	const syncTokenBalance = useCallback((): void => {
		if (!user) return;
		syncTokenBalanceWithBackend(user.anonymousId, applyBalanceToState);
	}, [user, applyBalanceToState]);

	const creditTokens = useCallback(
		(amount: bigint, txType: string, reference?: string): void => {
			if (!user) return;
			void creditTokensWithBackend(
				user.anonymousId,
				amount,
				txType,
				reference,
				applyBalanceToState,
			).catch(() => {});
		},
		[user, applyBalanceToState],
	);

	const debitTokens = useCallback(
		(amount: bigint, txType: string, reference?: string): void => {
			if (!user) return;
			void debitTokensWithBackend(
				user.anonymousId,
				amount,
				txType,
				reference,
				applyBalanceToState,
			).catch(() => {});
		},
		[user, applyBalanceToState],
	);

	return (
		<UserContext.Provider
			value={{
				user,
				city,
				createUser,
				updateUser,
				deleteUser,
				updateGracie,
				updateTokenBalance,
				syncTokenBalance,
				creditTokens,
				debitTokens,
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
