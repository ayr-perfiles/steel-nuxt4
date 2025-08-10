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
} from "firebase/firestore";
import { movementConverter, type IMovement } from "~/models/movement";

export const useCrudMovements = () => {
  const dbClient = useFirestore();
  const movementsRef = collection(dbClient, "movements").withConverter(
    movementConverter
  );
  const { data, pending } = useCollection(movementsRef, {
    ssrKey: "movements",
  });

  const addAll = async (strips: IMovement[]) => {
    const batch = writeBatch(dbClient);

    await Promise.all([
      strips.map((item) => {
        batch.set(doc(movementsRef), {
          ...item,
          date: Timestamp.fromDate(item.date as Date),
          description: item.product.name,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }),
    ]);

    await batch.commit();
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
