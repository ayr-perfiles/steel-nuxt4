// composables/useCustomers.ts
import { useCollection } from "vuefire";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { customerConverter, type ICustomer } from "~/models/customer";

export const useCrudCustomers = () => {
  const dbClient = useFirestore();
  const customersRef = collection(dbClient, "customers").withConverter(
    customerConverter
  );
  const { data, pending } = useCollection(customersRef, {
    ssrKey: "customers",
  });

  const add = async (customer: ICustomer) => {
    await addDoc(customersRef, {
      ...customer,
      businessEntity: customer.businessEntity.toUpperCase(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const update = async (id: string, data: ICustomer) => {
    const customerDoc = doc(dbClient, "customers", id).withConverter(
      customerConverter
    );
    await updateDoc(customerDoc, data);
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(dbClient, "customers", id));
  };

  return { data, pending, add, update, remove };
};
