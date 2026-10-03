import { useUser } from '@/features/auth';
import type { Module } from '../types';
import { useCityLook } from './useCityLook';

/**
 * The artwork to show for a module right now: its ruined version while the
 * city is corrupt or destroyed, the healthy one otherwise. Used by the
 * district card and as the backdrop of the course screens.
 */
export function useModuleImage(module?: Module | null): string | undefined {
	const { city } = useUser();
	const look = useCityLook(city);
	if (!module) return undefined;
	return look === 'normal' ? module.image : module.corruptImage ?? module.image;
}
