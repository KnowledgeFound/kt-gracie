import { Users, Target, BookOpen, Globe, Lightbulb } from 'lucide-react';
import { leveled } from '@/features/settings/readingLevel';
import type {
	Module,
	ModuleProgress,
	Lesson,
	ModuleAssessment,
	CityBlock,
	CityBlockId,
	CityBlockFloat,
} from './types';
import city_img from '/assets/city/city.png';
import anti_corruption_img from '/assets/city/anti-corruption.jpeg';
import community_img from '/assets/city/community.jpeg';
import policy_img from '/assets/city/policy.jpeg';
import youth_led_img from '/assets/city/youth-led.jpeg';
import digital_innovation_img from '/assets/city/digital-innovation.jpeg';
import { AssessmentType } from '@/ENUMS/enums';

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
		currentLesson: {
			...(lessons[completed] ?? lessons[total - 1]),
			completed: false,
		},
		lessons,
	};
}

// ─── Shared assessment shapes per difficulty ──────────────────────────────────

function makeAssessments(base: string): ModuleAssessment[] {
	const topic = base.toLowerCase();
	return [
		{
			id: 1,
			title: `Foundations of ${base}`,
			description: leveled(
				`The big ideas of ${topic}: what the main words mean and how it works.`,
				`Core definitions, key principles and the anatomy of ${topic}.`,
				`Foundational definitions, governing principles and the structural anatomy of ${topic}.`,
			),
			difficulty: 'easy',
			questionCount: 5,
			durationLabel: '1m',
			ktMax: 200,
			ktEarned: 115,
			status: 'completed',
			cards: [],
			questions: [],
			type: AssessmentType.QUIZ,
			keywords: [],
			sequenceNo: 1
		},
		{
			id: 2,
			title: `Prevention & Integrity`,
			description: leveled(
				'How people who speak up are kept safe, what must be shared openly, and the rules for doing the right thing.',
				'Whistleblower protection, disclosure obligations and ethics frameworks.',
				'Whistleblower protection regimes, statutory disclosure obligations and institutional ethics frameworks.',
			),
			difficulty: 'medium',
			questionCount: 7,
			durationLabel: '1m 30s',
			ktMax: 350,
			ktEarned: 125,
			status: 'in_progress',
			cards: [],
			questions: [],
			type: AssessmentType.FLASHCARD,
			keywords: [],
			sequenceNo: 2
		},
		{
			id: 3,
			title: `Enforcement & Compliance`,
			description: leveled(
				`The laws about ${topic}, what breaks them, how countries help each other, and how groups follow the rules.`,
				`Law, offences, mutual legal assistance and compliance in ${topic}.`,
				`Statutory offences, mutual legal assistance and organisational compliance obligations in ${topic}.`,
			),
			difficulty: 'medium',
			questionCount: 8,
			durationLabel: '2m',
			ktMax: 350,
			status: 'available',
			cards: [],
			questions: [],
			type: AssessmentType.QUIZ,
			keywords: [],
			sequenceNo: 3
		},
		{
			id: 4,
			title: `International Cooperation`,
			description: leveled(
				'How countries work together, the agreements they sign, and how stolen money is returned.',
				'Cross-border enforcement, treaties and asset repatriation.',
				'Cross-border enforcement, treaty mechanisms and the repatriation of illicit assets.',
			),
			difficulty: 'hard',
			questionCount: 5,
			durationLabel: '2m',
			ktMax: 525,
			status: 'locked',
			cards: [],
			questions: [],
			type: AssessmentType.QUIZ,
			keywords: [],
			sequenceNo: 4
		},
	];
}

// ─── City block layout ────────────────────────────────────────────────────────

