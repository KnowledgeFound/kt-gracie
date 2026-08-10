import { Corpus } from "../types/types";
import { kt_gracie_backend } from "declarations/kt-gracie-backend";
import { mapFromBackend } from "./mappers/corpusMapper";

export async function getCorpus(): Promise<Corpus> {
    const corpus = await kt_gracie_backend.getCorpus();

    return mapFromBackend(corpus);
}