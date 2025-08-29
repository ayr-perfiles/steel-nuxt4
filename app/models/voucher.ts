import {
  QueryDocumentSnapshot,
  Timestamp,
  type DocumentData,
  type SnapshotOptions,
} from "firebase/firestore";
import type { IAudit } from "./audit";
import type { ICustomerVoucher } from "./customer";
import type { ETypeVoucher } from "~/enums";
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
  typeVoucher: ETypeVoucher;
  numberVoucher: number;
  customer: ICustomerVoucher;
  description: string;
  total: number;
  productIds: string[];
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
      typeVoucher: voucher.typeVoucher,
      customer: voucher.customer,
      description: voucher.description || null,
      total: voucher.total,
      productIds: voucher.productIds,
      details: voucher.details,
      userId: voucher.userId || null,
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