/**
 * Geometry of the five floating districts, in percentages of the `.cityBlocks`
 * stage. This is the only place the map layout is described: the district
 * images, their hover glow and the module buttons that sit on top of them are
 * all positioned from these numbers.
 *
 * `labelBias` is where on a district its module button clips on, given as a
 * fraction of that district's own `box` rather than of the stage:
 *
 *   x — 0 is the box's left edge, 0.5 its middle, 1 its right edge
 *   y — 0 is the box's top edge,  0.5 its middle, 1 its bottom edge
 *
 * `cityBlocks` (below) resolves the pair against the box into `anchor`, an
 * absolute point in stage percentages:
 *
 *   anchor.x = box.left + box.width  * labelBias.x
 *   anchor.y = box.top  + box.height * labelBias.y
 *
 * The button is *centred* on that point — `.cityModuleAnchor` in city.css
 * pulls it back by half its own width and height — so the bias marks where the
 * middle of the pill lands, not a corner of it. Because the bias is a fraction
 * of a box that is itself a percentage of the stage, the button keeps the same
 * spot on the artwork at every viewport size; nothing here is in pixels.
 *
 * Why the default y sits at 0.7 rather than 0.5: each district is drawn as a
 * floating island with a rock hanging underneath it. Roughly the top half of
 * the image is the plateau and its buildings, and the lower part is rock and
 * empty space. Dead centre would drop the pill on top of the buildings, so 0.7
 * puts it across the island's front edge instead, where it reads as a label
 * pinned to the district rather than something covering it.
 *
 * Districts whose artwork or surroundings don't suit the default override it
 * (see `leftDown`, which has to clear Gracie's speech bubble). When tuning:
 * lower y moves a button up, higher x moves it right, and values want to stay
 * inside roughly 0.25–0.85 — beyond that the pill drifts onto the transparent
 * margin of the PNG and stops looking attached to anything.
 *
 * One assumption worth knowing: the images are `object-fit: contain` inside
 * their boxes, and the artwork's aspect ratio is close enough to the boxes'
 * (both about 5:4) that a fraction of the box is effectively a fraction of the
 * picture. Swapping in art with a very different shape would letterbox it
 * inside the box and shift every button on that district.
 */
const DEFAULT_LABEL_BIAS = { x: 0.5, y: 0.7 };

const BLOCK_LAYOUT: Record<
	CityBlockId,
	{
		src: string;
		box: { left: number; top: number; width: number; height: number };
		float: CityBlockFloat;
		labelBias?: { x?: number; y?: number };
		z?: number;
	}
> = {
	leftUp: {
		src: '/assets/city/block-left-up.png',
		box: { left: -4, top: 10, width: 50, height: 50 },
		float: 'float',
		labelBias: { x: 0.42, y: 0.6 },
	},
	rightUp: {
		src: '/assets/city/block-right-up.png',
		box: { left: 54, top: 5, width: 50, height: 50 },
		float: 'floatReverse',
		labelBias: { x: 0.64, y: 0.4 },
	},
	central: {
		src: '/assets/city/block-central.png',
		box: { left: 30, top: 30, width: 40, height: 40 },
		float: 'floatSlow',
		z: 2,
	},
	leftDown: {
		src: '/assets/city/block-left-down.png',
		box: { left: -10, top: 50, width: 50, height: 50 },
		float: 'floatReverse',
		// Gracie docks on this corner and her speech bubble covers the island's
		// front edge, so this button sits on the upper-right plateau instead.
		labelBias: { x: 0.75, y: 0.3 },
	},
	rightDown: {
		src: '/assets/city/block-right-down.png',
		box: { left: 60, top: 50, width: 50, height: 50 },
		float: 'float',
		labelBias: { x: 0.75, y: 0.4 },
		// labelBias: { x: 0.58, y: 0.6 },
	},
};

// ─── Module definitions ───────────────────────────────────────────────────────

