import {
  QueryDocumentSnapshot,
  Timestamp,
  type DocumentData,
  type SnapshotOptions,
} from "firebase/firestore";
import type { IProductMovement } from "./product";
import type { IAudit } from "./audit";
import type { ICoilMovement } from "./coil";
import type { IVoucherMovement } from "./voucher";
import type { Dayjs } from "dayjs";

export interface IMovement extends IAudit {
  id: string;
  date: Dayjs | Timestamp | Date;
  coil: ICoilMovement;
  product: IProductMovement;
  voucher: IVoucherMovement;
  quantity: number;
  price: number;
  description: string;
}

export const movementConverter = {
  toFirestore: (movement: IMovement) => {
    return {
      date: movement.date,
      coil: movement.coil,
      product: movement.product,
      quantity: movement.quantity,
      voucher: movement.voucher || null,
      price: movement.price || null,
      description: movement.description || null,
      createdAt: movement.createdAt,
      updatedAt: movement.updatedAt || null,
    };
  },

  fromFirestore: (
    snapshot: QueryDocumentSnapshot<IMovement, DocumentData>,
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
