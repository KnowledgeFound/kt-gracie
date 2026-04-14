import {
  createActor as createBackendActor,
  canisterId as backendCanisterId,
} from "declarations/kt-gracie-backend";
import {
  createActor as createGracieActor,
  canisterId as gracieCanisterId,
} from "declarations/gracie";
import {
  createActor as createCityActor,
  canisterId as cityCanisterId,
} from "declarations/city";
import { agent } from "./agent";

export const backendActor = createBackendActor(backendCanisterId, { agent });
export const gracieActor = createGracieActor(gracieCanisterId, { agent });
export const cityActor = createCityActor(cityCanisterId, { agent });
