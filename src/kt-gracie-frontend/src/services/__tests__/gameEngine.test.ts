import { describe, it, expect, vi, beforeEach } from "vitest";
import { quizQuestionRandomiser, flashCardRandomiser } from "../gameEngine";
import { Corpus } from "../../types/types";
import { getCorpus } from "../corpusService";
import { AssessmentType, Difficulty } from "../../ENUMS/enums";

vi.mock("../corpusService", () => ({
  getCorpus: vi.fn(),
}));

const mockCorpus: Corpus = {
    schema: "https://json-schema.org/draft/2020-12/schema",
    id: "https://knowledgefound.org/gracie/schemas/knowledge_unit.schema.json",
    title: "GRACIE 1.0 Knowledge Unit Corpus",
    description: "A corpus of knowledge units for the GRACIE 1.0 platform.",
    typeOfObject: "object",
    additionalProperties: false,
    numberOfModules: 1,
    numberOfAssessments: 2,
    knowledgeUnits: [
    {
      id: "KU-001",
      topic: "Introduction to Corruption",
      difficulty: Difficulty.EASY,
      prerequisites: [],
      sources: [],
      teachings: [],
      tokenReward: 10,
      assessments: [
        {
          id: 1,
          maxScore: 5,
          flashcard: null,
          pointScore: 1,
          quiz: {
            id: 1,
            assessmentType: AssessmentType.QUIZ,
            questions: Array.from({ length: 7 }, (_, index) => ({
              questionText: `Question ${index + 1}`,
              options: [],
              correctAnswerIndex: 0,
              hint: "",
            })),
          },
        },
        {
          id: 2,
          maxScore: 7,
          pointScore: 1,
          quiz: null,
          flashcard: {
            id: 1,
            assessmentType: AssessmentType.FLASHCARD,
            cards: Array.from({ length: 7 }, (_, index) => ({
              question: `Flashcard Question ${index + 1}`,
              answer: `Flashcard Answer ${index + 1}`,
          })),
          },
        },
      ],
    },
    {
      id: "KU-002",
      topic: "Topic 2",
      difficulty: Difficulty.NORMAL,
      prerequisites: [],
      sources: [],
      teachings: [],
      tokenReward: 10,
      assessments: [
        {
          id: 1,
          maxScore: 5,
          flashcard: null,
          pointScore: 1,
          quiz: {
            id: 1,
            assessmentType: AssessmentType.QUIZ,
            questions: Array.from({ length: 7 }, (_, index) => ({
              questionText: `Question ${index + 1}`,
              options: [],
              correctAnswerIndex: 0,
              hint: "",
            })),
          },
        },
        {
          id: 2,
          maxScore: 7,
          pointScore: 1,
          quiz: null,
          flashcard: {
            id: 1,
            assessmentType: AssessmentType.FLASHCARD,
            cards: Array.from({ length: 7 }, (_, index) => ({
              question: `Flashcard Question ${index + 1}`,
              answer: `Flashcard Answer ${index + 1}`,
          })),
          },
        },
      ],
    },
    {
      id: "KU-003",
      topic: "Topic 3",
      difficulty: Difficulty.HARD,
      prerequisites: [],
      sources: [],
      teachings: [],
      tokenReward: 10,
      assessments: [
        {
          id: 1,
          maxScore: 5,
          flashcard: null,
          pointScore: 1,
          quiz: {
            id: 1,
            assessmentType: AssessmentType.QUIZ,
            questions: Array.from({ length: 7 }, (_, index) => ({
              questionText: `Question ${index + 1}`,
              options: [],
              correctAnswerIndex: 0,
              hint: "",
            })),
          },
        },
        {
          id: 2,
          maxScore: 7,
          pointScore: 1,
          quiz: null,
          flashcard: {
            id: 1,
            assessmentType: AssessmentType.FLASHCARD,
            cards: Array.from({ length: 7 }, (_, index) => ({
              question: `Flashcard Question ${index + 1}`,
              answer: `Flashcard Answer ${index + 1}`,
          })),
          },
        },
      ],
    },
  
  ],
  } as unknown as Corpus;

const mockedGetCorpus = vi.mocked(getCorpus);

const corpusWithKnowledgeUnits = (knowledgeUnits: Corpus["knowledgeUnits"]): Corpus => ({
  ...mockCorpus,
  knowledgeUnits,
});

const corpusWithAssessments = (
  assessments: Corpus["knowledgeUnits"][number]["assessments"],
): Corpus =>
  corpusWithKnowledgeUnits([
    {
      ...mockCorpus.knowledgeUnits[0],
      assessments,
    },
  ]);

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetCorpus.mockResolvedValue(mockCorpus);
});

/**
 * Asserts that `actual` contains exactly the same elements as `expected`,
 * regardless of order. Used to verify shuffling/slicing without asserting
 * against one specific (and possibly coincidentally-produced) ordering.
 */
function expectSamePool<T>(actual: T[], expected: T[], keyFn: (item: T) => string) {
  const actualKeys = actual.map(keyFn).sort();
  const expectedKeys = expected.map(keyFn).sort();

  expect(actualKeys).toEqual(expectedKeys);
}

