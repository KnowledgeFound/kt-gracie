import { HttpAgent } from '@icp-sdk/core/agent';

const IS_LOCAL = import.meta.env.DFX_NETWORK !== 'ic';

/**
 * Resolve the replica host correctly for every environment:
 *
 * - Mainnet:  always https://icp-api.io
 * - Local dev (npm run start / Vite):  http://127.0.0.1:4943
 *   The Vite proxy forwards /api → 127.0.0.1:4943, so the agent
 *   can use the same origin as the dev server.
 * - Local dev (served from asset canister at *.localhost:4943):
 *   window.location.origin is already http://<canister>.localhost:4943
 *   The replica listens on that same host, so we reuse the origin.
 *   Using 127.0.0.1 here would be a cross-origin request that the
 *   browser blocks.
 */
function resolveHost(): string {
	if (!IS_LOCAL) return 'https://icp-api.io';

	// When running inside the asset canister (*.localhost:4943) reuse the
	// page origin so the request stays same-origin.
	if (typeof window !== 'undefined' && window.location.hostname.endsWith('.localhost')) {
		return window.location.origin;
	}

	// Vite dev server — proxy handles /api forwarding
	return 'http://127.0.0.1:4943';
}

function createAgent(): HttpAgent {
	const agent = new HttpAgent({ host: resolveHost() });

	if (IS_LOCAL) {
		agent.fetchRootKey().catch((err: unknown) => {
			console.warn(
				'Unable to fetch root key. Check that your local replica is running.',
			);
			console.error(err);
		});
	}

	return agent;
}

export const agent = createAgent();
