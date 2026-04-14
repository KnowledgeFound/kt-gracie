import { HttpAgent } from "@icp-sdk/core/agent";

const IS_LOCAL = import.meta.env.DFX_NETWORK !== "ic";

function createAgent(): HttpAgent {
  const agent = new HttpAgent({
    host: IS_LOCAL ? "http://127.0.0.1:4943" : "https://icp-api.io",
  });

  if (IS_LOCAL) {
    agent.fetchRootKey().catch((err: unknown) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running",
      );
      console.error(err);
    });
  }

  return agent;
}

export const agent = createAgent();
