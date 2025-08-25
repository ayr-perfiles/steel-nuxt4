// composables/useStrips.ts
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
import { stripConverter, type IStrip } from "~/models/strip";
import { coilConverter } from "~/models/coil";
import { EStatusCoil } from "~/enums";

export const useCrudStrips = (id?: string) => {
  const dbClient = useFirestore();
  const stripsRef = collection(dbClient, "strips").withConverter(
    stripConverter
  );

  const { data, pending } = useCollection(stripsRef, {
    ssrKey: "strips",
  });

  const { data: repository, pending: pendingRepository } = useDocument(
    id ? doc(dbClient, "strips", id).withConverter(stripConverter) : null,
    {
      ssrKey: "strip",
    }
  );

  const addAll = async (strips: IStrip[], coilId: string) => {
    const coilRef = doc(dbClient, "coils", coilId).withConverter(coilConverter);

    const batch = writeBatch(dbClient);
    await Promise.all([
      strips.map((item) => {
        batch.set(doc(stripsRef), {
          ...item,
          date: Timestamp.fromDate(item.date as Date),
          quantityAvailable: item.quantity,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }),
    ]);

    const totalWeight = strips
      .map((item) => item.weightStrips)
      .reduce((prev: number, item: number) => prev + item, 0);

    batch.update(coilRef, {
      isCutting: true,
      weightTotalStrips: parseFloat(totalWeight.toFixed(4)),
      status: EStatusCoil.completed,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  };

  const add = async (strip: IStrip) => {
    await addDoc(stripsRef, {
      ...strip,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const update = async (id: string, data: IStrip) => {
    const stripDoc = doc(dbClient, "strips", id).withConverter(stripConverter);
    await updateDoc(stripDoc, data);
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(dbClient, "strips", id));
  };

  return {
    data,
    pending,
    repository,
    pendingRepository,
    add,
    update,
    remove,
    addAll,
  };
};
