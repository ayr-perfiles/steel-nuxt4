// stores/useCoils.ts
import { createFirestoreCrudStore } from "~/composables/useFirestoreCrudStore";
import type { ICustomer } from "~/models/customer";

export interface ICustomerFilters {
  businessEntity: string;
}

export const useCustomerStore = createFirestoreCrudStore<
  ICustomer,
  ICustomerFilters
>(
  "customers",
  "customers",
  {
    businessEntity: "",
  },
  { sortBy: "businessEntity", sortDir: "asc" }
);
