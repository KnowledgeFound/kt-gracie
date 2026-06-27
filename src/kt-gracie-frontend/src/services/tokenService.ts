import { kt_gracie_backend } from 'declarations/kt-gracie-backend';
import { Transaction } from '../types/types';

/**
 * Token service — thin wrapper over the backend token canister methods.
 *
 * The backend is the source of truth for balances and transaction history.
 * Accounts are keyed by the user's `anonymousId`, which the caller passes in.
 */

/** Credit tokens to a user. Returns the new balance. */
export async function credit(
  userId: string,
  amount: bigint,
  txType: string,
  reference?: string
): Promise<bigint> {
  return kt_gracie_backend.credit(userId, amount, txType, toOpt(reference));
}

/** Debit tokens from a user (balance may go negative). Returns the new balance. */
export async function debit(
  userId: string,
  amount: bigint,
  txType: string,
  reference?: string
): Promise<bigint> {
  return kt_gracie_backend.debit(userId, amount, txType, toOpt(reference));
}

/** Get a user's current balance (0 for an unknown user). */
export async function getBalance(userId: string): Promise<bigint> {
  return kt_gracie_backend.getBalance(userId);
}

/** Get a user's full transaction history, oldest first. */
export async function getTransactions(userId: string): Promise<Transaction[]> {
  const txs = await kt_gracie_backend.getTransactions(userId);
  return txs.map(fromCandid);
}

// --- Candid <-> domain helpers ---

// Candid `opt text` is `[] | [string]`; map an optional string to that shape.
function toOpt(value?: string): [] | [string] {
  return value === undefined ? [] : [value];
}

// Flatten the Candid transaction (optional `reference` as `[] | [string]`)
// into the UI-facing Transaction shape.
function fromCandid(tx: {
  from: string;
  to: string;
  amount: bigint;
  txType: string;
  reference: [] | [string];
  createdAt: bigint;
}): Transaction {
  return {
    from: tx.from,
    to: tx.to,
    amount: tx.amount,
    txType: tx.txType,
    reference: tx.reference.length === 0 ? null : tx.reference[0],
    createdAt: tx.createdAt,
  };
}
