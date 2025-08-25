import {
  QueryDocumentSnapshot,
  Timestamp,
  type DocumentData,
  type SnapshotOptions,
} from "firebase/firestore";
import type { IProductMovement } from "./product";
import type { IAudit } from "./audit";
import type { ICoilMovement } from "./coil";
import type { Dayjs } from "dayjs";

export interface IStrip extends IAudit {
  id: string;
  date: Dayjs | Timestamp | Date;
  coil: ICoilMovement;
  product: IProductMovement;
  quantity: number;
  quantityAvailable: number;
  qProductProduced: number;
  weightStrips: number;
  priceRealPerKilogram: number;
  pricePerStrip: number;
  costPerUnit: number;
  isRolling: boolean;
}

// for movements
export interface IStripMovement
  extends Pick<IStrip, "id" | "coil" | "product"> {}
// end

export const stripConverter = {
  toFirestore: (strip: IStrip) => {
    return {
      date: strip.date,
      coil: strip.coil,
      product: strip.product,
      quantity: strip.quantity,
      quantityAvailable: strip.quantityAvailable || null,
      qProductProduced: strip.qProductProduced || null,
      priceRealPerKilogram: strip.priceRealPerKilogram || null,
      weightStrips: strip.weightStrips || null,
      pricePerStrip: strip.pricePerStrip || null,
      costPerUnit: strip.costPerUnit || null,
      isRolling: strip.isRolling || false,
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
    data.date = (data.date as Timestamp)?.toDate();
    data.createdAt = (data.createdAt as Timestamp)?.toDate();
    data.updatedAt = (data.updatedAt as Timestamp)?.toDate();
    return data;
  },
};
