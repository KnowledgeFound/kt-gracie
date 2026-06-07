import { backendActor } from '@/services/canister/actors';
import type { Subject, CreateSubjectInput } from '../types';

/** Fetch all subjects from the canister. */
export async function fetchSubjects(): Promise<Subject[]> {
	const raw = await backendActor.getSubjectArray();
	return raw as unknown as Subject[];
}

/** Fetch a single subject by its numeric id. Returns null if not found. */
export async function fetchSubjectById(id: bigint): Promise<Subject | null> {
	const raw = await backendActor.getSubjectById(id);
	// Candid optional: [] = null, [value] = Some(value)
	if (!raw || (Array.isArray(raw) && raw.length === 0)) return null;
	const value = Array.isArray(raw) ? raw[0] : raw;
	return value as unknown as Subject;
}

/**
 * Create a new subject via the backend mediator.
 * Returns the success message on #ok, throws on #err.
 */
export async function createSubject(input: CreateSubjectInput): Promise<string> {
	const result = await backendActor.createSubjectMediator(
		input.name,
		input.code,
		BigInt(Math.round(input.duration)),
		input.description,
	);
	if ('ok' in result) return result.ok;
	throw new Error(result.err);
}