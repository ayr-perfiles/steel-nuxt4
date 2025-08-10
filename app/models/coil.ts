import {
  QueryDocumentSnapshot,
  Timestamp,
  type DocumentData,
  type SnapshotOptions,
} from "firebase/firestore";
import type { IAudit } from "./audit";
import type { EStatusCoil } from "~/enums";

export interface ICoil extends IAudit {
  id: string;
  serie: string;
  width: number;
  thickness: number;
  weight: number;
  price: number;
  total: number;
  density: number;
  status: EStatusCoil;
  isCutting: boolean;
}

// for movements
export interface ICoilMovement extends Pick<ICoil, "id" | "serie"> {}
// end

export const coilConverter = {
  toFirestore: (coil: ICoil) => {
    return {
      serie: coil.serie,
      weight: coil.weight,
      price: coil.price,
      width: coil.width,
      thickness: coil.thickness,
      total: coil.total,
      density: coil.density,
      status: coil.status,
      isCutting: coil.isCutting,
      createdAt: coil.createdAt,
      updatedAt: coil.updatedAt || null,
    };
  },

  fromFirestore: (
    snapshot: QueryDocumentSnapshot<ICoil, DocumentData>,
    options: SnapshotOptions
  ) => {
    const data = snapshot.data(options);
    data.id = snapshot.id;
    data.createdAt = (data.createdAt as Timestamp)?.toDate();
    data.updatedAt = (data.updatedAt as Timestamp)?.toDate();
    return data;
  },
};
