
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

function getQuizQuestions(corpus: Corpus): QuizQuestion[] {
    
    const quizQuestions: QuizQuestion[] = [];
    
    if(!corpus) 
        return [];
    else if (corpus.knowledgeUnits[0].assessments[0].quiz?.questions){
        quizQuestions.push(...corpus.knowledgeUnits[0].assessments[0].quiz.questions);
    }

    return shuffleArray(quizQuestions);
}

function getFlashCards(corpus: Corpus): Card[] {
    const flashCards: Card[] = [];

    if (!corpus) {
        return [];
    } else if (corpus.knowledgeUnits[0].assessments[0].flashcard?.cards) {
        flashCards.push(...corpus.knowledgeUnits[0].assessments[0].flashcard.cards);
    }

    return shuffleArray(flashCards);
}

export async function quizQuestionRandomiser(numQuestions: number): Promise<QuizQuestion[]> {

    const corpus = await getCorpus();
    const quizQuestions = getQuizQuestions(corpus);
    const num = numQuestions > quizQuestions.length ? quizQuestions.length : numQuestions;

    const shuffledQuestions = shuffleArray(quizQuestions);

    return shuffledQuestions.slice(0, num) || [];
}

export async function flashCardRandomiser(numQuestions: number): Promise<Card[]> {
    
    const corpus = await getCorpus();
    const flashCards = getFlashCards(corpus);
    const num = numQuestions > flashCards.length ? flashCards.length : numQuestions;

    const shuffledFlashCards = shuffleArray(flashCards);

    return shuffledFlashCards.slice(0, num) || [];
}



