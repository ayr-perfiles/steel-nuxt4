import {
  collection,
  count,
  getAggregateFromServer,
  query,
  sum,
  where,
} from "firebase/firestore";
import { coilConverter } from "~/models/coil";

export const useReportCoils = () => {
  const dbClient = useFirestore();

  const reportInformation = ref({
    totalCoils: 0,
    totalCuttingCoils: 0,
    totalWeight: 0,
    totalValue: 0,
  });

  const coilsRef = collection(dbClient, "coils").withConverter(coilConverter);
  const coilsCuttingRef = query(
    collection(dbClient, "coils"),
    where("isCutting", "==", true)
  ).withConverter(coilConverter);

  const updateReport = async () => {
    const snapshot = getAggregateFromServer(coilsRef, {
      countOfDoc: count(),
      totalWeight: sum("weight"),
      totalValue: sum("total"),
    });

    const snapshotCutting = getAggregateFromServer(coilsCuttingRef, {
      countOfDoc: count(),
    });

    await Promise.all([snapshot, snapshotCutting]);

    reportInformation.value.totalCoils = (await snapshot).data().countOfDoc;
    reportInformation.value.totalWeight = parseFloat(
      ((await snapshot).data().totalWeight || 0).toFixed(2)
    );
    reportInformation.value.totalValue = parseFloat(
      ((await snapshot).data().totalValue || 0).toFixed(2)
    );
    reportInformation.value.totalCuttingCoils = (
      await snapshotCutting
    ).data().countOfDoc;
  };

  return {
    updateReport,
    reportInformation,
  };
};
