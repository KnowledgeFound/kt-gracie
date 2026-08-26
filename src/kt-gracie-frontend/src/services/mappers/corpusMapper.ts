import type {
    Assessment as BackendAssessment,
    Corpus as BackendCorpus,
    KnowledgeUnit as BackendKnowledgeUnit,
    Quiz as BackendQuiz,
    QuizQuestion as BackendQuizQuestion,
    Source as BackendSource,
    Teaching as BackendTeaching,
} from "declarations/kt-gracie-backend/kt-gracie-backend.did";

import { AssessmentType, Difficulty, SourceType } from "../../ENUMS/enums";

import type { Corpus } from "../../types/types";

function unwrapOptional<T>(value: [] | [T]): T | null {
    return value.length === 0 ? null : value[0];
}

function mapVariant<T extends string>(value: Partial<Record<T, null>>): T {
    return Object.keys(value)[0] as T;
}

function mapSource(source: BackendSource) {
    return {
        id: source.id,
        sourceType: mapVariant<keyof typeof SourceType>(source.sourceType) as SourceType,
        detail: source.detail,
        url: unwrapOptional(source.url),
    };
}

function mapTeaching(teaching: BackendTeaching) {
    return {
        id: teaching.id,
        topic: teaching.topic,
        difficulty: mapVariant<keyof typeof Difficulty>(teaching.difficulty) as Difficulty,
        keywords: teaching.keywords,
    };
}

function mapQuizQuestion(question: BackendQuizQuestion) {
    return {
        questionText: question.questionText,
        options: question.options,
        correctAnswerIndex: question.correctAnswerIndex,
        hint: unwrapOptional(question.hint),
    };
}

function mapQuiz(quiz: BackendQuiz) {
    return {
        id: quiz.id,
        assessmentType: mapVariant<keyof typeof AssessmentType>(quiz.assessmentType) as AssessmentType.QUIZ,
        questions: quiz.questions.map(mapQuizQuestion),
    };
}

function mapAssessment(assessment: BackendAssessment) {
    const quiz = unwrapOptional(assessment.quiz);

    return {
        id: assessment.id,
        quiz: quiz === null ? null : mapQuiz(quiz),
    };
}

function mapKnowledgeUnit(knowledgeUnit: BackendKnowledgeUnit) {
    return {
        id: knowledgeUnit.id,
        topic: knowledgeUnit.topic,
        difficulty: mapVariant<keyof typeof Difficulty>(knowledgeUnit.difficulty) as Difficulty,
        prerequisites: knowledgeUnit.prerequisites,
        sources: knowledgeUnit.sources.map(mapSource),
        teachings: knowledgeUnit.teachings.map(mapTeaching),
        assessments: knowledgeUnit.assessments.map(mapAssessment),
        tokenReward: knowledgeUnit.tokenReward,
    };
}

export function mapFromBackend(corpus: BackendCorpus): Corpus {
    return {
        schema: corpus.schema,
        id: corpus.id,
        title: corpus.title,
        description: corpus.description,
        numberOfModules: Number(corpus.numberOfModules),
        numberOfAssessments: Number(corpus.numberOfAssessments),
        typeOfObject: corpus.typeOfObject,
        additionalProperties: corpus.additionalProperties,
        knowledgeUnits: (corpus.knowledgeUnits ?? []).map(mapKnowledgeUnit),
    };
}

function getAssessmentType(assessment: BackendAssessment): AssessmentType | null {
    const quiz = unwrapOptional(assessment.quiz);

    if (quiz) {
        return mapVariant<keyof typeof AssessmentType>(quiz.assessmentType) as AssessmentType;
    }
    
    return null;
}