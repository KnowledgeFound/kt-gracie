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

    if(completion > 0 && completion <= 10)
        progress.assessment = CompletedScore.TEN;
    else if(completion > 10 && completion <= 20)
        progress.assessment = CompletedScore.TWENTY;
    else if(completion > 20 && completion <= 30)
        progress.assessment = CompletedScore.THIRTY;
    else if(completion > 30 && completion <= 40)
        progress.assessment = CompletedScore.FORTY;
    else if(completion > 40 && completion <= 50)
        progress.assessment = CompletedScore.FIFTY;
    else if(completion > 50 && completion <= 60)
        progress.assessment = CompletedScore.SIXTY;
    else if(completion > 60 && completion <= 70)
        progress.assessment = CompletedScore.SEVENTY;
    else if(completion > 70 && completion <= 80)
        progress.assessment = CompletedScore.EIGHTY;
    else if(completion > 80 && completion <= 90)
        progress.assessment = CompletedScore.NINETY;
    else if(completion > 90 && completion <= 100)
        progress.assessment = CompletedScore.HUNDRED;
    else if(completion === 0)
        progress.assessment = CompletedScore.ZERO;

    const allTeachingsCompleted = progress.subProgressTeachings.filter(sp => sp.completed).length;
    const totalNumberOfTeachings = progress.subProgressTeachings.length;

    const teachingCompletion: number = allTeachingsCompleted / totalNumberOfTeachings * 100;

    if(teachingCompletion > 0 && teachingCompletion <= 10)
        progress.teaching = CompletedScore.TEN;
    else if(teachingCompletion > 10 && teachingCompletion <= 20)
        progress.teaching = CompletedScore.TWENTY;
    else if(teachingCompletion > 20 && teachingCompletion <= 30)
        progress.teaching = CompletedScore.THIRTY;
    else if(teachingCompletion > 30 && teachingCompletion <= 40)
        progress.teaching = CompletedScore.FORTY;
    else if(teachingCompletion > 40 && teachingCompletion <= 50)
        progress.teaching = CompletedScore.FIFTY;
    else if(teachingCompletion > 50 && teachingCompletion <= 60)
        progress.teaching = CompletedScore.SIXTY;
    else if(teachingCompletion > 60 && teachingCompletion <= 70)
        progress.teaching = CompletedScore.SEVENTY;
    else if(teachingCompletion > 70 && teachingCompletion <= 80)
        progress.teaching = CompletedScore.EIGHTY;
    else if(teachingCompletion > 80 && teachingCompletion <= 90)
        progress.teaching = CompletedScore.NINETY;
    else if(teachingCompletion > 90 && teachingCompletion <= 100)
        progress.teaching = CompletedScore.HUNDRED;
    else if(teachingCompletion === 0)
        progress.teaching = CompletedScore.ZERO;

    if(progress.teaching === CompletedScore.HUNDRED && progress.assessment === CompletedScore.HUNDRED)
    {
        progress.completed = true;
        // add achievements logic here if needed
    }
}