export const modules: Module[] = [
	{
		id: 1,
		kuId: 'KU-001',
		name: 'Anti-Corruption',
		audience: 'Private Sector & Civil Society',
		image: anti_corruption_img,
		lessons: 8,
		ktReward:400,
		level: 'Beginner',
		duration: '2 hours',
		icon: BookOpen,
		block: 'leftUp',
		description: leveled(
			'Learn what corruption is, why it hurts people, and simple ways everyone can help stop it.',
			'Learn about the importance of anti-corruption efforts and how to combat corruption across sectors.',
			'Examine the rationale for anti-corruption regimes and the mechanisms for countering corruption across the public, private and civil-society sectors.',
		),
		objectives: leveled(
			[
				'Say what corruption means in your own words',
				'Tell the difference between a bribe, stealing money, and helping only family or friends',
				'Know why leaders must be open about what they own and who they help',
				'See how countries work together when a problem crosses a border',
				'Spot the rules a business must follow to stay honest',
			],
			[
				'Identify core definitions of corruption under UNCAC',
				'Distinguish between bribery, embezzlement, and nepotism',
				'Understand conflict-of-interest and asset-disclosure obligations',
				'Apply international cooperation principles to cross-border cases',
				'Recognise corporate compliance and due-diligence requirements',
			],
			[
				'Analyse the definitional scope of corruption offences under UNCAC',
				'Differentiate bribery, embezzlement, trading in influence and nepotism as distinct offences',
				'Evaluate conflict-of-interest management and asset-declaration regimes',
				'Apply mutual legal assistance and extradition principles to cross-border cases',
				'Assess corporate compliance programmes against due-diligence standards',
			],
		),
		expectations: leveled(
			[
				'The groups that stop corruption',
				'The world agreement on corruption (UNCAC)',
				'Keeping people safe when they speak up',
				'Getting stolen money back',
			],
			[
				'Anti-Corruption Bodies & frameworks',
				'UNCAC principles and enforcement',
				'Whistleblower protection mechanisms',
				'Asset recovery and repatriation',
			],
			[
				'Anti-corruption agencies and institutional frameworks',
				'UNCAC obligations and enforcement architecture',
				'Whistleblower protection legislation and reporting channels',
				'Asset recovery, confiscation and repatriation procedures',
			],
		),
		assessments: makeAssessments('Anti-Corruption'),
		progress: makeProgress(1, 3, [
			{ title: 'What is Corruption?', durationMin: 8 },
			{ title: 'Types of Corruption', durationMin: 10 },
			{ title: 'Global Impact', durationMin: 12 },
			{ title: 'Legal Frameworks', durationMin: 15 },
			{ title: 'Whistleblowing', durationMin: 10 },
			{ title: 'Anti-Corruption Bodies', durationMin: 12 },
			{ title: 'Case Studies', durationMin: 18 },
			{ title: 'Taking Action', durationMin: 10 },
		]),
	},
	{
		id: 2,
		kuId: 'KU-002',
		name: 'Policy',
		audience: 'Government & Public Sector',
		image: policy_img,
		icon: Target,
		block: 'leftDown',
		lessons: 8,
		ktReward:400,
		level: 'Beginner',
		duration: '2 hours',
		description: leveled(
			'Find out how the rules that shape our lives are made, put into action, and checked to see if they work.',
			'Explore the world of policy-making, including how policies are developed, implemented, and evaluated.',
			'Explore the policy-making process: agenda-setting, formulation, implementation and evaluation in public institutions.',
		),
		objectives: leveled(
			[
				'Know the steps for making a new rule',
				'Find out who cares about a rule and who can change it',
				'Use facts and evidence to make better rules',
				'Write a short note that explains a rule clearly',
				'Learn how to ask the public what they think',
			],
			[
				'Understand the policy development cycle',
				'Map stakeholders and their influence',
				'Apply evidence-based approaches to policy',
				'Draft and evaluate policy briefs',
				'Navigate public consultation processes',
			],
			[
				'Critically analyse each stage of the policy cycle',
				'Conduct stakeholder mapping and influence analysis',
				'Apply evidence-based and impact-assessment methodologies',
				'Draft, critique and evaluate policy briefs for decision-makers',
				'Design and manage statutory public consultation processes',
			],
		),
		expectations: leveled(
			[
				'What a policy is and how it is made',
				'Working with the people a rule affects',
				'Using facts to make good rules',
				'Writing clear notes about a rule',
			],
			[
				'Policy fundamentals and cycles',
				'Stakeholder engagement strategies',
				'Evidence-based policy tools',
				'Writing effective policy briefs',
			],
			[
				'Policy cycle theory and institutional practice',
				'Stakeholder engagement and consultation strategy',
				'Evidence-based policy instruments and impact assessment',
				'Drafting persuasive policy briefs',
			],
		),
		assessments: makeAssessments('Policy'),
		progress: makeProgress(2, 1, [
			{ title: 'Policy Fundamentals', durationMin: 10 },
			{ title: 'Policy Cycle', durationMin: 12 },
			{ title: 'Stakeholder Mapping', durationMin: 8 },
			{ title: 'Evidence-Based Policy', durationMin: 14 },
			{ title: 'Policy Evaluation', durationMin: 10 },
			{ title: 'Writing Policy Briefs', durationMin: 15 },
		]),
	},
	{
		id: 3,
		kuId: 'KU-003',
		name: 'Youth Led',
		audience: 'Young People & Communities',
		icon: Users,
		image: youth_led_img,
		block: 'central',
		lessons: 8,
		ktReward:400,
		level: 'Beginner',
		duration: '2 hours',
		description: leveled(
			'See how young people are making their towns and cities better, and how you can start too.',
			'Discover the power of youth-led initiatives and how young people are driving change in their communities.',
			'Examine youth-led initiatives as drivers of civic change: organising models, advocacy strategy and community impact.',
		),
		objectives: leveled(
			[
				'Learn ways young people speak up for change',
				'Plan a project that brings your community together',
				'Understand how decisions are made and how you can take part',
				'Learn how to teach and support friends your own age',
				'Use creative thinking to solve real problems',
			],
			[
				'Identify youth-led advocacy strategies',
				'Build community engagement campaigns',
				'Understand governance and civic participation',
				'Develop peer-education skills',
				'Apply design thinking to social problems',
			],
			[
				'Evaluate youth-led advocacy strategies and their theories of change',
				'Design and run community engagement campaigns',
				'Analyse governance structures and pathways for civic participation',
				'Develop peer-education and facilitation methodologies',
				'Apply design-thinking frameworks to complex social problems',
			],
		),
		expectations: leveled(
			[
				'Young people taking part in decisions',
				'Planning a community project',
				'Teaching and helping friends learn',
				'Using the internet to spread a message',
			],
			[
				'Youth governance and civic action',
				'Community campaign design',
				'Peer education methodologies',
				'Digital advocacy tools',
			],
			[
				'Youth governance structures and civic action models',
				'Community campaign strategy and design',
				'Peer-education pedagogy and facilitation',
				'Digital advocacy tools and online organising',
			],
		),
		assessments: makeAssessments('Youth Leadership'),
		progress: null, // not started
	},
	{
		id: 4,
		kuId: 'KU-004',
		name: 'Digital Innovation',
		image: digital_innovation_img,
		audience: 'Tech & Civil Society',
		icon: Lightbulb,
		block: 'rightUp',
		lessons: 8,
		ktReward:400,
		level: 'Beginner',
		duration: '2 hours',
		description: leveled(
			'Explore new technology, like computers that can learn, and see how it is changing the way we live.',
			'Delve into digital innovation and learn about the latest technologies and trends shaping our future.',
			'Investigate digital innovation: emerging technologies, data governance and the trends reshaping public life.',
		),
		objectives: leveled(
			[
				'Learn what AI and open data are',
				'Know how to use technology in a fair and kind way',
				'Build simple tools that help people',
				'See how groups change when they go digital',
				'Understand the rules that keep your data safe',
			],
			[
				'Understand AI, open data and civic tech',
				'Apply digital ethics principles',
				'Build technology-enabled solutions',
				'Evaluate digital transformation strategies',
				'Navigate data privacy regulations',
			],
			[
				'Analyse AI, open-data and civic-technology ecosystems',
				'Apply digital ethics and algorithmic accountability principles',
				'Architect technology-enabled solutions for public problems',
				'Evaluate digital transformation strategies and their governance',
				'Interpret data-protection and privacy regulation in practice',
			],
		),
		expectations: leveled(
			[
				'New technology and what it does',
				'How AI changes our lives',
				'Being fair and safe online',
				'Technology that helps a community',
			],
			[
				'Emerging technologies overview',
				'AI & Society impacts',
				'Digital ethics and governance',
				'Civic technology applications',
			],
			[
				'Emerging technologies and adoption dynamics',
				'Societal impacts of AI and automation',
				'Digital ethics, governance and regulation',
				'Civic technology applications and open-data platforms',
			],
		),
		assessments: makeAssessments('Digital Innovation'),
		progress: makeProgress(4, 5, [
			{ title: 'Digital Foundations', durationMin: 10 },
			{ title: 'Emerging Technologies', durationMin: 12 },
			{ title: 'AI & Society', durationMin: 14 },
			{ title: 'Digital Ethics', durationMin: 10 },
			{ title: 'Open Data', durationMin: 8 },
			{ title: 'Civic Tech', durationMin: 12 },
			{ title: 'Building Solutions', durationMin: 18 },
		]),
	},
	{
		id: 5,
		kuId: 'KU-005',
		name: 'Community',
		audience: 'Local Leaders & NGOs',
		image: community_img,
		icon: Globe,
		block: 'rightDown',
		lessons: 8,
		ktReward:400,
		level: 'Beginner',
		duration: '2 hours',
		description: leveled(
			'Meet your neighbours, learn why working together matters, and see how a community grows stronger.',
			'Connect with others and learn about the importance of community engagement and development.',
			'Examine community engagement and development practice: participation, accountability and coalition-building.',
		),
		objectives: leveled(
			[
				'Learn what makes a community strong',
				'Make sure everyone gets a chance to join in',
				'Set up simple ways to check how the community is doing',
				'Learn how to calm a disagreement',
				'Bring groups together to work as a team',
			],
			[
				'Understand community development principles',
				'Facilitate inclusive participation',
				'Design community monitoring systems',
				'Apply conflict-resolution techniques',
				'Build sustainable local coalitions',
			],
			[
				'Critique community development principles and models',
				'Facilitate inclusive, representative participation',
				'Design community-led monitoring and social accountability systems',
				'Apply mediation and conflict-resolution methodologies',
				'Build and sustain multi-stakeholder local coalitions',
			],
		),
		expectations: leveled(
			[
				'How a community works together',
				'Letting everyone have a say',
				'Checking that leaders keep their promises',
				'Teaming up with other groups',
			],
			[
				'Community engagement frameworks',
				'Participatory governance tools',
				'Local accountability mechanisms',
				'Coalition and partnership building',
			],
			[
				'Community engagement frameworks and practice',
				'Participatory governance instruments',
				'Local accountability and social audit mechanisms',
				'Coalition, partnership and network building',
			],
		),
		assessments: makeAssessments('Community'),
		progress: null, // not started
	},
];

