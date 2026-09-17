import { describe, it, expect, vi, beforeEach } from "vitest";

const mockTokenService = vi.hoisted(() => ({
    getBalance: vi.fn(),
    getTransactions: vi.fn(),
    createAccount: vi.fn(),
    credit: vi.fn(),
    debit: vi.fn(),
}));

// Simulate the localStorage cache chain: `updateTokenBalance` writes the new
// value into the shared state that `getUser` reads back, exactly like
// userServices does with localStorage.
const mockUserServices = vi.hoisted(() => {
    const state = { cachedBalance: 100 };
    return {
        updateTokenBalance: vi.fn((value: number) => {
            state.cachedBalance = value;
        }),
        getUser: vi.fn(() => ({ tokenBalance: state.cachedBalance })),
        __resetCache: vi.fn((initial: number = 100) => {
            state.cachedBalance = initial;
        }),
    };
});

vi.mock("../tokenService", () => mockTokenService);
vi.mock("../userServices", () => mockUserServices);

import {
    createAccountForUser,
    fetchBalance,
    fetchAccount,
    syncTokenBalance,
    creditTokens,
    debitTokens,
} from "../knowledgeTokenService";

import type { Transaction } from "../../types/types";

beforeEach(() => {
    vi.clearAllMocks();
    mockUserServices.__resetCache(100);
});

describe("createAccountForUser", () => {
    it("delegates to the backend createAccount and returns the result", async () => {
        mockTokenService.createAccount.mockResolvedValue(true);

        expect(await createAccountForUser("user-1")).toBe(true);
        expect(mockTokenService.createAccount).toHaveBeenCalledWith("user-1");
    });

    it("returns false when the backend already has the account", async () => {
        mockTokenService.createAccount.mockResolvedValue(false);

        expect(await createAccountForUser("user-1")).toBe(false);
    });
});

describe("fetchBalance", () => {
    it("returns the backend balance and syncs the local cache", async () => {
        mockTokenService.getBalance.mockResolvedValue(250n);

        const balance = await fetchBalance("user-1");

        expect(balance).toBe(250n);
        expect(mockTokenService.getBalance).toHaveBeenCalledWith("user-1");
        expect(mockUserServices.updateTokenBalance).toHaveBeenCalledWith(250);
    });

    it("propagates errors from the backend", async () => {
        mockTokenService.getBalance.mockRejectedValue(new Error("boom"));

        await expect(fetchBalance("user-1")).rejects.toThrow("boom");
        expect(mockUserServices.updateTokenBalance).not.toHaveBeenCalled();
    });
});

describe("fetchAccount", () => {
    it("returns balance and transactions and syncs the cached balance", async () => {
        const txs: Transaction[] = [
            {
                from: "system",
                to: "user-1",
                amount: 100n,
                txType: "reward",
                reference: null,
                createdAt: 1000n,
            },
        ];
        mockTokenService.getBalance.mockResolvedValue(100n);
        mockTokenService.getTransactions.mockResolvedValue(txs);

        const account = await fetchAccount("user-1");

        expect(account.balance).toBe(100n);
        expect(account.transactions).toBe(txs);
        expect(mockTokenService.getTransactions).toHaveBeenCalledWith("user-1");
        expect(mockUserServices.updateTokenBalance).toHaveBeenCalledWith(100);
    });

    it("handles a negative balance in the cached value", async () => {
        mockTokenService.getBalance.mockResolvedValue(-30n);
        mockTokenService.getTransactions.mockResolvedValue([]);

        await fetchAccount("user-1");

        expect(mockUserServices.updateTokenBalance).toHaveBeenCalledWith(-30);
    });

    it("propagates errors and skips the cache sync", async () => {
        mockTokenService.getTransactions.mockRejectedValue(new Error("down"));

        await expect(fetchAccount("user-1")).rejects.toThrow("down");
        expect(mockUserServices.updateTokenBalance).not.toHaveBeenCalled();
    });
});

// Helper: wait a tick so fire-and-forget promise chains have run.
const tick = () => new Promise((r) => setTimeout(r, 0));

describe("syncTokenBalance", () => {
    it("is fire-and-forget: returns void and never blocks", () => {
        mockTokenService.getBalance.mockResolvedValue(250n);

        const result = syncTokenBalance("user-1");

        expect(result).toBeUndefined();
    });

    it("writes the backend balance to the cache and notifies the UI", async () => {
        mockTokenService.getBalance.mockResolvedValue(250n);
        const cb = vi.fn();

        syncTokenBalance("user-1", cb);
        await tick();

        expect(mockTokenService.getBalance).toHaveBeenCalledWith("user-1");
        expect(mockUserServices.updateTokenBalance).toHaveBeenCalledWith(250);
        expect(cb).toHaveBeenCalledWith(250);
    });

    it("swallows backend errors and leaves the cache untouched", async () => {
        mockTokenService.getBalance.mockRejectedValue(new Error("down"));
        const cb = vi.fn();

        expect(() => syncTokenBalance("user-1", cb)).not.toThrow();
        await tick();

        expect(mockUserServices.updateTokenBalance).not.toHaveBeenCalled();
        expect(cb).not.toHaveBeenCalled();
    });
});

