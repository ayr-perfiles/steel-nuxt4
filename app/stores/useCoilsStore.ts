// stores/useCoils.ts
import { createFirestoreCrudStore } from "~/composables/useFirestoreCrudStore";
import { EStatusCoil } from "~/enums";
import type { ICoil } from "~/models/coil";

export interface ICoilFilters {
  status?: EStatusCoil | "all";
}

export const useCoilsStore = createFirestoreCrudStore<ICoil, ICoilFilters>(
  "coils",
  "coils",
  { status: EStatusCoil.process },
  { sortBy: "date", sortDir: "desc" }
);
