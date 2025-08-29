// stores/useStrips.ts
import { createFirestoreCrudStore } from "~/composables/useFirestoreCrudStore";
import type { IStrip } from "~/models/strip";

export interface IStripFilters {}

export const useStripsStore = createFirestoreCrudStore<IStrip, IStripFilters>(
  "strips",
  "strips",
  {},
  { sortBy: "date", sortDir: "desc" }
);
