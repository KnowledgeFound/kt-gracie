import { useMutation } from "@tanstack/react-query";
import { fetchGreeting } from "../services/fetchGreeting";
import type { GreetInput } from "../types";

export function useGreet() {
  return useMutation({
    mutationFn: (input: GreetInput) => fetchGreeting(input),
  });
}
