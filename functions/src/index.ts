/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import { setGlobalOptions } from "firebase-functions";
// import { onRequest } from "firebase-functions/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
// setGlobalOptions({ maxInstances: 10 });

import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/firestore";
import getUpdateAverage from "../utils/getUpdateAverage";

initializeApp();
const db = getFirestore();

exports.onRollingCreated = onDocumentCreated(
  "rollings/{rollingId}",
  async (event) => {
    const rollingId = event.params.rollingId;
    const rollingData = event.data?.data();
    if (!rollingData) {
      console.log("No data associated with the event");
      return;
    }

    // gets
    const stripRef = db.collection("strips").doc(rollingData.stripId);
    const strip = await stripRef.get().then((doc) => doc.data());
    if (!strip) {
      console.log("No existe el strip asociado");
      return;
    }

    const prodRef = db.collection("products").doc(rollingData.productoId);
    const prodSnap = await prodRef.get().then((doc) => doc.data());
    if (!prodSnap) {
      console.log("No existe el product asociado");
      return;
    }

    // before transactions
    const batch = db.batch();

    // add movement
    const movimientoRef = db.collection("movements").doc();
    const details = [
      {
        productId: strip.product.id,
        quantity: rollingData.quantity,
        description: `Movimiento generado por el rollo ${rollingId} del strip ${strip.id}`,
      },
    ];

    batch.set(movimientoRef, {
      date: rollingData.date,
      rollingId: rollingId,
      userId: rollingData.userId || "sistema",
      productIds: [strip.product.id],
      details: details,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // update strip
    const stripData = strip.data();
    const newQuantityAvailable = stripData.quantityAvailable - 1;
    const newQProductProduced =
      (stripData.qProductProduced || 0) + rollingData.quantity;
    const newCostPerUnit =
      (strip.pricePerStrip * (strip.quantity - newQuantityAvailable)) /
      newQProductProduced;

    batch.update(stripRef, {
      quantityAvailable: newQuantityAvailable,
      qProductProduced: newQProductProduced,
      costPerUnit: newCostPerUnit,
      isRolling: newQuantityAvailable < 1,
    });

    // update product
    const prodData = prodSnap.data();
    const stock = prodData.stock || 0;
    const newStock = stock + rollingData.quantity;
    const newQRolling = rollingData.quantityRolling + 1;
    const currentCostPerUnit = strip.pricePerStrip / rollingData.quantity;
    const newPrice = !prodData.price
      ? newCostPerUnit
      : getUpdateAverage(
          prodData.price || 0,
          prodData.quantityRolling || 0,
          currentCostPerUnit
        );

    batch.update(prodRef, {
      stock: newStock,
      price: newPrice,
      quantityRolling: newQRolling,
    });

    await batch.commit();
    console.log("Transaction successfully committed!");
  }
);

// // export const onCuttingPlanCreated = onDocumentCreated(
// //   "coils/{coilId}/strips/{stripId}",
// //   async (event) => {
// //     const snapshot = event.data;
// //     if (!snapshot) {
// //       console.log("No data associated with the event");
// //       return;
// //     }

// //     const data = snapshot.data();
// //     const productId = data.product.id;
// //     const productRef = db.collection("products").doc(productId);
// //     const coilsRef = db.collection("coils").doc(event.params.coilId);

// //     await db.runTransaction(async (transaction) => {
// //       const product = await transaction.get(productRef);
// //       const coil = await transaction.get(coilsRef);

// //       const dataProduct = product.data();
// //       const dataCoil = coil.data();

// //       if (!dataProduct) throw new Error("No Data Product!");
// //       if (!dataCoil) throw new Error("No Data Coil!");

// //       const costAverage = dataProduct.price
// //         ? (dataProduct.price + data.price) / 2
// //         : data.price;

// //       transaction.update(productRef, {
// //         price: costAverage,
// //       });

// //       transaction.update(coilsRef, {
// //         isCutting: true,
// //       });
// //     });
// //   }
// // );

setGlobalOptions({ maxInstances: 10 });
