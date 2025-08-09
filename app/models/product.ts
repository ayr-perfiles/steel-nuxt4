import { QueryDocumentSnapshot, type DocumentData, type SnapshotOptions } from "firebase/firestore"

export interface IProduct {
  id: string
  name: string
  weight: number
  stock: number
}

// for movements
export interface IProductMovement extends Pick<IProduct, "id" | "name" | "weight"> {}
// end

export class Product implements Omit<IProduct, "id"> {
  name: string
  weight: number
  stock: number

  constructor(name: string, weight: number, stock: number) {
    this.name = name
    this.weight = weight
    this.stock = stock
  }
}

export const productConverter = {
  toFirestore: (product: IProduct) => {
    return {
      name: product.name,
      weight: product.weight,
      stock: product.stock,
    }
  },

  fromFirestore: (
    snapshot: QueryDocumentSnapshot<IProduct, DocumentData>,
    options: SnapshotOptions,
  ) => {
    const data = snapshot.data(options)
    data.id = snapshot.id
    return data
  },
}
