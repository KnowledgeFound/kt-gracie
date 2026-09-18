import type {
    Assessment as BackendAssessment,
    Corpus as BackendCorpus,
    KnowledgeUnit as BackendKnowledgeUnit,
    Flashcard as BackendFlashcard,
    FlashCardQuestion as BackendFlashcardQuestion,
    Quiz as BackendQuiz,
    QuizQuestion as BackendQuizQuestion,
    Source as BackendSource,
    Teaching as BackendTeaching,
    Content as BackendContent,
} from "declarations/kt-gracie-backend/kt-gracie-backend.did";

import { AssessmentType, ContentType, Difficulty, SourceType } from "../../ENUMS/enums";

import type { Corpus } from "../../types/types";

function unwrapOptional<T>(value: [] | [T]): T | null {
    return value.length === 0 ? null : value[0];
}

function mapVariant<T extends string>(value: Partial<Record<T, null>>): T {
    return Object.keys(value)[0] as T;
}

function mapSource(source: BackendSource) {
    return {
        id: Number(source.id),
        sourceType: mapVariant<keyof typeof SourceType>(source.sourceType) as SourceType,
        detail: source.detail,
        url: unwrapOptional(source.url),
    };
}

function mapContent(content: BackendContent) {
    return {
        name: content.name,
        contentType: mapVariant<keyof typeof ContentType>(content.contentType) as ContentType,
        url: content.url,
        description: content.description,
    };
}

function mapOptionalContent(content: [] | [BackendContent]) {
    const unwrappedContent = unwrapOptional(content);
    return unwrappedContent === null ? null : mapContent(unwrappedContent);
}

function mapTeaching(teaching: BackendTeaching) {
    return {
        id: Number(teaching.id),
        topic: teaching.topic,
        difficulty: mapVariant<keyof typeof Difficulty>(teaching.difficulty) as Difficulty,
        keywords: teaching.keywords,
        content: mapContent(teaching.content),
    };
}

function mapQuizQuestion(question: BackendQuizQuestion) {
    return {
        questionText: question.questionText,
        options: question.options,
        correctAnswerIndex: Number(question.correctAnswerIndex),
        hint: unwrapOptional(question.hint),
    };
}

function mapQuiz(quiz: BackendQuiz) {
    return {
        id: Number(quiz.id),
        assessmentType: mapVariant<keyof typeof AssessmentType>(quiz.assessmentType) as AssessmentType.QUIZ,
        questions: quiz.questions.map(mapQuizQuestion),
    };
}

function mapFlashcardQuestion(question: BackendFlashcardQuestion) {
    return {
        front: question.front,
        back: question.back,
        hint: unwrapOptional(question.hint),
    };
}

function mapFlashcard(flashcard: BackendFlashcard) {
    return {
        id: Number(flashcard.id),
        assessmentType: mapVariant<keyof typeof AssessmentType>(flashcard.assessmentType) as AssessmentType.FLASHCARD,
        cards: flashcard.questions.map(mapFlashcardQuestion),
    };
}

function mapAssessment(assessment: BackendAssessment) {
    const quiz = unwrapOptional(assessment.quiz);
    const flashcard = unwrapOptional(assessment.flashcard);

    if (quiz !== null && flashcard !== null) {
        throw new Error(`Assessment ${assessment.id} cannot contain both a quiz and a flashcard`);
    }

    return {
        id: Number(assessment.id),
        maxScore: Number(assessment.maxScore),
        pointScore: Number(assessment.pointScore),
        quiz: quiz === null ? null : mapQuiz(quiz),
        flashcard: flashcard === null ? null : mapFlashcard(flashcard),
    };
}

function mapKnowledgeUnit(
    knowledgeUnit: BackendKnowledgeUnit & {
        expectations?: string[];
        image?: string;
        description?: string;
        icon?: string;
        block?: string;
    }
) {
    return {
        id: knowledgeUnit.id,
        topic: knowledgeUnit.topic,
        difficulty: mapVariant<keyof typeof Difficulty>(knowledgeUnit.difficulty) as Difficulty,
        prerequisites: knowledgeUnit.prerequisites ?? [],
        learningObjectives: knowledgeUnit.learningObjectives ?? [],
        expectations: knowledgeUnit.expectations ?? [],
        image: knowledgeUnit.image ?? "",
        description: knowledgeUnit.description ?? "",
        icon: knowledgeUnit.icon ?? "",
        block: knowledgeUnit.block ?? "",
        duration: knowledgeUnit.duration,
        sources: knowledgeUnit.sources.map(mapSource),
        teachings: knowledgeUnit.teachings.map(mapTeaching),
        assessments: knowledgeUnit.assessments.map(mapAssessment),
        tokenReward: Number(knowledgeUnit.tokenReward),
        summary: {
            id: Number(knowledgeUnit.summary.id),
            inforgraphic: mapOptionalContent(knowledgeUnit.summary.inforgraphic),
            slideDeck: mapOptionalContent(knowledgeUnit.summary.slideDeck),
            podcast: mapOptionalContent(knowledgeUnit.summary.podcast),
        },
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