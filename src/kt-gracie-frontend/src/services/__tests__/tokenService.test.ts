import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the generated canister actor so the service can be tested in isolation,
// without a running replica. `vi.hoisted` lets the mock object exist before the
// hoisted `vi.mock` factory runs. The factory matches the
// `declarations/kt-gracie-backend` specifier that tokenService imports.
const mockBackend = vi.hoisted(() => ({
    credit: vi.fn(),
    debit: vi.fn(),
    getBalance: vi.fn(),
    getTransactions: vi.fn(),
}));

vi.mock("declarations/kt-gracie-backend", () => ({
    kt_gracie_backend: mockBackend,
}));

import {
    credit,
    debit,
    getBalance,
    getTransactions,
} from "../tokenService";

beforeEach(() => {
    vi.clearAllMocks();
});

describe("credit", () => {
    it("forwards args and wraps the reference as a Candid opt", async () => {
        mockBackend.credit.mockResolvedValue(100n);

        const balance = await credit("user-1", 100n, "reward", "assessment-1");

        expect(balance).toBe(100n);
        expect(mockBackend.credit).toHaveBeenCalledWith(
            "user-1",
            100n,
            "reward",
            ["assessment-1"]
        );
    });

    it("passes an empty opt when no reference is given", async () => {
        mockBackend.credit.mockResolvedValue(50n);

        await credit("user-1", 50n, "reward");

        expect(mockBackend.credit).toHaveBeenCalledWith("user-1", 50n, "reward", []);
    });
});

describe("debit", () => {
    it("forwards args and returns the new (possibly negative) balance", async () => {
        mockBackend.debit.mockResolvedValue(-30n);

        const balance = await debit("user-1", 130n, "spend");

        expect(balance).toBe(-30n);
        expect(mockBackend.debit).toHaveBeenCalledWith("user-1", 130n, "spend", []);
    });
});

describe("getBalance", () => {
    it("returns the balance for a user", async () => {
        mockBackend.getBalance.mockResolvedValue(70n);

        expect(await getBalance("user-1")).toBe(70n);
        expect(mockBackend.getBalance).toHaveBeenCalledWith("user-1");
    });
});

describe("getTransactions", () => {
    it("flattens the Candid optional reference to string | null", async () => {
        mockBackend.getTransactions.mockResolvedValue([
            {
                from: "system",
                to: "user-1",
                amount: 100n,
                txType: "reward",
                reference: ["assessment-1"],
                createdAt: 1000n,
            },
            {
                from: "user-1",
                to: "system",
                amount: 30n,
                txType: "spend",
                reference: [],
                createdAt: 2000n,
            },
        ]);

        const txs = await getTransactions("user-1");

        expect(txs).toHaveLength(2);
        expect(txs[0].reference).toBe("assessment-1");
        expect(txs[1].reference).toBeNull();
        expect(txs[0].amount).toBe(100n);
    });
});
