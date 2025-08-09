import {
  QueryDocumentSnapshot,
  type DocumentData,
  type SnapshotOptions,
} from "firebase/firestore";

export interface ICoil {
  id: string;
  serie: string;
  width: number;
  thickness: number;
  weight: number;
  price: number;
  total: number;
}

// for movements
export interface ICoilMovement
  extends Pick<ICoil, "id" | "serie" | "weight" | "price"> {}
// end

export class Coil implements Omit<ICoil, "id"> {
  serie: string;
  weight: number;
  price: number;

  constructor(serie: string, weight: number, price: number) {
    this.serie = serie;
    this.weight = weight;
    this.price = price;
  }
}

export const coilConverter = {
  toFirestore: (coil: ICoil) => {
    return {
      serie: coil.serie,
      weight: coil.weight,
      price: coil.price,
    };
  },

  fromFirestore: (
    snapshot: QueryDocumentSnapshot<ICoil, DocumentData>,
    options: SnapshotOptions
  ) => {
    const data = snapshot.data(options);
    data.id = snapshot.id;
    return data;
  },
};
