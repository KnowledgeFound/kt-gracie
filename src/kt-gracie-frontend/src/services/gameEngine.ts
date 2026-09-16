import { getCorpus } from "./corpusService";
import { Corpus, QuizQuestion, Card } from "@/types/types";

/**
 * Returns 'numQuestions' random, non-repeating elements from input array, in shuffled order.
 * Only performs 'numQuestions' swaps instead of shuffling the entire array — more efficient
 * Returns a new array to avoid mutating the original.
 */

function shuffleArray<T>(array: T[], numQuestions: number, rng: () => number = Math.random): T[] {
  const result = [...array];
  const n = Math.min(numQuestions, result.length);

  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (result.length - i));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.slice(0, n);
}

interface AssessmentFilter {
  knowledgeUnitId?: string;
  assessmentId?: number;
}

function getQuizQuestions(
  corpus: Corpus,
  filter: AssessmentFilter & { quizId?: number } = {}
): QuizQuestion[] {
  const quizQuestions: QuizQuestion[] = [];

  if (!corpus?.knowledgeUnits) return quizQuestions;

  for (const ku of corpus.knowledgeUnits) {
    if (filter.knowledgeUnitId && ku.id !== filter.knowledgeUnitId) continue;
    if (!ku.assessments) continue;

    for (const assessment of ku.assessments) {
      if (filter.assessmentId && assessment.id !== filter.assessmentId) continue;
      if (!assessment.quiz?.questions) continue;
      if (filter.quizId && assessment.quiz.id !== filter.quizId) continue;

      quizQuestions.push(...assessment.quiz.questions);
    }
  }

  return quizQuestions;
}

function getFlashCards(
  corpus: Corpus,
  filter: AssessmentFilter & { flashcardId?: number } = {}
): Card[] {
  const flashCards: Card[] = [];

  if (!corpus?.knowledgeUnits) return flashCards;

  for (const ku of corpus.knowledgeUnits) {
    if (filter.knowledgeUnitId && ku.id !== filter.knowledgeUnitId) continue;
    if (!ku.assessments) continue;

    for (const assessment of ku.assessments) {
      if (filter.assessmentId && assessment.id !== filter.assessmentId) continue;
      if (!assessment.flashcard?.cards) continue;
      if (filter.flashcardId && assessment.flashcard.id !== filter.flashcardId) continue;

      flashCards.push(...assessment.flashcard.cards);
    }
  }

  return flashCards;
}

/**
 * Theses functions randomise quiz/flashcard questions/cards and returns specified number of questions
 * 
 * Params: 
 *  -numQuestions
 * 
 *  Optionally:
 *  -knowledge unit id 
 *  -assessment id 
 *  -quiz/flashcards id
*/

export async function quizQuestionRandomiser(
  numQuestions: number,
  filter: AssessmentFilter & { quizId?: number } = {},
  rng: () => number = Math.random
): Promise<QuizQuestion[]> {
  const corpus = await getCorpus();
  const quizQuestions = getQuizQuestions(corpus, filter);

  return shuffleArray(quizQuestions, numQuestions, rng);
}

export async function flashCardRandomiser(
  numQuestions: number,
  filter: AssessmentFilter & { flashcardId?: number } = {},
  rng: () => number = Math.random
): Promise<Card[]> {
  const corpus = await getCorpus();
  const flashCards = getFlashCards(corpus, filter);
  const num = Math.min(numQuestions, flashCards.length);

  return shuffleArray(flashCards, numQuestions, rng);
}


