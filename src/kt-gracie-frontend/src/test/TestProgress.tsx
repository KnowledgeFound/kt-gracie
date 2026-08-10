import React, { useEffect, useState } from "react";
import {
    createProgress,
    deleteProgress,
    getAssessmentProgressTotal,
    getProgress,
    getProgressById,
    getProgressTotal,
    getTeachingProgressTotal,
    updateProgress,
} from "../services/progressService";

import { CompletedScore } from "../ENUMS/enums";

export function TestProgress() {
    const [result, setResult] = useState<string>("Loading...");

    useEffect(() => {
        deleteProgress();

        createProgress({
            knowledgeUnitID: "what-is-corruption",
            teaching: CompletedScore.THIRTY,
            assessment: CompletedScore.FIFTY,
        });

        createProgress({
            knowledgeUnitID: "what-is-drug-abuse",
            teaching: CompletedScore.TEN,
            assessment: CompletedScore.TWENTY,
        });

        updateProgress({
            knowledgeUnitID: "what-is-corruption",
            teaching: CompletedScore.FORTY,
            assessment: CompletedScore.SIXTY,
        });

        const allProgress = getProgress();
        const byId = getProgressById("what-is-corruption");
        const totals = getProgressTotal();
        const assessmentTotal = getAssessmentProgressTotal();
        const teachingTotal = getTeachingProgressTotal();

        setResult(JSON.stringify({ allProgress, byId, totals, assessmentTotal, teachingTotal }, null, 2));

    }, []);



    return (
        <div style={{ padding: "1rem" }}>
            <h2>Progress Service Test</h2>
            <pre>{result}</pre>
        </div>
    );
}
