export const DFX_NETWORK = import.meta.env.DFX_NETWORK ?? "local";
export const IS_LOCAL = DFX_NETWORK !== "ic";

export const CANISTER_IDS = {
  backend: import.meta.env.CANISTER_ID_KT_GRACIE_BACKEND ?? "",
  gracie: import.meta.env.CANISTER_ID_GRACIE ?? "",
  city: import.meta.env.CANISTER_ID_CITY ?? "",
  frontend: import.meta.env.CANISTER_ID_KT_GRACIE_FRONTEND ?? "",
} as const;
