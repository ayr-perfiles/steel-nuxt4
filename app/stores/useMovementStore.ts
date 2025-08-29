// stores/useCoils.ts
import { createFirestoreCrudStore } from "~/composables/useFirestoreCrudStore";
import type { IMovement } from "~/models/movement";

export interface IMovementFilters {
  productIds: { op: string; value: string };
}

export const useMovementStore = createFirestoreCrudStore<
  IMovement,
  IMovementFilters
>(
  "movements",
  "movements",
  {
    productIds: { op: "", value: "" },
  },
  { sortBy: "createdAt", sortDir: "desc" }
);
