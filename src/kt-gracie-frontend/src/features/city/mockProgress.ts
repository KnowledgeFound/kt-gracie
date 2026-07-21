/**
 * @deprecated
 * Progress data has been merged into `constants.ts`.
 * This file re-exports from there for backward compatibility.
 * Update imports to use `@/features/city/constants` directly.
 */
export type { Lesson, ModuleProgress } from './types';
export { getModuleProgress } from './constants';
