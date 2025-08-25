import {
  QueryDocumentSnapshot,
  type DocumentData,
  type SnapshotOptions,
} from "firebase/firestore";

export interface IProduct {
  id: string;
  name: string;
  width: number;
  stock: number;
  price: number;
  quantityRolling: number; // not stored in db
}

// for movements
export interface IProductMovement
  extends Pick<IProduct, "id" | "name" | "width"> {}
// end

export const productConverter = {
  toFirestore: (product: IProduct) => {
    return {
      name: product.name,
      width: product.width,
      stock: product.stock,
      price: product.price || null,
      quantityRolling: product.quantityRolling || null,
    };
  },

  fromFirestore: (
    snapshot: QueryDocumentSnapshot<IProduct, DocumentData>,
    options: SnapshotOptions
  ) => {
    const data = snapshot.data(options);
    data.id = snapshot.id;
    return data;
  },
};
