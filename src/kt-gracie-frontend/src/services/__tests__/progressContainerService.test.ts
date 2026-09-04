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
    getMaxScore,
    getProgressContainer
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
                    achievments: []
                },
                {
                    knowledgeUnitID: "ku4",
                    subProgress: [
                        { score: 18, maxScore: 25, completed: true }
                    ],
                    achievments: []
                }
            ]
        });

        const totalMaxScore = getMaxScore();
        
        expect(totalMaxScore).toBe(100);
        
        //Verify that service actually called getLocalStorage
        expect(getLocalStorage).toHaveBeenCalled();
    });

    it("should return the correct max score", () => {
        const maxScore = getMaxScore();
        
        expect(typeof maxScore).toBe("number");
        expect(maxScore).toBeGreaterThanOrEqual(0);
    });

    it("should return formatted score details", () => {
        const scoreDetails = getScoreDetails();
        
        expect(scoreDetails).toBeDefined();
        expect(scoreDetails.currentScore).toBe(78);
        expect(scoreDetails.maxScore).toBe(100);
        expect(scoreDetails.percentage).toBe(78);
        expect(scoreDetails.encouragementMessage).toBe("Solid effort—you’ve got real momentum!");
    });

    // it("should handle missing data gracefully (e.g., return 0)", () => {
    //     (getLocalStorage as ReturnType<typeof vi.fn>).mockReturnValue(null);

    //     const totalScore = getTotalScore();
        
    //     expect(totalScore).toBe(0); 
    // });
    
    // it("should return a valid progress container", () => {
    //     (getLocalStorage as ReturnType<typeof vi.fn>).mockReturnValue({
    //         arr_progress: []
    //     });

    //     const progressContainer = getProgressContainer();
        
    //     //Properties you expect the container to have
    //     expect(progressContainer).not.toBeNull();
    // });

    // it("should return the correct total score", () => {
    //     const totalScore = getTotalScore();
        
    //     expect(typeof totalScore).toBe("number");
    //     // expect(totalScore).toBe(); 
    // });
});