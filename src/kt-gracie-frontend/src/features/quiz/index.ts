// Public API for the quiz feature — only export what other features/pages need.
// Internal hooks, utils, and constants are not exported from here.
export { default as WelcomeScreen } from './components/WelcomeScreen';
export { default as QuizScreen } from './components/QuizScreen';
export { default as ResultsScreen } from './components/ResultsScreen';
export { default as ExplanationScreen } from './components/ExplanationScreen';
export { useQuiz } from './hooks/useQuiz';
export type { Question, MCQQuestion, TrueFalseQuestion, UserAnswer, QuizScreen as QuizScreenName } from './types';
