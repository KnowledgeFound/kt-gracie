export type Assessment = {
    id: bigint;
    title: string;
    assessmentType: string;
    maxScore: bigint;
    currentScore: bigint;
};

export type Subject = {
    id: bigint;
    name: string;
    code: string;
    duration: bigint; // Metric still has to be decided
    description: string;
    assessments: Assessment[];
};

export type CreateSubjectInput = {
  name: string;
  code: string;
  duration: bigint;
  description: string;
};

// A single token movement, as exposed to the UI.
// Mirrors the backend Transaction, but with the Candid optional `reference`
// (`[] | [string]`) flattened to `string | null` for easier consumption.
export type Transaction = {
  from: string;
  to: string;
  amount: bigint;
  txType: string;
  reference: string | null;
  createdAt: bigint;
};

export type TokenAccount = {
  userId: string;
  balance: bigint;
  transactions: Transaction[];
};
