// composables/useCoils.ts
import { useCollection } from "vuefire";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  Timestamp,
  getDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { coilConverter, type ICoil } from "~/models/coil";
import { stripConverter } from "~/models/strip";
import { EStatusCoil } from "~/enums";

export const useCrudCoils = (id?: string) => {
  const dbClient = useFirestore();
  const coilsRef = collection(dbClient, "coils").withConverter(coilConverter);
  const stripsRef = collection(dbClient, "strips").withConverter(coilConverter);

  const { data, pending } = useCollection(coilsRef, {
    ssrKey: "coils",
  });

  const { data: repository, pending: pendingRepository } = useDocument(
    id ? doc(dbClient, "coils", id).withConverter(coilConverter) : null,
    {
      ssrKey: "coil",
    }
  );

  const { data: stripsByCoil, pending: pendingStripsByCoil } = useCollection(
    id
      ? query(stripsRef, where("coil.id", "==", id)).withConverter(
          stripConverter
        )
      : null,
    {
      ssrKey: "stripsByCoil",
    }
  );

  const add = async (coil: ICoil) => {
    await addDoc(coilsRef, {
      ...coil,
      date: Timestamp.fromDate(coil.date as Date),
      serie: coil.serie.toUpperCase(),
      total: getNumberRound(coil.pricePerKilogram * coil.weight, 2),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const update = async (id: string, coil: ICoil) => {
    const coilDoc = doc(dbClient, "coils", id).withConverter(coilConverter);
    await updateDoc(coilDoc, {
      ...coil,
      date: Timestamp.fromDate(coil.date as Date),
      serie: coil.serie.toUpperCase(),
      total: getNumberRound(coil.pricePerKilogram * coil.weight, 2),
      updatedAt: serverTimestamp(),
    });
  };

  const remove = async (id: string) => {
    const coilRef = doc(dbClient, "coils", id).withConverter(coilConverter);
    const coilData = await getDoc(coilRef).then((doc) => doc.data());
    if (!coilData) throw new Error("No existe la bobina");

    if (coilData.status !== EStatusCoil.completed)
      return await deleteDoc(doc(dbClient, "coils", id));

    const stripsRef = collection(dbClient, "strips").withConverter(
      stripConverter
    );
    const q = query(stripsRef, where("coil.id", "==", id));
    const stripsSnapshot = await getDocs(q);

    for (const stripDoc of stripsSnapshot.docs) {
      const stripData = stripDoc.data();
      if (stripData.quantityAvailable < stripData.quantity)
        throw new Error("No se puede eliminar una bobina con flejes rolados");
    }

    const batch = writeBatch(dbClient);
    stripsSnapshot.docs.forEach((stripDoc) => {
      batch.delete(stripDoc.ref);
    });
    batch.delete(coilRef);

    await batch.commit();

    // throw new Error("No se puede eliminar una bobina cortada");
  };

  return {
    data,
    pending,
    repository,
    pendingRepository,
    stripsByCoil,
    pendingStripsByCoil,
    add,
    update,
    remove,
  };
};
