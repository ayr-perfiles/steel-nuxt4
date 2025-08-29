// stores/useCoils.ts
import { createFirestoreCrudStore } from "~/composables/useFirestoreCrudStore";
import type { ICoil } from "~/models/coil";

export interface ICoilFilters {
  status: string;
}

export const useCoilsStore = createFirestoreCrudStore<ICoil, ICoilFilters>(
  "coils",
  "coils",
  { status: "all" },
  { sortBy: "date", sortDir: "desc" }
);
