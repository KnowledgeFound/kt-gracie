import { kt_gracie_backend } from 'declarations/kt-gracie-backend';
import type { GreetInput, GreetOutput } from "../types";

export async function fetchGreeting({
  name,
}: GreetInput): Promise<GreetOutput> {
  return kt_gracie_backend.greet(name);
}
