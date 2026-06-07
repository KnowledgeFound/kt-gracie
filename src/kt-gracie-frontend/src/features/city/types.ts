import { ComponentType } from 'react';

export type Module = {
	id: number;
	name: string;
	description: string;
	icon: ComponentType<{ className?: string }>;
	position: {
		top?: number;
		left?: number;
		right?: number;
		bottom?: number;
	};
};
