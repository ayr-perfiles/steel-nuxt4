import {
  QueryDocumentSnapshot,
  Timestamp,
  type DocumentData,
  type SnapshotOptions,
} from "firebase/firestore";
import type { IAudit } from "./audit";

export interface ICustomer extends IAudit {
  id: string;
  identity: string;
  businessEntity: string;
  address: string;
}

export interface ICustomerVoucher
  extends Pick<ICustomer, "id" | "businessEntity"> {}

export const customerConverter = {
  toFirestore: (customer: ICustomer) => {
    return {
      identity: customer.identity,
      businessEntity: customer.businessEntity,
      address: customer.address || null,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt || null,
    };
  },

  fromFirestore: (
    snapshot: QueryDocumentSnapshot<ICustomer, DocumentData>,
    options: SnapshotOptions
  ) => {
    const data = snapshot.data(options);
    data.id = snapshot.id;
    data.createdAt = (data.createdAt as Timestamp)?.toDate();
    data.updatedAt = (data.updatedAt as Timestamp)?.toDate();
    return data;
  },
};
