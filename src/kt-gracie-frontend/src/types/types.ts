import { Difficulty, SourceType } from "../ENUMS/enums";

export type Assessment = {
  id: bigint;
  quiz: Quiz | null;
};

export type Corpus = {
  schema: string;
  id: string;
  title: string;
  description: string;
  typeOfObject: string;
  additionalProperties: boolean;
  knowledgeUnits: KnowledgeUnit[];
};

export type KnowledgeUnit = {
  id: string;
  topic: string;
  difficulty: Difficulty;
  prerequisites: string[];
  sources: Source[];
  teachings: Teaching[];
  assessments: Assessment[];
  tokenReward: bigint;
};

export type Source = {
  id: bigint;
  sourceType: SourceType;
  detail: string;
  url: string | null;
};

export type Teaching = {
  id: bigint;
  topic: string;
  difficulty: Difficulty;
  keywords: string[];
};

export type Quiz = {
  id: bigint;
  assessmentType: "QUIZ";
  questions: QuizQuestion[];
};

export type QuizQuestion = {
  questionText: string;
  options: string[];
  correctAnswerIndex: bigint;
  hint: string | null;
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