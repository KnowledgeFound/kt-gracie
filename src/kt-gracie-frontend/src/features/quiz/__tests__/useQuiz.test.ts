import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockUser = vi.hoisted(() => ({
    user: { anonymousId: "user-1" },
    creditTokens: vi.fn(),
}));

vi.mock("@/features/auth", () => ({
    useUser: () => mockUser,
}));

vi.mock("@/features/subject", () => ({
    useSubjectById: () => ({ isLoading: false, data: null }),
}));

import { useQuiz } from "../hooks/useQuiz";

beforeEach(() => {
    vi.clearAllMocks();
});

// Drive a full quiz run. Omitting a pick leaves the question unanswered
// (counts as wrong). Returns the hook result.
function runQuiz(pickAnswer?: (question: { correctAnswer: string | boolean }) => string | boolean | null) {
    const { result } = renderHook(() => useQuiz());

    act(() => result.current.startQuiz());

    const total = result.current.quizQuestions.length;

    for (let i = 0; i < total; i++) {
        const q = result.current.quizQuestions[i];
        const pick = pickAnswer?.(q) ?? null;
        act(() => result.current.selectOption(pick));
        if (i < total - 1) act(() => result.current.nextQuestion());
    }
    // Final "nextQuestion" on the last question triggers submitQuiz, so the
    // last answer must have flushed above before the score is computed.
    act(() => result.current.nextQuestion());

    return result;
}

describe("useQuiz token reward", () => {
    it("awards 1 KT per correct answer and exposes tokensEarned", () => {
        const result = runQuiz((q) => q.correctAnswer);
        const total = result.current.quizQuestions.length;

        expect(result.current.screen).toBe("results");
        expect(result.current.score).toBe(total);
        expect(result.current.tokensEarned).toBe(total);
        expect(mockUser.creditTokens).toHaveBeenCalledExactlyOnceWith(
            BigInt(total),
            "reward",
            "quiz-general"
        );
    });

    it("awards 0 KT when nothing is answered correctly", () => {
        const result = runQuiz();

        expect(result.current.screen).toBe("results");
        expect(result.current.score).toBe(0);
        expect(result.current.tokensEarned).toBe(0);
        expect(mockUser.creditTokens).not.toHaveBeenCalled();
    });

    it("credits only once per submission (double-click guard)", () => {
        const result = runQuiz((q) => q.correctAnswer);

        act(() => result.current.nextQuestion());

        expect(mockUser.creditTokens).toHaveBeenCalledTimes(1);
    });
});