import { Difficulty, SourceType, AssessmentType } from "../ENUMS/enums";

export type Corpus = {
  schema: string;
  id: string;
  title: string;
  description: string;
  typeOfObject: string;
  additionalProperties: boolean;
  knowledgeUnits: KnowledgeUnit[];
  numberOfModules: number;
  numberOfAssessments: number;
};

export type KnowledgeUnit = {
  id: string;
  topic: string;
  difficulty: Difficulty;
  prerequisites: string[];
  sources: Source[];
  teachings: Teaching[];
  assessments: Assessment[];
  tokenReward: number;
};


export type Assessment = {
  id: number;
  maxScore: number;
  pointScore: number;
  quiz: Quiz | null;
  // flashcard: Flashcard | null; // Placeholder for future implementation
};

export type Source = {
  id: number;
  sourceType: SourceType;
  detail: string;
  url: string | null;
};

export type Teaching = {
  id: number;
  topic: string;
  difficulty: Difficulty;
  keywords: string[];
};

export type Quiz = {
  id: number;
  assessmentType: AssessmentType.QUIZ;
  questions: QuizQuestion[];
};

export type QuizQuestion = {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
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

export type Achievement = {
  id: string;
  title: string;
  earnedAt: string;
};

