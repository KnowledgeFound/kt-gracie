import { Users, Target, BookOpen, Globe, Lightbulb } from 'lucide-react';
import type { Module, ModuleProgress, Lesson, ModuleAssessment } from './types';

// ─── Progress builder (same logic as old mockProgress.ts) ────────────────────

function makeProgress(
	moduleId: number,
	completed: number,
	lessonDefs: Omit<Lesson, 'id' | 'completed'>[],
): ModuleProgress {
	const total = lessonDefs.length;
	const lessons: Lesson[] = lessonDefs.map((l, i) => ({
		id: i + 1,
		...l,
		completed: i < completed,
	}));
	return {
		moduleId,
		startedAt: completed > 0 ? '2026-03-12T09:00:00Z' : null,
		completedLessons: completed,
		totalLessons: total,
		percentComplete: Math.round((completed / total) * 100),
		xpEarned: completed * 50,
		xpTotal: total * 50,
		currentLesson: { ...lessons[completed] ?? lessons[total - 1], completed: false },
		lessons,
	};
}

// ─── Shared assessment shapes per difficulty ──────────────────────────────────

function makeAssessments(base: string): ModuleAssessment[] {
	return [
		{
			id: 1,
			title: `Foundations of ${base}`,
			description: `Core definitions, key principles and the anatomy of ${base.toLowerCase()}.`,
			difficulty: 'easy',
			questionCount: 5,
			durationLabel: '1m',
			ktMax: 200,
			ktEarned: 115,
			status: 'completed',
		},
		{
			id: 2,
			title: `Prevention & Integrity`,
			description: 'Whistleblower protection, disclosure obligations and ethics frameworks.',
			difficulty: 'medium',
			questionCount: 7,
			durationLabel: '1m 30s',
			ktMax: 350,
			ktEarned: 125,
			status: 'in_progress',
		},
		{
			id: 3,
			title: `Enforcement & Compliance`,
			description: `Law, offences, mutual legal assistance and compliance in ${base.toLowerCase()}.`,
			difficulty: 'medium',
			questionCount: 8,
			durationLabel: '2m',
			ktMax: 350,
			status: 'available',
		},
		{
			id: 4,
			title: `International Cooperation`,
			description: 'Cross-border enforcement, treaties and asset repatriation.',
			difficulty: 'hard',
			questionCount: 5,
			durationLabel: '2m',
			ktMax: 525,
			status: 'locked',
		},
	];
}

// ─── Module definitions ───────────────────────────────────────────────────────

