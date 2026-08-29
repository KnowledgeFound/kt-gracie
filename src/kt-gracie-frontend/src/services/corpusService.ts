import { Corpus } from "../types/types";
import { kt_gracie_backend } from "declarations/kt-gracie-backend";
import { mapFromBackend } from "./mappers/corpusMapper";
import { setLocalStorage, getLocalStorage } from "../commons/utilts";


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