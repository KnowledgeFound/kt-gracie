// @vitest-environment node
//
// REAL end-to-end test: tokenService -> Candid -> live local replica -> canister.
// Unlike tokenService.test.ts (which mocks the actor), this injects a REAL actor
// bound to the running replica, so tokenService's own toOpt/fromCandid mapping,
// the Candid encode/decode, and the Motoko canister logic all execute for real.
//
// Requires a running replica + a deployed backend. Run with:
//   dfx deploy kt-gracie-backend
//   CANISTER_ID_KT_GRACIE_BACKEND=$(dfx canister id kt-gracie-backend) \
//     npx vitest run src/services/__tests__/tokenService.integration.test.ts
//
// When CANISTER_ID_KT_GRACIE_BACKEND is unset (normal CI/unit runs) the suite
// skips itself and the mock falls back to a harmless stub.

import { describe, it, expect, beforeAll, vi } from "vitest";

// This integration test only runs under vitest (Node). The frontend build
// (`tsc`) compiles everything under src/ and is typed for the browser
// (types: ["vite/client"]), so declare the Node `process` we read here rather
// than pulling in @types/node. `crypto.randomUUID()` is the DOM-typed global,
// available in both the Node test runtime and the browser.
declare const process: { env: Record<string, string | undefined> };

vi.mock("declarations/kt-gracie-backend", async () => {
    const canisterId = process.env.CANISTER_ID_KT_GRACIE_BACKEND;
    if (!canisterId) {
        return { kt_gracie_backend: undefined };
    }
    const { HttpAgent, Actor } = await import("@icp-sdk/core/agent");
    const { idlFactory } = await import(
        "declarations/kt-gracie-backend/kt-gracie-backend.did.js"
    );
    const agent = new HttpAgent({ host: "http://127.0.0.1:4943" });
    await agent.fetchRootKey(); // local replica: trust the dev root key
    return {
        kt_gracie_backend: Actor.createActor(idlFactory, { agent, canisterId }),
    };
});

import {
    credit,
    debit,
    getBalance,
    getTransactions,
} from "../tokenService";

const live = !!process.env.CANISTER_ID_KT_GRACIE_BACKEND;

describe.skipIf(!live)("tokenService <-> live canister", () => {
    // Fresh ids per run so repeated runs against a persistent replica don't collide.
    const user = `it-${crypto.randomUUID()}`;
    const other = `it-${crypto.randomUUID()}`;

    beforeAll(() => {
        expect(live).toBe(true);
    });

    it("a brand-new user has a zero balance", async () => {
        expect(await getBalance(user)).toBe(0n);
    });

    it("credit adds tokens and returns the new balance", async () => {
        const balance = await credit(user, 100n, "reward", "assessment-COS301-quiz3");
        expect(balance).toBe(100n);
    });

    it("debit reduces the balance", async () => {
        expect(await debit(user, 30n, "spend")).toBe(70n);
    });

    it("debit may take the balance negative (debt allowed)", async () => {
        expect(await debit(user, 100n, "spend")).toBe(-30n);
        expect(await getBalance(user)).toBe(-30n);
    });

    it("records transaction history with reference mapping", async () => {
        const txs = await getTransactions(user);
        expect(txs).toHaveLength(3);

        expect(txs[0].from).toBe("system");
        expect(txs[0].to).toBe(user);
        expect(txs[0].amount).toBe(100n);
        expect(txs[0].txType).toBe("reward");
        expect(txs[0].reference).toBe("assessment-COS301-quiz3"); // opt text -> string

        expect(txs[1].from).toBe(user);
        expect(txs[1].reference).toBeNull(); // [] -> null
        expect(typeof txs[2].createdAt).toBe("bigint");
    });

    it("keeps each user's account isolated", async () => {
        expect(await getBalance(other)).toBe(0n);
    });
});
