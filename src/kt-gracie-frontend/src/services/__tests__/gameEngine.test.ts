import { describe, it, expect, vi, beforeEach } from "vitest";
import { quizQuestionRandomiser } from "../gameEngine";
import { Corpus } from "../../types/types";
import { getCorpus } from "../corpusService";

vi.mock("../corpusService", () => ({
  getCorpus: vi.fn(),
}));

describe("quizQuestionRandomiser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return specified number of quiz questions in a shuffled order", async () => {
    vi.mocked(getCorpus).mockResolvedValue({
          knowledgeUnits: [{
            assessments: [{
              quiz: {
                questions: Array.from({ length: 7 }, (_, index) => ({
                  questionText: `Question ${index + 1}`,
                  options: [],
                  correctAnswerIndex: 0,
                  hint: "",
                })),
              },
            }],
          }],
        } as unknown as Corpus);
    
    const result = await quizQuestionRandomiser(4);

    console.log("Result:", result.map((question) => question.questionText));
    expect(result.length).toBe(4);
    expect(result.map((question) => question.questionText)).not.toEqual([
     "Question 1",
     "Question 2",
     "Question 3",
     "Question 4",
    ]);
  }); 

  it("should return all quiz questions if requested number exceeds available questions", async () => {
        vi.mocked(getCorpus).mockResolvedValue({
          knowledgeUnits: [{
            assessments: [{
              quiz: {
                questions: Array.from({ length: 7 }, (_, index) => ({
                  questionText: `Question ${index + 1}`,
                  options: [],
                  correctAnswerIndex: 0,
                  hint: "",
                })),
              },
            }],
          }],
        } as unknown as Corpus);

    const result = await quizQuestionRandomiser(10);
    console.log("Result:", result.map((question) => question.questionText));

    expect(result.length).toBe(7); 
  });
});

