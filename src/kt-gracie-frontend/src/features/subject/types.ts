// Mirror of the Candid-generated types — kept here so feature code
// never imports directly from declarations/.
export interface Subject {
	id: bigint;
	name: string;
	code: string;
	duration: bigint;
	description: string;
	assessments: Assessment[];
}

export interface Assessment {
	id: bigint;
	title: string;
	assessmentType: string;
	maxScore: bigint;
	currentScore: bigint;
}

/** Input shape for createSubjectMediator */
export interface CreateSubjectInput {
	name: string;
	code: string;
	/** Minutes / hours — unit TBD by backend */
	duration: number;
	description: string;
}
