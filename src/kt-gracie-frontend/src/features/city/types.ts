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

// ─── City blocks (the floating districts on the map) ──────────────────────────

/** The five floating districts, named by where they sit on the map. */
export type CityBlockId =
	| 'leftUp'
	| 'rightUp'
	| 'central'
	| 'leftDown'
	| 'rightDown';

/** Float animation a district (and its module button) rides on. */
export type CityBlockFloat = 'float' | 'floatReverse' | 'floatSlow';

/**
 * A fire on a district. `x`/`y` mark the *base* of the flame as a fraction of
 * the district's box (same convention as `labelBias` in constants.ts); `size`
 * is the flame's width as a fraction of the box width.
 */
export interface CityBlockFire {
	x: number;
	y: number;
	size: number;
}

/**
 * A district's geometry, in percentages of the `.cityBlocks` stage — the
 * fixed-ratio box the whole map is laid out in. Both the district image and
 * its module button are positioned from these numbers, so they can never
 * drift apart.
 */
export interface CityBlock {
	id: CityBlockId;
	/** Module this district represents. */
	moduleId: number;
	src: string;
	/** Ruined artwork shown while the city is corrupt — same canvas as `src`. */
	corruptSrc: string;
	alt: string;
	/** Fires burning on the district while the city is corrupt. */
	fires: CityBlockFire[];
	/** Image box within the stage. */
	box: { left: number; top: number; width: number; height: number };
	/** Where the module button clips onto the district. */
	anchor: { x: number; y: number };
	float: CityBlockFloat;
	/** Stacking order within the stage (central overlaps its neighbours). */
	z: number;
}

// ─── Module ───────────────────────────────────────────────────────────────────

export interface Module {
	id: number;
	name: string;
	description: string;
	/** Short audience label shown under the title */
	audience: string;
	icon: ComponentType<{ className?: string }>;
	image: string;
	/** Which floating district on the city map this module lives on */
	block: CityBlockId;
	/** Learning objectives shown on WelcomeScreen left panel */
	objectives: string[];
	/** What learners will cover — shown in ModuleDrawer "not started" body */
	expectations: string[];
	/** Ordered list of quiz assessments for this module */
	assessments: ModuleAssessment[];
	/** Live progress, null if never started */
	progress: ModuleProgress | null;
}
