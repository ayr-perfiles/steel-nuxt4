// composables/useCoils.ts
import { useCollection } from "vuefire";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { coilConverter, type ICoil } from "~/models/coil";

export const useCrudCoils = (id?: string) => {
  const dbClient = useFirestore();
  const coilsRef = collection(dbClient, "coils").withConverter(coilConverter);

  const { data, pending } = useCollection(coilsRef, {
    ssrKey: "coils",
  });

  const { data: repository, pending: pendingRepository } = useDocument(
    id ? doc(dbClient, "coils", id).withConverter(coilConverter) : null,
    {
      ssrKey: "coil",
    }
  );

  const add = async (coil: ICoil) => {
    await addDoc(coilsRef, {
      ...coil,
      serie: coil.serie.toUpperCase(),
      total: parseFloat((coil.price * coil.weight).toFixed(2)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const update = async (id: string, data: ICoil) => {
    const coilDoc = doc(dbClient, "coils", id).withConverter(coilConverter);
    await updateDoc(coilDoc, data);
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(dbClient, "coils", id));
  };

  return { data, pending, repository, pendingRepository, add, update, remove };
};