/**
 * Runs `fn` multiple times and asserts at least one run produces an order
 * different from the first run's order. Statistically robust replacement
 * for a single not.toEqual assertion, which has a nonzero (if tiny) chance
 * of false failure on any single run.
 */
async function expectEventualReorder<T>(
  fn: () => Promise<T[]>,
  keyFn: (item: T) => string,
  attempts = 10,
) {
  const first = (await fn()).map(keyFn);
  let sawDifferentOrder = false;

  for (let i = 0; i < attempts; i++) {
    const next = (await fn()).map(keyFn);

    if (JSON.stringify(next) !== JSON.stringify(first)) {
      sawDifferentOrder = true;
      break;
    }
  }

  expect(sawDifferentOrder).toBe(true);
}

describe("quizQuestionRandomiser", () => {
  it("should return the requested number of quiz questions", async () => {
    const result = await quizQuestionRandomiser(4);

    expect(result.length).toBe(4);
  });

  it("should return questions drawn from the full available pool", async () => {
    const result = await quizQuestionRandomiser(4);
    const allPossibleQuestions = mockCorpus.knowledgeUnits.flatMap(
      (ku) => ku.assessments[0].quiz?.questions ?? [],
    );

    // every returned question must exist somewhere in the source pool
    result.forEach((question) => {
      expect(allPossibleQuestions.map((q) => q.questionText)).toContain(question.questionText);
    });
  });

  it("should shuffle results across repeated calls", async () => {
    await expectEventualReorder(
      () => quizQuestionRandomiser(7),
      (question) => question.questionText,
    );
  });

  it("should cap at the full pooled total across all KUs when requested number exceeds it", async () => {
    const result = await quizQuestionRandomiser(50);

    expect(result.length).toBe(21);
  });

  it("should return the same set of questions as the pool when capped, just reordered", async () => {
    const result = await quizQuestionRandomiser(50);
    const allPossibleQuestions = mockCorpus.knowledgeUnits.flatMap(
      (ku) => ku.assessments[0].quiz?.questions ?? [],
    );

    expectSamePool(result, allPossibleQuestions, (q) => q.questionText);
  });

  it("should return no questions when the corpus has no knowledge units", async () => {
    mockedGetCorpus.mockResolvedValueOnce(corpusWithKnowledgeUnits([]));

    const result = await quizQuestionRandomiser(4);

    expect(result).toEqual([]);
  });

  it("should return no questions when the corpus has no assessments", async () => {
    mockedGetCorpus.mockResolvedValueOnce(corpusWithAssessments([]));

    const result = await quizQuestionRandomiser(4);

    expect(result).toEqual([]);
  });

  it("should return no questions when getCorpus resolves null/undefined", async () => {
    mockedGetCorpus.mockResolvedValueOnce(null as unknown as Corpus);

    const result = await quizQuestionRandomiser(4);

    expect(result).toEqual([]);
  });
});

describe("flashCardRandomiser", () => {
  it("should return the requested number of flashcards", async () => {
    const result = await flashCardRandomiser(4);

    expect(result.length).toBe(4);
  });

  it("should return flashcards drawn from the full available pool", async () => {
    const result = await flashCardRandomiser(4);
    const allPossibleCards = mockCorpus.knowledgeUnits.flatMap(
      (ku) => ku.assessments[1].flashcard?.cards ?? [],
    );

    result.forEach((card) => {
      expect(allPossibleCards.map((c) => c.question)).toContain(card.question);
    });
  });

  it("should shuffle results across repeated calls", async () => {
    await expectEventualReorder(
      () => flashCardRandomiser(7),
      (card) => card.question,
    );
  });

  it("should cap at the full pooled total across all KUs when requested number exceeds it", async () => {
    const result = await flashCardRandomiser(50);

    expect(result.length).toBe(21);
  });

  it("should return the same set of flashcards as the pool when capped, just reordered", async () => {
    const result = await flashCardRandomiser(50);
    const allPossibleCards = mockCorpus.knowledgeUnits.flatMap(
      (ku) => ku.assessments[1].flashcard?.cards ?? [],
    );

    expectSamePool(result, allPossibleCards, (c) => c.question);
  });

  it("should return no flashcards when the corpus has no knowledge units", async () => {
    mockedGetCorpus.mockResolvedValueOnce(corpusWithKnowledgeUnits([]));

    const result = await flashCardRandomiser(4);

    expect(result).toEqual([]);
  });

  it("should return no flashcards when the corpus has no assessments", async () => {
    mockedGetCorpus.mockResolvedValueOnce(corpusWithAssessments([]));

    const result = await flashCardRandomiser(4);

    expect(result).toEqual([]);
  });

  it("should return no flashcards when getCorpus resolves null/undefined", async () => {
    mockedGetCorpus.mockResolvedValueOnce(null as unknown as Corpus);

    const result = await flashCardRandomiser(4);

    expect(result).toEqual([]);
  });
});