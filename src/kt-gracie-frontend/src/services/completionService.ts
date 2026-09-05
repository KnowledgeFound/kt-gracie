import { getProgressFromContainer, addProgressToContainer } from "./progressContainerService";
import { Progress } from "@/types/user";
import { CompletedScore } from "@/ENUMS/enums";

// Marks a SubProgress as completed for a given knowledge unit and assessment ID
export function completeAssessment(knowledgeUnitID: string, assessmentID: number): void {
    const progress = getProgressFromContainer(knowledgeUnitID);


    if (progress) {

        const subProgress = progress.subProgress.find(sp => sp.assessmentID === assessmentID);

        if (subProgress && subProgress.score >= subProgress.maxScore) {
            subProgress.completed = true;
        }
        
        validateProgress(progress);

        addProgressToContainer(progress);
    }
}

export function completeTeaching(knowledgeUnitID: string, teachingID: number): void {
    const progress = getProgressFromContainer(knowledgeUnitID);

    if (progress) {
        const subProgressTeaching = progress.subProgressTeachings.find(sp => sp.teachingID === teachingID);

        if (subProgressTeaching) {
            subProgressTeaching.completed = true;
        }

        validateProgress(progress);

        addProgressToContainer(progress);
    }
}

function validateProgress(progress: Progress): void {
    // calculate assessment completion based on subProgress
    const allAssessmentsCompleted = progress.subProgress.filter(sp => sp.completed).length;
    const totalNumberOfAssessments = progress.subProgress.length;

    const completion: number = allAssessmentsCompleted / totalNumberOfAssessments * 100;

    progress.assessment = getCompletetedScore(completion);

    // calculate teaching completion based on subProgressTeachings

    const allTeachingsCompleted = progress.subProgressTeachings.filter(sp => sp.completed).length;
    const totalNumberOfTeachings = progress.subProgressTeachings.length;

    const teachingCompletion: number = allTeachingsCompleted / totalNumberOfTeachings * 100;

    progress.teaching = getCompletetedScore(teachingCompletion);

    if(progress.teaching === CompletedScore.HUNDRED && progress.assessment === CompletedScore.HUNDRED)
    {
        progress.completed = true;
        // add achievements logic here if needed
    }
}

function getCompletetedScore(completion: number): CompletedScore {
    if(completion > 0 && completion <= 10)
        return CompletedScore.TEN;
    else if(completion > 10 && completion <= 20)
        return CompletedScore.TWENTY;
    else if(completion > 20 && completion <= 30)
        return CompletedScore.THIRTY;
    else if(completion > 30 && completion <= 40)
        return CompletedScore.FORTY;
    else if(completion > 40 && completion <= 50)
        return CompletedScore.FIFTY;
    else if(completion > 50 && completion <= 60)
        return CompletedScore.SIXTY;
    else if(completion > 60 && completion <= 70)
        return CompletedScore.SEVENTY;
    else if(completion > 70 && completion <= 80)
        return CompletedScore.EIGHTY;
    else if(completion > 80 && completion <= 90)
        return CompletedScore.NINETY;
    else if(completion > 90 && completion <= 100)
        return CompletedScore.HUNDRED;
    else 
        return CompletedScore.ZERO;
}