// ─── City blocks ──────────────────────────────────────────────────────────────

/**
 * The districts to render on the map, derived from {@link modules} so every
 * block always has a module behind it (and vice versa). Ordered by module id.
 */
export const cityBlocks: CityBlock[] = modules.map((m) => {
	const layout = BLOCK_LAYOUT[m.block];
	return {
		id: m.block,
		moduleId: m.id,
		src: layout.src,
		alt: `${m.name} district`,
		box: layout.box,
		anchor: {
			x:
				layout.box.left +
				layout.box.width * (layout.labelBias?.x ?? DEFAULT_LABEL_BIAS.x),
			y:
				layout.box.top +
				layout.box.height * (layout.labelBias?.y ?? DEFAULT_LABEL_BIAS.y),
		},
		float: layout.float,
		z: layout.z ?? 1,
	};
});

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/** Get a module by id, returns undefined if not found. */
export function getModule(id: number): Module | undefined {
	return modules.find((m) => m.id === id);
}

/** The district a module sits on, undefined if the module is unknown. */
export function getCityBlock(moduleId: number): CityBlock | undefined {
	return cityBlocks.find((b) => b.moduleId === moduleId);
}

/** The module a district represents, undefined if the block is unknown. */
export function getBlockModule(blockId: CityBlockId): Module | undefined {
	return modules.find((m) => m.block === blockId);
}

/** Get progress for a module, returns null if never started. */
export function getModuleProgress(moduleId: number): ModuleProgress | null {
	const m = getModule(moduleId);
	if (!m || !m.progress || m.progress.startedAt === null) return null;
	return m.progress;
}
