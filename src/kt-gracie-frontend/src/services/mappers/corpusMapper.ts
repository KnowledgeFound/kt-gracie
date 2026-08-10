import { Corpus } from "../../types/types";

export function mapFromBackend(corpus: any): Corpus {
    return {
        schema: corpus.schema ?? "default_schema",
        id: corpus.id ?? "default_id",
        title: corpus.title ?? "default_title",
        description: corpus.description ?? "default_description",
        typeOfObject: corpus.typeOfObject ?? "default_type",
        additionalProperties: corpus.additionalProperties ?? false
    }
}; 