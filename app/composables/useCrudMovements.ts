// composables/useMovements.ts
import { useCollection } from "vuefire";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  writeBatch,
  Timestamp,
  runTransaction,
  getAggregateFromServer,
  average,
  where,
  query,
} from "firebase/firestore";
import { movementConverter, type IMovement } from "~/models/movement";
import { stripConverter } from "~/models/strip";
import { productConverter } from "~/models/product";

export const useCrudMovements = () => {
  const dbClient = useFirestore();
  const movementsRef = collection(dbClient, "movements").withConverter(
    movementConverter
  );
  const { data, pending } = useCollection(movementsRef, {
    ssrKey: "movements",
  });

  const addAll = async (strips: IMovement[]) => {
    await runTransaction(dbClient, async (transaction) => {
      for (const item of strips) {
        if (!item.strip || !item.strip.id) {
          throw new Error("Invalid strip data");
        }

        // gets
        const stripRef = doc(dbClient, "strips", item.strip.id).withConverter(
          stripConverter
        );

        const data = await transaction.get(stripRef);
        if (!data.exists()) {
          throw "Document does not exist!";
        }

        const productRef = doc(
          dbClient,
          "products",
          item.strip.product.id
        ).withConverter(productConverter);

        const dataProduct = await transaction.get(productRef);
        if (!dataProduct.exists()) {
          throw "Document does not exist!";
        }
        // end gets

        // calcs strips
        const newQuantityAvailable = (data.data().quantityAvailable || 0) - 1;

        const qProductProduced =
          (data.data().qProductProduced || 0) + item.quantity;

        const resultCostPerUnit = parseFloat(
          (
            (data.data().pricePerStrip *
              (data.data().quantity - newQuantityAvailable)) /
            qProductProduced
          ).toFixed(4)
        );

        transaction.update(stripRef, {
          quantityAvailable: newQuantityAvailable,
          qProductProduced: qProductProduced,
          updatedAt: serverTimestamp(),
          costPerUnit: resultCostPerUnit,
          isRolling: newQuantityAvailable < 1,
        });
        // end calcs strips

        // calcs products
        const calcQuantityProduct =
          (dataProduct.data().stock || 0) + item.quantity;

        const coll = collection(dbClient, "strips");
        const q = query(
          coll,
          where("product.id", "==", item.strip.product.id)
        ).withConverter(stripConverter);
        const snapshot = await getAggregateFromServer(q, {
          averagePopulation: average("costPerUnit"),
        });

        transaction.update(productRef, {
          stock: parseFloat(calcQuantityProduct.toFixed(4)),
        });
        // end calcs products
      }

      for (const item of strips) {
        transaction.set(doc(movementsRef), {
          ...item,
          strip: {
            id: item.strip.id,
            coil: item.strip.coil,
            product: item.strip.product,
          },
          date: Timestamp.fromDate(item.date as Date),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    });
  };

  const add = async (movement: IMovement) => {
    await addDoc(movementsRef, {
      ...movement,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const update = async (id: string, data: IMovement) => {
    const movementDoc = doc(dbClient, "movements", id).withConverter(
      movementConverter
    );
    await updateDoc(movementDoc, data);
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(dbClient, "movements", id));
  };

  return { data, pending, addAll, add, update, remove };
};
