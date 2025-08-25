import {
  QueryDocumentSnapshot,
  Timestamp,
  type DocumentData,
  type SnapshotOptions,
} from "firebase/firestore";
import type { IAudit } from "./audit";
import type { Dayjs } from "dayjs";

interface IDetailMovement {
  productId: string;
  quantity: number;
  description: string;
}
export interface IMovement extends IAudit {
  id: string;
  date: Dayjs | Timestamp | Date;
  rollingId: string;
  voucherId: string;
  userId: string;
  productIds: string[];
  details: IDetailMovement[];
}

export const movementConverter = {
  toFirestore: (movement: IMovement) => {
    return {
      date: movement.date,
      rollingId: movement.rollingId || null,
      voucherId: movement.voucherId || null,
      userId: movement.userId || null,
      productIds: movement.productIds,
      details: movement.details,
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
