import { Assessment, Corpus, KnowledgeUnit } from "../types/types";
import { kt_gracie_backend } from "declarations/kt-gracie-backend";
import { mapFromBackend } from "./mappers/corpusMapper";
import { setLocalStorage, getLocalStorage } from "../commons/utilts";
import { AssessmentDifficulty, Module, ModuleAssessment } from "@/features/city/types";
import { resolveIcon, cityBlockIdMapper } from "./mappers/iconMapper";
import { mapAssessmentDifficulty, mapDuration } from "./mappers/mappers";
import { resolveImage } from "./mappers/imageMapper";
import { withLeveledCopy } from "./mappers/readingLevelMapper";

export async function getCorpus(): Promise<Corpus> {
    const persistedCorpus = await getPersistedCorpus();

    if (persistedCorpus) {
        return persistedCorpus;
    }

    const corpus = await kt_gracie_backend.getCorpus();

    const normalizedCorpus = mapFromBackend(corpus);

    await persistCorpus(normalizedCorpus);

    return normalizedCorpus;
}

export async function getNumberOfModules(): Promise<number> {
    const corpus = await getCorpus();
    return corpus.numberOfModules;
}

export async function getNumberOfAssessments(): Promise<number> {
    const corpus = await getCorpus();
    return corpus.numberOfAssessments;
}

export async function persistCorpus(corpus: Corpus): Promise<void> {
    setLocalStorage("corpus", corpus);
}

export async function getPersistedCorpus(): Promise<Corpus | null> {
    return getLocalStorage("corpus");
}

export async function getAllModules(): Promise<Module[]> {
    
    const corpus = await getCorpus();
    let modules: Module[] = [];

    if(corpus)
    {
        let counter: number = 1;

        corpus.knowledgeUnits.forEach((knowledgeUnit) => {
            const module: Module = {
                id: counter++,
                name: knowledgeUnit.topic,
                description: knowledgeUnit.description,
                audience: knowledgeUnit.audience,
                icon: resolveIcon(knowledgeUnit.icon),
                image: resolveImage(knowledgeUnit.image),
                block: cityBlockIdMapper(knowledgeUnit.block),
                objectives: knowledgeUnit.learningObjectives,
                expectations: knowledgeUnit.expectations,
                lessons: knowledgeUnit.assessments.length + knowledgeUnit.teachings.length,
                level: knowledgeUnit.level,
                duration: knowledgeUnit.duration,
                ktReward: getMaxNumberOfKtTokens(knowledgeUnit),
                assessments: knowledgeUnit.assessments.map((assessment) => ({
                    id: assessment.id,
                    title: assessment.quiz ? knowledgeUnit.topic + " Quiz" : (assessment.flashcard ? knowledgeUnit.topic + " Flashcard" : "Assessment"),
                    description: knowledgeUnit.description,
                    difficulty: mapAssessmentDifficulty(assessment.difficulty),
                    questionCount: assessment.quiz ? assessment.quiz.questions.length : (assessment.flashcard ? assessment.flashcard.cards.length : 0),
                    durationLabel: mapDuration(assessment.duration),
                    ktMax: assessment.ktMax,
                    status: 'available',
                    ktEarned: 0
                })),
                progress: null // resolve later
            }

            modules.push(withLeveledCopy(module));
        });
    }

    return modules;
}

function getMaxNumberOfKtTokens(knowledgeUnit: KnowledgeUnit) : number {
    const totalFromAssessments = knowledgeUnit.assessments.reduce((kt, assessment) => {
        return kt + (assessment.ktMax)
    }, 0);

    const totalFromTeachings = knowledgeUnit.teachings.reduce((kt, teaching) => {
        return kt + (teaching.ktMax)
    }, 0);

    return totalFromAssessments + totalFromTeachings;

}

