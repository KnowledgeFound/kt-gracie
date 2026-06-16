/**
 * Mock module-progress data.
 *
 * Shape is intentionally close to what a real backend would return so the
 * swap is a one-line change: replace `MOCK_PROGRESS[id]` with a hook call.
 *
 * TODO: replace with `useModuleProgress(moduleId)` when the backend is ready.
 */

export interface Lesson {
	id: number;
	title: string;
	durationMin: number;
	completed: boolean;
}

export interface ModuleProgress {
	moduleId: number;
	/** null  → module has never been started */
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

// ─── Mock data ────────────────────────────────────────────────────────────────

const make = (
	moduleId: number,
	completed: number,
	lessons: Omit<Lesson, 'id'>[],
): ModuleProgress => {
	const total = lessons.length;
	return {
		moduleId,
		startedAt: completed > 0 ? '2026-03-12T09:00:00Z' : null,
		completedLessons: completed,
		totalLessons: total,
		percentComplete: Math.round((completed / total) * 100),
		xpEarned: completed * 50,
		xpTotal: total * 50,
		currentLesson: {
			id: completed + 1,
			...(lessons[completed] ?? lessons[lessons.length - 1]),
			completed: false,
		},
		lessons: lessons.map((l, i) => ({
			id: i + 1,
			...l,
			completed: i < completed,
		})),
	};
};

export const MOCK_PROGRESS: Record<number, ModuleProgress> = {
	1: make(1, 3, [
		{ title: 'What is Corruption?', durationMin: 8, completed: false },
		{ title: 'Types of Corruption', durationMin: 10, completed: false },
		{ title: 'Global Impact', durationMin: 12, completed: false },
		{ title: 'Legal Frameworks', durationMin: 15, completed: false },
		{ title: 'Whistleblowing', durationMin: 10, completed: false },
		{ title: 'Anti-Corruption Bodies', durationMin: 12, completed: false },
		{ title: 'Case Studies', durationMin: 18, completed: false },
		{ title: 'Taking Action', durationMin: 10, completed: false },
	]),
	2: make(2, 1, [
		{ title: 'Policy Fundamentals', durationMin: 10, completed: false },
		{ title: 'Policy Cycle', durationMin: 12, completed: false },
		{ title: 'Stakeholder Mapping', durationMin: 8, completed: false },
		{ title: 'Evidence-Based Policy', durationMin: 14, completed: false },
		{ title: 'Policy Evaluation', durationMin: 10, completed: false },
		{ title: 'Writing Policy Briefs', durationMin: 15, completed: false },
	]),
	// Modules 3–5 not started yet (no entry → not started)
	4: make(4, 5, [
		{ title: 'Digital Foundations', durationMin: 10, completed: false },
		{ title: 'Emerging Technologies', durationMin: 12, completed: false },
		{ title: 'AI & Society', durationMin: 14, completed: false },
		{ title: 'Digital Ethics', durationMin: 10, completed: false },
		{ title: 'Open Data', durationMin: 8, completed: false },
		{ title: 'Civic Tech', durationMin: 12, completed: false },
		{ title: 'Building Solutions', durationMin: 18, completed: false },
	]),
};


/** Returns progress for a module, or null if never started. */
export function getModuleProgress(moduleId: number): ModuleProgress | null {
	const p = MOCK_PROGRESS[moduleId] ?? null;
	if (!p || p.startedAt === null) return null;
	return p;
}
