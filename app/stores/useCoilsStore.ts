// stores/useCoils.ts
import { createFirestoreCrudStore } from "~/composables/useFirestoreCrudStore";
import type { EStatusCoil } from "~/enums";
import type { ICoil } from "~/models/coil";

export interface CoilFilters {
  status?: string | EStatusCoil | "all";
}

export const useCoilsStore = createFirestoreCrudStore<ICoil, CoilFilters>(
  "coils",
  "coils",
  { status: "all" },
  { sortBy: "date", sortDir: "desc" }
);
