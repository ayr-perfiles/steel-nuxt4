// stores/useRollings.ts
import { createFirestoreCrudStore } from "~/composables/useFirestoreCrudStore";
import type { IRolling } from "~/models/rolling";

export interface IRollingFilters {
  stripId: string;
}

export const useRollingStore = createFirestoreCrudStore<
  IRolling,
  IRollingFilters
>("rollings", "rollings", { stripId: "" }, { sortBy: "date", sortDir: "desc" });