export const modules: Module[] = [
	{
		id: 1,
		name: 'Anti-Corruption',
		audience: 'Private Sector & Civil Society',
		icon: BookOpen,
		position: { top: 30, left: 24 },
		description:
			'Learn about the importance of anti-corruption efforts and how to combat corruption across sectors.',
		objectives: [
			'Identify core definitions of corruption under UNCAC',
			'Distinguish between bribery, embezzlement, and nepotism',
			'Understand conflict-of-interest and asset-disclosure obligations',
			'Apply international cooperation principles to cross-border cases',
			'Recognise corporate compliance and due-diligence requirements',
		],
		expectations: [
			'Anti-Corruption Bodies & frameworks',
			'UNCAC principles and enforcement',
			'Whistleblower protection mechanisms',
			'Asset recovery and repatriation',
		],
		assessments: makeAssessments('Anti-Corruption'),
		progress: makeProgress(1, 3, [
			{ title: 'What is Corruption?',   durationMin: 8  },
			{ title: 'Types of Corruption',   durationMin: 10 },
			{ title: 'Global Impact',         durationMin: 12 },
			{ title: 'Legal Frameworks',      durationMin: 15 },
			{ title: 'Whistleblowing',        durationMin: 10 },
			{ title: 'Anti-Corruption Bodies', durationMin: 12 },
			{ title: 'Case Studies',          durationMin: 18 },
			{ title: 'Taking Action',         durationMin: 10 },
		]),
	},
	{
		id: 2,
		name: 'Policy',
		audience: 'Government & Public Sector',
		icon: Target,
		position: { top: 52, left: 18 },
		description:
			'Explore the world of policy-making, including how policies are developed, implemented, and evaluated.',
		objectives: [
			'Understand the policy development cycle',
			'Map stakeholders and their influence',
			'Apply evidence-based approaches to policy',
			'Draft and evaluate policy briefs',
			'Navigate public consultation processes',
		],
		expectations: [
			'Policy fundamentals and cycles',
			'Stakeholder engagement strategies',
			'Evidence-based policy tools',
			'Writing effective policy briefs',
		],
		assessments: makeAssessments('Policy'),
		progress: makeProgress(2, 1, [
			{ title: 'Policy Fundamentals',    durationMin: 10 },
			{ title: 'Policy Cycle',           durationMin: 12 },
			{ title: 'Stakeholder Mapping',    durationMin: 8  },
			{ title: 'Evidence-Based Policy',  durationMin: 14 },
			{ title: 'Policy Evaluation',      durationMin: 10 },
			{ title: 'Writing Policy Briefs',  durationMin: 15 },
		]),
	},
	{
		id: 3,
		name: 'Youth Led',
		audience: 'Young People & Communities',
		icon: Users,
		position: { bottom: 20, left: 50 },
		description:
			'Discover the power of youth-led initiatives and how young people are driving change in their communities.',
		objectives: [
			'Identify youth-led advocacy strategies',
			'Build community engagement campaigns',
			'Understand governance and civic participation',
			'Develop peer-education skills',
			'Apply design thinking to social problems',
		],
		expectations: [
			'Youth governance and civic action',
			'Community campaign design',
			'Peer education methodologies',
			'Digital advocacy tools',
		],
		assessments: makeAssessments('Youth Leadership'),
		progress: null, // not started
	},
	{
		id: 4,
		name: 'Digital Innovation',
		audience: 'Tech & Civil Society',
		icon: Lightbulb,
		position: { top: 34, right: 24 },
		description:
			'Delve into digital innovation and learn about the latest technologies and trends shaping our future.',
		objectives: [
			'Understand AI, open data and civic tech',
			'Apply digital ethics principles',
			'Build technology-enabled solutions',
			'Evaluate digital transformation strategies',
			'Navigate data privacy regulations',
		],
		expectations: [
			'Emerging technologies overview',
			'AI & Society impacts',
			'Digital ethics and governance',
			'Civic technology applications',
		],
		assessments: makeAssessments('Digital Innovation'),
		progress: makeProgress(4, 5, [
			{ title: 'Digital Foundations',    durationMin: 10 },
			{ title: 'Emerging Technologies',  durationMin: 12 },
			{ title: 'AI & Society',           durationMin: 14 },
			{ title: 'Digital Ethics',         durationMin: 10 },
			{ title: 'Open Data',              durationMin: 8  },
			{ title: 'Civic Tech',             durationMin: 12 },
			{ title: 'Building Solutions',     durationMin: 18 },
		]),
	},
	{
		id: 5,
		name: 'Community',
		audience: 'Local Leaders & NGOs',
		icon: Globe,
		position: { bottom: 42, right: 12 },
		description:
			'Connect with others and learn about the importance of community engagement and development.',
		objectives: [
			'Understand community development principles',
			'Facilitate inclusive participation',
			'Design community monitoring systems',
			'Apply conflict-resolution techniques',
			'Build sustainable local coalitions',
		],
		expectations: [
			'Community engagement frameworks',
			'Participatory governance tools',
			'Local accountability mechanisms',
			'Coalition and partnership building',
		],
		assessments: makeAssessments('Community'),
		progress: null, // not started
	},
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/** Get a module by id, returns undefined if not found. */
export function getModule(id: number): Module | undefined {
	return modules.find((m) => m.id === id);
}

/** Get progress for a module, returns null if never started. */
export function getModuleProgress(moduleId: number): ModuleProgress | null {
	const m = getModule(moduleId);
	if (!m || !m.progress || m.progress.startedAt === null) return null;
	return m.progress;
}
