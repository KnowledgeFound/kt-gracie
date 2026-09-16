
import { getLocalStorage, setLocalStorage } from "../commons/utilts";
import { ProgressContainer, Progress, Achievement, SubProgress } from "@/types/user";
import { getCorpus } from "./corpusService";
import { Corpus, Quiz, FlashCard, QuizQuestion, Card } from "@/types/types";
import { getUser } from "./userServices";
import { AssessmentType, Difficulty, SourceType } from "../ENUMS/enums";

/**
 * Shuffles an array of objects using the Fisher-Yates algorithm.
 * Returns a new array to avoid mutating the original.
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
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

export async function quizQuestionRandomiser(
  numQuestions: number,
  filter: AssessmentFilter & { quizId?: number } = {}
): Promise<QuizQuestion[]> {
  const corpus = await getCorpus();
  const quizQuestions = getQuizQuestions(corpus, filter);
  const num = Math.min(numQuestions, quizQuestions.length);

  return shuffleArray(quizQuestions).slice(0, num);
}

export async function flashCardRandomiser(
  numQuestions: number,
  filter: AssessmentFilter & { flashcardId?: number } = {}
): Promise<Card[]> {
  const corpus = await getCorpus();
  const flashCards = getFlashCards(corpus, filter);
  const num = Math.min(numQuestions, flashCards.length);

  return shuffleArray(flashCards).slice(0, num);
}


