import {
  QueryDocumentSnapshot,
  Timestamp,
  type DocumentData,
  type SnapshotOptions,
} from "firebase/firestore";
import type { IAudit } from "./audit";
import type { ICustomer } from "./customer";
import type { Dayjs } from "dayjs";

interface IDetailVoucher {
  productId: string;
  quantity: number;
  price: number;
  igv: number;
  rode: number;
}
export interface IVoucher extends IAudit {
  id: string;
  date: Dayjs | Timestamp | Date;
  numberVoucher: number;
  customer: ICustomer;
  description: string;
  total: number;
  details: IDetailVoucher[];
  userId: string;
}

// for movement
export interface IVoucherMovement
  extends Pick<IVoucher, "id" | "numberVoucher"> {}
// end

export const voucherConverter = {
  toFirestore: (voucher: IVoucher) => {
    return {
      date: voucher.date,
      numberVoucher: voucher.numberVoucher,
      customer: voucher.customer,
      description: voucher.description || null,
      total: voucher.total,
      details: voucher.details,
      userId: voucher.userId,
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
