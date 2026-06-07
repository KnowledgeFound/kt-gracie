export type MCQQuestion = {
	id: number;
	type: 'mcq';
	question: string;
	options: string[];
	correctAnswer: string;
	explanation: string;
};

export type TrueFalseQuestion = {
	id: number;
	type: 'truefalse';
	question: string;
	correctAnswer: boolean;
	explanation: string;
	options?: never;
};

export type Question = MCQQuestion | TrueFalseQuestion;

export type UserAnswer = string | boolean | null;

export type QuizScreen = 'welcome' | 'quiz' | 'results' | 'explanation';
