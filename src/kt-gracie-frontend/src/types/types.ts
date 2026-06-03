export type Assessment = {
    id: bigint;
    title: string;
    assessmentType: string;
    maxScore: bigint;
    currentScore: bigint;
};

export type Subject = {
    id: bigint;
    name: string;
    code: string;
    duration: bigint; // Metric still has to be decided
    description: string;
    assessments: Assessment[];
};

export type CreateSubjectInput = {
  name: string;
  code: string;
  duration: bigint;
  description: string;
};
