import {
  QueryDocumentSnapshot,
  Timestamp,
  type DocumentData,
  type SnapshotOptions,
} from "firebase/firestore";
import type { IAudit } from "./audit";
import type { ICustomer } from "./customer";
import type { Dayjs } from "dayjs";

export interface IVoucher extends IAudit {
  id: string;
  date: Dayjs | Timestamp | Date;
  number: number;
  customer: ICustomer;
  description: string;
  total: number;
}

// for movement
export interface IVoucherMovement extends Pick<IVoucher, "id" | "number"> {}
// end

export const voucherConverter = {
  toFirestore: (voucher: IVoucher) => {
    return {
      date: voucher.date,
      number: voucher.number,
      customer: voucher.customer,
      description: voucher.description,
      total: voucher.total,
      createdAt: voucher.createdAt,
      updatedAt: voucher.updatedAt || null,
    };
  },

  fromFirestore: (
    snapshot: QueryDocumentSnapshot<IVoucher, DocumentData>,
    options: SnapshotOptions
  ) => {
    const data = snapshot.data(options);
    data.id = snapshot.id;
    data.date = (data.date as Timestamp)?.toDate();
    data.createdAt = (data.createdAt as Timestamp)?.toDate();
    data.updatedAt = (data.updatedAt as Timestamp)?.toDate();
    return data;
  },
};