describe("creditTokens", () => {
    it("applies the optimistic balance before the backend resolves, then reconciles", async () => {
        let resolveCredit!: (v: bigint) => void;
        mockTokenService.credit.mockReturnValue(
            new Promise((r) => (resolveCredit = r))
        );
        const cb = vi.fn();

        const p = creditTokens("user-1", 50n, "reward", "ref-1", cb);

        // Optimistic write happened synchronously (cached balance 100 + 50).
        expect(mockUserServices.updateTokenBalance).toHaveBeenCalledWith(150);
        expect(cb).toHaveBeenCalledWith(150);

        resolveCredit(210n);
        await p;

        expect(mockTokenService.credit).toHaveBeenCalledWith(
            "user-1",
            50n,
            "reward",
            "ref-1"
        );
        expect(mockUserServices.updateTokenBalance).toHaveBeenLastCalledWith(210);
        expect(cb).toHaveBeenLastCalledWith(210);
    });

    it("rolls back to the previous confirmed balance on failure", async () => {
        mockTokenService.credit.mockRejectedValue(new Error("boom"));

        await expect(creditTokens("user-1", 50n, "reward")).rejects.toThrow("boom");

        // optimistic 150, then rollback to the pre-change 100.
        expect(mockUserServices.updateTokenBalance).toHaveBeenCalledWith(150);
        expect(mockUserServices.updateTokenBalance).toHaveBeenLastCalledWith(100);
    });
});

describe("debitTokens", () => {
    it("applies an optimistic negative change, then reconciles", async () => {
        let resolveDebit!: (v: bigint) => void;
        mockTokenService.debit.mockReturnValue(
            new Promise((r) => (resolveDebit = r))
        );
        const cb = vi.fn();

        const p = debitTokens("user-1", 30n, "spend", undefined, cb);

        expect(mockUserServices.updateTokenBalance).toHaveBeenCalledWith(70);

        resolveDebit(70n);
        await p;

        expect(mockTokenService.debit).toHaveBeenCalledWith(
            "user-1",
            30n,
            "spend",
            undefined
        );
        expect(mockUserServices.updateTokenBalance).toHaveBeenLastCalledWith(70);
        expect(cb).toHaveBeenLastCalledWith(70);
    });

    it("rolls back to the previous confirmed balance on failure", async () => {
        mockTokenService.debit.mockRejectedValue(new Error("denied"));

        await expect(debitTokens("user-1", 30n, "spend")).rejects.toThrow("denied");

        expect(mockUserServices.updateTokenBalance).toHaveBeenCalledWith(70);
        expect(mockUserServices.updateTokenBalance).toHaveBeenLastCalledWith(100);
    });
});

describe("concurrent optimistic changes (latest-wins)", () => {
    it("ignores a stale backend response from an older call", async () => {
        let resolveOld!: (v: bigint) => void;
        let resolveNew!: (v: bigint) => void;
        mockTokenService.credit
            .mockReturnValueOnce(new Promise((r) => (resolveOld = r)))
            .mockReturnValueOnce(new Promise((r) => (resolveNew = r)));

        const oldCredit = creditTokens("user-1", 10n, "reward");
        const newCredit = creditTokens("user-1", 20n, "reward");

        // optimistic: 110 then 130
        expect(mockUserServices.updateTokenBalance).toHaveBeenLastCalledWith(130);

        // newer call resolves first
        resolveNew(200n);
        await newCredit;
        expect(mockUserServices.updateTokenBalance).toHaveBeenLastCalledWith(200);

        // older call resolves later with a stale value -> must not clobber
        resolveOld(110n);
        await oldCredit;
        expect(mockUserServices.updateTokenBalance).toHaveBeenLastCalledWith(200);
    });

    it("ignores a rollback from an older call that failed after a newer one succeeded", async () => {
        let resolveOldFail!: (e: Error) => void;
        let resolveNew!: (v: bigint) => void;
        mockTokenService.credit
            .mockReturnValueOnce(new Promise((_, rej) => (resolveOldFail = rej)))
            .mockReturnValueOnce(new Promise((r) => (resolveNew = r)));

        const oldCredit = creditTokens("user-1", 10n, "reward");
        const newCredit = creditTokens("user-1", 20n, "reward");

        resolveNew(300n);
        await newCredit;

        resolveOldFail(new Error("late failure"));
        await expect(oldCredit).rejects.toThrow("late failure");

        // the old call's rollback must not overwrite the newer balance
        expect(mockUserServices.updateTokenBalance).toHaveBeenLastCalledWith(300);
    });
});