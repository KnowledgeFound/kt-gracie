import { backendActor } from "../../../services/canister/actors";
import type { GreetInput, GreetOutput } from "../types";

export async function fetchGreeting({
  name,
}: GreetInput): Promise<GreetOutput> {
  return backendActor.greet(name);
}
