// composables/useStrips.ts
import { useCollection } from "vuefire";
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { stripConverter, type IStrip } from "~/models/strip";

export const useCrudStrips = (idCoil: string) => {
  const dbClient = useFirestore();

  const stripsRef = collection(
    dbClient,
    "coils",
    idCoil,
    "strips"
  ).withConverter(stripConverter);
  const { data, pending } = useCollection(stripsRef, {
    ssrKey: "strips",
  });

  const addAll = async (strips: IStrip[]) => {
    const batch = writeBatch(dbClient);

    await Promise.all([
      strips.map((item) => {
        batch.set(doc(stripsRef), {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }),
    ]);

    await batch.commit();
  };

  // const add = async (strip: IStrip) => {
  //   await addDoc(stripsRef, strip);
  // };

  // const update = async (id: string, data: IStrip) => {
  //   const stripDoc = doc(dbClient, "strips", id).withConverter(stripConverter);
  //   await updateDoc(stripDoc, data);
  // };

  // const remove = async (id: string) => {
  //   await deleteDoc(doc(dbClient, "strips", id));
  // };

  return { data, pending, addAll };
};
