import { ComponentType } from 'react';

// ─── Lesson & Progress ────────────────────────────────────────────────────────

export interface Lesson {
	id: number;
	title: string;
	durationMin: number;
	completed: boolean;
}

export interface ModuleProgress {
	moduleId: number;
	/** null → module has never been started */
	startedAt: string | null;
	completedLessons: number;
	totalLessons: number;
	/** 0–100 */
	percentComplete: number;
	currentLesson: Lesson;
	xpEarned: number;
	xpTotal: number;
	lessons: Lesson[];
}

// ─── Assessment (quiz card shown in WelcomeScreen) ────────────────────────────

export type AssessmentDifficulty = 'easy' | 'medium' | 'hard';
export type AssessmentStatus = 'completed' | 'in_progress' | 'available' | 'locked';

export interface ModuleAssessment {
	id: number;
	title: string;
	description: string;
	difficulty: AssessmentDifficulty;
	questionCount: number;
	durationLabel: string;
	/** Max KT that can be earned */
	ktMax: number;
	/** KT earned in best run, undefined = never attempted */
	ktEarned?: number;
	status: AssessmentStatus;
}

// ─── Module ───────────────────────────────────────────────────────────────────

export interface Module {
	id: number;
	name: string;
	description: string;
	/** Short audience label shown under the title */
	audience: string;
	icon: ComponentType<{ className?: string }>;
	position: {
		top?: number;
		left?: number;
		right?: number;
		bottom?: number;
	};
	/** Learning objectives shown on WelcomeScreen left panel */
	objectives: string[];
	/** What learners will cover — shown in ModuleDrawer "not started" body */
	expectations: string[];
	/** Ordered list of quiz assessments for this module */
	assessments: ModuleAssessment[];
	/** Live progress, null if never started */
	progress: ModuleProgress | null;
}
