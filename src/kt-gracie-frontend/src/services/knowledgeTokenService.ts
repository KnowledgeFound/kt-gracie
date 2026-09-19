import { getBalance, getTransactions, createAccount, credit, debit } from './tokenService';
import * as userServices from './userServices';
import type { Transaction } from '../types/types';

/**
 * Knowledge Token service — domain-level facade over the backend token canister.
 *
 * The backend `arr_accounts` is the source of truth for balances and
 * transaction history; the user's `tokenBalance` in localStorage is only a
 * display cache so the UI can render a number without an async call. This
 * service bridges the two: it fetches from the backend when needed and syncs
 * the local cache, and it guarantees every registered user has an account.
 *
 * Write-path helpers (`syncTokenBalance`, `creditTokens`, `debitTokens`) are
 * optimistic + fire-and-forget: they update localStorage (and the UI via the
 * optional `onBalanceChange` callback) immediately, then silently reconcile
 * with the backend in the background.
 */

export interface AccountInfo {
  balance: bigint;
  transactions: Transaction[];
}

/**
 * Ensure a user has an account in the backend ledger.
 * Idempotent — the backend creates nothing if the account already exists.
 */
export async function createAccountForUser(userId: string): Promise<boolean> {
  return createAccount(userId);
}

/**
 * Fetch the user's balance from the backend and sync it to the local cache.
 * The UI badge reads `user.tokenBalance`, so calling this keeps the header
 * in sync with the authoritative on-chain balance.
 */
export async function fetchBalance(userId: string): Promise<bigint> {
  const balance = await getBalance(userId);
  userServices.updateTokenBalance(Number(balance));
  return balance;
}

/**
 * Fetch the user's full account (balance + transaction history) from the
 * backend and sync the cached balance. Used by the TokenModal on open.
 */
export async function fetchAccount(userId: string): Promise<AccountInfo> {
  const [balance, transactions] = await Promise.all([
    getBalance(userId),
    getTransactions(userId),
  ]);
  userServices.updateTokenBalance(Number(balance));
  return { balance, transactions };
}

/**
 * Fire-and-forget sync of the user's authoritative balance into
 * localStorage + UI. Never blocks the caller and never throws — network
 * failures are logged and the existing (optimistic) cache value is kept.
 */
export function syncTokenBalance(
  userId: string,
  onBalanceChange?: (value: number) => void
): void {
  void getBalance(userId)
    .then((balance) => {
      const value = Number(balance);
      userServices.updateTokenBalance(value);
      onBalanceChange?.(value);
    })
    .catch((err) => console.error('Failed to sync token balance:', err));
}

/**
 * Credit tokens optimistically: update localStorage + UI immediately,
 * silently apply the credit on the backend in the background, then reconcile
 * with the backend's authoritative balance. On failure the balance is rolled
 * back to its previous confirmed value.
 *
 * Fire-and-forget in normal use (`void creditTokens(...)`); the returned
 * promise is only for consumers that want to observe completion.
 */
export function creditTokens(
  userId: string,
  amount: bigint,
  txType: string,
  reference?: string,
  onBalanceChange?: (value: number) => void
): Promise<bigint> {
  return applyTokenChange('credit', userId, amount, txType, reference, onBalanceChange);
}

/**
 * Debit tokens optimistically — same semantics as `creditTokens`.
 */
export function debitTokens(
  userId: string,
  amount: bigint,
  txType: string,
  reference?: string,
  onBalanceChange?: (value: number) => void
): Promise<bigint> {
  return applyTokenChange('debit', userId, amount, txType, reference, onBalanceChange);
}

// ─── Internals ────────────────────────────────────────────────────────────────

type TokenChangeKind = 'credit' | 'debit';

// Monotonic per-user sequence so a stale backend response from an older call
// can never clobber a newer optimistic value (latest-wins reconciliation).
const seqByUser = new Map<string, number>();

function bumpSeq(userId: string): number {
  const next = (seqByUser.get(userId) ?? 0) + 1;
  seqByUser.set(userId, next);
  return next;
}

function isLatest(userId: string, seq: number): boolean {
  return seqByUser.get(userId) === seq;
}

// Write a balance to the local cache + notify the UI.
function writeBalance(value: number, onBalanceChange?: (value: number) => void): void {
  userServices.updateTokenBalance(value);
  onBalanceChange?.(value);
}

async function applyTokenChange(
  kind: TokenChangeKind,
  userId: string,
  amount: bigint,
  txType: string,
  reference: string | undefined,
  onBalanceChange?: (value: number) => void
): Promise<bigint> {
  const seq = bumpSeq(userId);
  const prev = Number(userServices.getUser()?.tokenBalance ?? 0);
  const delta = kind === 'credit' ? Number(amount) : -Number(amount);

  try {
    // 1. Optimistic — happens before any await, so the caller never waits.
    writeBalance(prev + delta, onBalanceChange);

    // 2. Silent background backend call.
    const authoritative = await (kind === 'credit' ? credit : debit)(
      userId,
      amount,
      txType,
      reference
    );

    // 3. Reconcile with the authoritative balance (only if still the latest).
    if (isLatest(userId, seq)) {
      writeBalance(Number(authoritative), onBalanceChange);
    }
    return authoritative;
  } catch (err) {
    // 4. Roll back to the previous confirmed value (latest-wins guarded).
    if (isLatest(userId, seq)) {
      writeBalance(prev, onBalanceChange);
    }
    console.error(`Failed to ${kind} tokens:`, err);
    throw err;
  }
}