// composables/useMovements.ts
import type { Dayjs } from "dayjs";
import {
  collection,
  serverTimestamp,
  Timestamp,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { rollingConverter, type IRolling } from "~/models/rolling";

export const useCrudRollings = () => {
  const dbClient = useFirestore();
  const rollingRef = collection(dbClient, "rollings").withConverter(
    rollingConverter
  );
  const add = async (rolling: IRolling) => {
    await addDoc(rollingRef, {
      ...rolling,
      date: Timestamp.fromDate((rolling.date as Dayjs).toDate()),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const getRollingsByStripId = async (stripId: string) => {
    const rollings: IRolling[] = [];
    const q = query(rollingRef, where("stripId", "==", stripId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      rollings.push(doc.data());
    });
    return rollings;
  };

  return { add, getRollingsByStripId };
};
