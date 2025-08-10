// composables/useProducts.ts
import { useCollection } from "vuefire";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { productConverter, type IProduct } from "~/models/product";

export const useCrudProducts = () => {
  const dbClient = useFirestore();
  const productsRef = collection(dbClient, "products").withConverter(
    productConverter
  );
  const { data, pending } = useCollection(productsRef, {
    ssrKey: "products",
  });

  const add = async (product: IProduct) => {
    await addDoc(productsRef, {
      ...product,
      name: product.name.toUpperCase(),
      stock: 0,
    });
  };

  const update = async (id: string, data: IProduct) => {
    const productDoc = doc(dbClient, "products", id).withConverter(
      productConverter
    );
    await updateDoc(productDoc, data);
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(dbClient, "products", id));
  };

  return { data, pending, add, update, remove };
};
