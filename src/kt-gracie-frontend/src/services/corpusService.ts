import { Corpus, KnowledgeUnit } from "../types/types";
import { kt_gracie_backend } from "declarations/kt-gracie-backend";
import { mapFromBackend } from "./mappers/corpusMapper";
import { setLocalStorage, getLocalStorage } from "../commons/utilts";
import { Module, ModuleAssessment } from "@/features/city/types";
import { resolveIcon, cityBlockIdMapper } from "./mappers/iconMapper";
import { mapAssessmentDifficulty, mapDuration } from "./mappers/mappers";
import { resolveImage } from "./mappers/imageMapper";
import { AssessmentType } from "@/ENUMS/enums";
import { withLeveledCopy } from "./mappers/readingLevelMapper";

let allModules : Module [] = [];
let numberOfModules: number = 0;
let numberOfAssessments: number = 0;

export async function getCorpus(): Promise<Corpus> {
    const persistedCorpus = getPersistedCorpus();

    const corpus = await kt_gracie_backend.getCorpus();

    const normalizedCorpus = mapFromBackend(corpus);

    if(persistedCorpus && (persistedCorpus.lastUpdated >= normalizedCorpus.lastUpdated))
        return persistedCorpus;

    numberOfAssessments = normalizedCorpus.numberOfAssessments;
    numberOfModules = normalizedCorpus.numberOfModules;

    persistCorpus(normalizedCorpus);

    return normalizedCorpus;
}

export function getNumberOfModules(): number {
    return numberOfModules;
}

export function getNumberOfAssessments(): number {
    return numberOfAssessments;
}

export function persistCorpus(corpus: Corpus): void {
    setLocalStorage("corpus", corpus);
}

export function getPersistedCorpus(): Corpus {
    return getLocalStorage("corpus");
}

export async function getAllModules(): Promise<Module[]> {

    if(allModules.length > 0)
        return allModules;
    
    const corpus = await getCorpus();
    let modules: Module[] = [];

    if(corpus)
    {
        let counter: number = 1;

        corpus.knowledgeUnits.forEach((knowledgeUnit) => {
            var module: Module = {
                id: counter++,
                kuId: knowledgeUnit.id,
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
                    type: assessment.quiz ? AssessmentType.QUIZ : (assessment.flashcard ? AssessmentType.FLASHCARD : AssessmentType.CHAT_QA),
                    title: assessment.quiz ? knowledgeUnit.topic + " Quiz #" + assessment.sequenceNo : (assessment.flashcard ? knowledgeUnit.topic + " Flashcard #" + assessment.sequenceNo : "Assessment"),
                    description: assessment.quiz ? getQuizDescription(knowledgeUnit.topic,assessment.ktMax) : (assessment.flashcard ? getFlashCardDescription(knowledgeUnit.topic,assessment.ktMax) : getGeneralDescription() ), 
                    difficulty: mapAssessmentDifficulty(assessment.difficulty),
                    questionCount: assessment.quiz ? assessment.quiz.questions.length : (assessment.flashcard ? assessment.flashcard.cards.length : 0),
                    durationLabel: mapDuration(assessment.duration),
                    ktMax: assessment.ktMax,
                    status: 'available',
                    ktEarned: 0,
                    questions: assessment.quiz ? assessment.quiz.questions : [],
                    cards: assessment.flashcard ? assessment.flashcard.cards : [],
                    sequenceNo: assessment.sequenceNo,
                    keywords: []
                })),
                progress: null // resolve later
            }

            // map the teachings
            knowledgeUnit.teachings.forEach(teaching => {
                module.assessments.push(
                    {
                        id: teaching.id,
                        type: AssessmentType.TEACHING,
                        title: teaching.topic,
                        description: teaching.content.description,
                        difficulty: mapAssessmentDifficulty(teaching.difficulty),
                        questionCount: 0,
                        durationLabel: mapDuration(teaching.duration),
                        ktMax: teaching.ktMax,
                        status: 'available',
                        ktEarned: 0,
                        questions: [],
                        cards: [],
                        sequenceNo: teaching.sequenceNo,
                        keywords: teaching.keywords,
                        content: teaching.content
                    }
                )
            });

            // add the summary section
            module.assessments.push(
                {
                    id:knowledgeUnit.summary.id,
                    type: AssessmentType.SUMMARY,
                    title: knowledgeUnit.topic + " Summary Section",
                    description: "Explore additional Content on " + knowledgeUnit.topic,
                    difficulty: 'easy',
                    questionCount: 0,
                    durationLabel: "NA",
                    ktMax: 0,
                    status: 'available',
                    ktEarned: 0,
                    questions: [],
                    cards: [],
                    sequenceNo: knowledgeUnit.summary.sequenceNo,
                    keywords: [],
                }
            )

            // replace current assessment array with sorted version.
            module.assessments = sortAssessments(module.assessments);

            modules.push(withLeveledCopy(module));

        });
    }

    allModules = modules;

    return modules;
}

export function sortAssessments(assessments: ModuleAssessment[]): ModuleAssessment[] {
    return assessments.toSorted((a, b) => a.sequenceNo - b.sequenceNo);
}

function getQuizDescription(topic: string, ktMax: number) : string {
    return "Answer the Quiz on "+ topic + " to earn " + ktMax.toString() + " knowledge Tokens";
}

function getFlashCardDescription(topic: string, ktMax: number) : string {
    return "Play the Flashcard game on "+ topic + " to earn " + ktMax.toString() + " knowledge Tokens";
}

function getGeneralDescription() : string {
    return "Choose the Following activity to progress";
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

export async function getModule(moduleId: number) : Promise<Module | null>
{
    return (await getAllModules()).find((m) => m.id == moduleId) ?? null;
}
