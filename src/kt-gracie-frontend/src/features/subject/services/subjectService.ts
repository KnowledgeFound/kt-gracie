import { backendActor } from '@/services/canister/actors';
import type { Subject, CreateSubjectInput } from '../types';

/** Fetch all subjects from the canister. */
export async function fetchSubjects(): Promise<Subject[]> {
	const raw = await backendActor.getSubjectArray();
	// Cast is safe — Candid-generated type matches our local Subject shape
	return raw as unknown as Subject[];
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
