// composables/useMovements.ts
import {
  collection,
  doc,
  serverTimestamp,
  Timestamp,
  runTransaction,
} from "firebase/firestore";
import { stripConverter, type IStrip } from "~/models/strip";
import { productConverter } from "~/models/product";
import { movementConverter, type IMovement } from "~/models/movement";
import { get } from "lodash";

export const useCrudRolling = () => {
  const dbClient = useFirestore();

  const addRolling = async (strip: IStrip, date: Date, quantity: number) => {
    const movementsRef = collection(dbClient, "movements").withConverter(
      movementConverter
    );

    await runTransaction(dbClient, async (transaction) => {
      if (!strip || !strip.id) {
        throw new Error("Invalid strip data");
      }

      // gets
      const stripRef = doc(dbClient, "strips", strip.id).withConverter(
        stripConverter
      );

      const data = await transaction.get(stripRef);
      if (!data.exists()) {
        throw "Document does not exist!";
      }

      const productRef = doc(
        dbClient,
        "products",
        strip.product.id
      ).withConverter(productConverter);

      const dataProduct = await transaction.get(productRef);
      if (!dataProduct.exists()) {
        throw "Document does not exist!";
      }
      // end gets

      // calcs strips
      const newQuantityAvailable = data.data().quantityAvailable - 1;

      const qProductProduced = (data.data().qProductProduced || 0) + quantity;

      const costAverageStrips =
        (data.data().pricePerStrip *
          (data.data().quantity - newQuantityAvailable)) /
        qProductProduced;

      transaction.update(stripRef, {
        quantityAvailable: newQuantityAvailable,
        qProductProduced: qProductProduced,
        updatedAt: serverTimestamp(),
        costPerUnit: costAverageStrips,
        isRolling: newQuantityAvailable < 1,
      });
      // end calcs strips

      // calcs products
      const costStrip = data.data().pricePerStrip / quantity;
      const calcQuantityProduct = (dataProduct.data().stock || 0) + quantity;
      const costAverage = !dataProduct.data().price
        ? costStrip
        : getUpdateAverage(
            dataProduct.data().price || 0,
            dataProduct.data().quantityRolling || 0,
            costStrip
          );

      console.log("costAverage", costAverage);

      transaction.update(productRef, {
        stock: calcQuantityProduct,
        price: costAverage,
        quantityRolling: (dataProduct.data().quantityRolling || 0) + 1,
      });
      // end calcs products

      transaction.set(doc(movementsRef), {
        date: Timestamp.fromDate(date),
        strip: {
          id: strip.id,
          coil: strip.coil,
          product: strip.product,
        },
        quantity,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as IMovement);
    });
  };

  return { addRolling };
};
