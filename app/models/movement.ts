import {
  QueryDocumentSnapshot,
  Timestamp,
  type DocumentData,
  type SnapshotOptions,
} from "firebase/firestore";
import type { IAudit } from "./audit";
import type { IVoucherMovement } from "./voucher";
import type { Dayjs } from "dayjs";
import type { IStripMovement } from "./strip";

export interface IMovement extends IAudit {
  id: string;
  date: Dayjs | Timestamp | Date;
  strip: IStripMovement;
  voucher: IVoucherMovement;
  quantity: number;
  description: string;
}

export const movementConverter = {
  toFirestore: (movement: IMovement) => {
    return {
      date: movement.date,
      strip: movement.strip,
      quantity: movement.quantity,
      voucher: movement.voucher || null,
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
