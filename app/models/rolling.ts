import {
  QueryDocumentSnapshot,
  Timestamp,
  type DocumentData,
  type SnapshotOptions,
} from "firebase/firestore";
import type { IAudit } from "./audit";
import type { Dayjs } from "dayjs";
import type { IStripMovement } from "./strip";

export interface IRolling extends IAudit {
  id: string;
  date: Dayjs | Timestamp | Date;
  strip: IStripMovement;
  quantity: number;
  userId: string;
}

export const rollingConverter = {
  toFirestore: (rolling: IRolling) => {
    return {
      date: rolling.date,
      strip: rolling.strip,
      quantity: rolling.quantity,
      userId: rolling.userId || null,
      createdAt: rolling.createdAt,
      updatedAt: rolling.updatedAt || null,
    };
  },

  fromFirestore: (
    snapshot: QueryDocumentSnapshot<IRolling, DocumentData>,
    options: SnapshotOptions
  ) => {
    const data = snapshot.data(options);
    data.id = snapshot.id;
    data.date = (data.date as Timestamp)?.toDate();
    data.createdAt = (data.createdAt as Timestamp)?.toDate();
    data.updatedAt = (data.updatedAt as Timestamp)?.toDate();
    return data;
  },
};
