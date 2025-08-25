import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { movementConverter } from "~/models/movement";

export const useCrudMovements = () => {
  const dbClient = useFirestore();
  const movementRef = collection(dbClient, "movements").withConverter(
    movementConverter
  );

  const getMovementsByProductId = async (productId: string) => {
    const movements: any[] = [];
    const q = query(
      movementRef,
      where("productIds", "array-contains", productId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const mov = doc.data();
      const detail = mov.details.find((d) => d.productId === productId);
      if (!detail) return;

      movements.push({
        date: mov.date,
        origin: mov.rollingId ? "rolling" : "voucher",
        quantity: detail.quantity,
        description: detail.description,
      });
    });

    return movements;
  };

  return { getMovementsByProductId };
};
