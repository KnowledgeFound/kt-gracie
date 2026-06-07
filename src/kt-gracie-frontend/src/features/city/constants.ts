import { Users, Target, BookOpen, Globe, Lightbulb } from 'lucide-react';
export const modules = [
	{
		id: 1,
		name: 'Anti Corruption',
		icon: BookOpen,
		position: {
			top: 30,
			left: 24,
		},
		description:
			'Learn about the importance of anti-corruption efforts and how to combat corruption in various sectors.',
	},
	{
		id: 2,
		name: 'Policy',
		icon: Target,
		position: {
			top: 52,
			left: 18,
		},
		description:
			'Explore the world of policy-making, including how policies are developed, implemented, and evaluated.',
	},
	{
		id: 3,
		name: 'Youth Led',
		icon: Users,
		description:
			'Discover the power of youth-led initiatives and how young people are driving change in their communities and beyond.',
		position: {
			bottom: 20,
			left: 50,
		},
	},
	{
		id: 4,
		name: 'Digital Innovation',
		icon: Lightbulb,
		position: {
			top: 34,
			right: 24,
		},
		description:
			'Delve into the world of digital innovation and learn about the latest technologies and trends shaping our future.',
	},
	{
		id: 5,
		name: 'Community',
		icon: Globe,
		position: {
			bottom: 42,
			right: 12,
		},

		description:
			'Connect with others and learn about the importance of community engagement and development.',
	},
];
