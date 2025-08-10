// composables/useVouchers.ts
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
import { voucherConverter, type IVoucher } from "~/models/voucher";

export const useCrudVouchers = () => {
  const dbClient = useFirestore();
  const vouchersRef = collection(dbClient, "vouchers").withConverter(
    voucherConverter
  );
  const { data, pending } = useCollection(vouchersRef, {
    ssrKey: "vouchers",
  });

  const addAll = async (strips: IVoucher[]) => {
    const batch = writeBatch(dbClient);

    await Promise.all([
      strips.map((item) => {
        batch.set(doc(vouchersRef), {
          ...item,
          date: Timestamp.fromDate(item.date as Date),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }),
    ]);

    await batch.commit();
  };

  const add = async (voucher: IVoucher) => {
    await addDoc(vouchersRef, {
      ...voucher,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const update = async (id: string, data: IVoucher) => {
    const voucherDoc = doc(dbClient, "vouchers", id).withConverter(
      voucherConverter
    );
    await updateDoc(voucherDoc, data);
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(dbClient, "vouchers", id));
  };

  return { data, pending, addAll, add, update, remove };
};
