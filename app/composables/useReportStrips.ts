import {
  collection,
  count,
  getAggregateFromServer,
  query,
  sum,
  where,
} from "firebase/firestore";
import { productConverter } from "~/models/product";
import { stripConverter } from "~/models/strip";

export const useReportStrips = () => {
  const dbClient = useFirestore();
  const { data: products } = useCrudProducts();

  interface IReportInformation {
    productName: string;
    totalStrips: number;
    totalStripsAvailable: number;
    totalWeight: number;
  }

  const reportInformation = ref<IReportInformation[]>(
    [] as IReportInformation[]
  );

  const stripsRef = collection(dbClient, "strips").withConverter(
    stripConverter
  );

  const updateReport = async () => {
    const newReportInformation: IReportInformation[] = [];

    for (const product of products.value) {
      const q = query(stripsRef, where("product.id", "==", product.id));

      const totalStripsSnapshot = await getAggregateFromServer(q, {
        totalStrips: sum("quantity"),
        totalStripsAvailable: sum("quantityAvailable"),
        totalWeight: sum("weightStrips"),
      });

      newReportInformation.push({
        productName: product.name,
        totalStrips: totalStripsSnapshot.data().totalStrips || 0,
        totalStripsAvailable:
          totalStripsSnapshot.data().totalStripsAvailable || 0,
        totalWeight: totalStripsSnapshot.data().totalWeight || 0,
      });
    }

    reportInformation.value = newReportInformation;
  };

  watchEffect(() => {
    if (products.value.length > 0) {
      updateReport();
    }
  });

  return {
    updateReport,
    reportInformation,
  };
};
