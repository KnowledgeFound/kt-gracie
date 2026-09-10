import {
	createActor as createBackendActor,
	canisterId as backendCanisterId,
} from 'declarations/kt-gracie-backend';
import { agent } from './agent';

export const backendActor = createBackendActor(backendCanisterId, { agent });
