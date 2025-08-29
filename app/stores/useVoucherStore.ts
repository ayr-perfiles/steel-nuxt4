// stores/useVouchers.ts
import { createFirestoreCrudStore } from "~/composables/useFirestoreCrudStore";
import type { IVoucher } from "~/models/voucher";

export interface IVoucherFilters {}

export const useVouchersStore = createFirestoreCrudStore<
  IVoucher,
  IVoucherFilters
>("vouchers", "vouchers", {}, { sortBy: "date", sortDir: "desc" });
