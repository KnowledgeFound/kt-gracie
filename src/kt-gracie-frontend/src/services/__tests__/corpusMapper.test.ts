import { describe, expect, it } from "vitest";
import { mapFromBackend } from "../mappers/corpusMapper";

describe("mapFromBackend", () => {
  it("maps the KnowledgeUnit metadata fields added to the schema", () => {
    const backendCorpus = {
      schema: "https://json-schema.org/draft/2020-12/schema",
      id: "corpus-id",
      title: "Test Corpus",
      description: "Corpus description",
      typeOfObject: "object",
      additionalProperties: false,
      numberOfModules: 1n,
      numberOfAssessments: 1n,
      knowledgeUnits: [
        {
          id: "ku-1",
          topic: "Topic one",
          difficulty: { EASY: null },
          prerequisites: ["ku-0"],
          learningObjectives: ["Learn basics"],
          expectations: ["State the framework"],
          image: "anti_corruption_img.png",
          description: "This unit covers basics.",
          icon: "BookOpen",
          block: "leftUp",
          duration: "30 minutes",
          sources: [],
          teachings: [],
          assessments: [],
          tokenReward: 10n,
          summary: {
            id: 1n,
            inforgraphic: [],
            slideDeck: [],
            podcast: [],
          },
        },
      ],
    } as any;

    const mapped = mapFromBackend(backendCorpus);

    expect(mapped.knowledgeUnits[0]).toMatchObject({
      id: "ku-1",
      expectations: ["State the framework"],
      image: "anti_corruption_img.png",
      description: "This unit covers basics.",
      icon: "BookOpen",
      block: "leftUp",
      duration: "30 minutes",
      prerequisites: ["ku-0"],
      learningObjectives: ["Learn basics"],
    });
  });
});
