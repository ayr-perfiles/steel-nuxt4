// composables/useMovements.ts
import type { Dayjs } from "dayjs";
import {
  collection,
  serverTimestamp,
  Timestamp,
  addDoc,
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
  return { add };
};
