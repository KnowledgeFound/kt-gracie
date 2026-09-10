import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock(import("../../commons/utilts"), async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getLocalStorage: vi.fn(),
    };
});

import {
    getScoreDetails,
    getTotalScore,
    getMaxScore
} from "../progressContainerService";

import { getLocalStorage } from "../../commons/utilts";

describe("progressContainerService", () => {

    afterEach(() => {
        vi.clearAllMocks(); 
    });

    it("should return correct total max score when data exists in local storage", () => {
        (getLocalStorage as ReturnType<typeof vi.fn>).mockReturnValue({
            arr_progress: [
                {
                    knowledgeUnitID: "ku1",
                    subProgress: [
                        { score: 20, maxScore: 25, completed: true }
                    ],
                    subProgressTeachings: [
                        { teachingID: 1, topic: "Topic 1", completed: true },
                        { teachingID: 2, topic: "Topic 2", completed: false }
                    ],
                    achievments: []
                },
                {
                    knowledgeUnitID: "ku2",
                    subProgress: [
                        { score: 5, maxScore: 5, completed: true },
                        { score: 5, maxScore: 5, completed: true },
                        { score: 4, maxScore: 5, completed: true },
                        { score: 5, maxScore: 5, completed: true },
                        { score: 5, maxScore: 5, completed: true }
                    ],
                    subProgressTeachings: [
                        { teachingID: 3, topic: "Topic 3", completed: true },
                        { teachingID: 4, topic: "Topic 4", completed: false }
                    ],
                    achievments: []
                },
                {
                    knowledgeUnitID: "ku3",
                    subProgress: [
                        { score: 4, maxScore: 5, completed: true },
                        { score: 4, maxScore: 5, completed: true },
                        { score: 3, maxScore: 5, completed: true },
                        { score: 3, maxScore: 5, completed: true },
                        { score: 2, maxScore: 5, completed: true }
                    ],
                    subProgressTeachings: [
                        { teachingID: 5, topic: "Topic 5", completed: true },
                        { teachingID: 6, topic: "Topic 6", completed: false }
                    ],
                    achievments: []
                },
                {
                    knowledgeUnitID: "ku4",
                    subProgress: [
                        { score: 18, maxScore: 25, completed: true }
                    ],
                    subProgressTeachings: [
                        { teachingID: 7, topic: "Topic 7", completed: true },
                        { teachingID: 8, topic: "Topic 8", completed: false }
                    ],
                    achievments: []
                }
            ]
        });

        const totalMaxScore = getMaxScore();
        
        expect(totalMaxScore).toBe(108);
    });

    
    it("should return the correct total score", () => {
        const totalScore = getTotalScore();
        
        expect(typeof totalScore).toBe("number");
        expect(totalScore).toBe(82); 
    });

    it("should return formatted score details", () => {
        const scoreDetails = getScoreDetails();
        
        expect(scoreDetails).toBeDefined();
        expect(scoreDetails.currentScore).toBe(82);
        expect(scoreDetails.maxScore).toBe(108);
        expect(scoreDetails.percentage).toBeCloseTo(75.93, 1);
        expect(scoreDetails.encouragementMessage).toBe("Solid effort — you have got real momentum!");
    });

});