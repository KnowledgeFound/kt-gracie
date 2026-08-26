import { Corpus } from "../types/types";
import { kt_gracie_backend } from "declarations/kt-gracie-backend";
import { mapFromBackend } from "./mappers/corpusMapper";

var MAIN_CORPUS: Corpus | null = null; 

export async function getCorpus(): Promise<Corpus> {
    if (MAIN_CORPUS) {
        return MAIN_CORPUS;
    }

    const corpus = await kt_gracie_backend.getCorpus();

    MAIN_CORPUS = mapFromBackend(corpus);

    return MAIN_CORPUS;
}

export async function getNumberOfModules(): Promise<number> {
    const corpus = await getCorpus();
    return corpus.numberOfModules;
}

export async function getNumberOfAssessments(): Promise<number> {
    const corpus = await getCorpus();
    return corpus.numberOfAssessments;
}