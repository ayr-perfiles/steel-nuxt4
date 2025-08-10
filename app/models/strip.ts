import {
  QueryDocumentSnapshot,
  Timestamp,
  type DocumentData,
  type SnapshotOptions,
} from "firebase/firestore";
import type { IProductMovement } from "./product";
import type { IAudit } from "./audit";

export interface IStrip extends IAudit {
  id: string;
  product: IProductMovement;
  quantity: number;
  price: number;
}

export const stripConverter = {
  toFirestore: (strip: IStrip) => {
    return {
      product: strip.product,
      quantity: strip.quantity,
      price: strip.price,
      createdAt: strip.createdAt,
      updatedAt: strip.updatedAt || null,
    };
  },

  fromFirestore: (
    snapshot: QueryDocumentSnapshot<IStrip, DocumentData>,
    options: SnapshotOptions
  ) => {
    const data = snapshot.data(options);
    data.id = snapshot.id;
    data.createdAt = (data.createdAt as Timestamp)?.toDate();
    data.updatedAt = (data.updatedAt as Timestamp)?.toDate();
    return data;
  },
};
