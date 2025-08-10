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
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/firestore";

initializeApp();
const db = getFirestore();

export const onMovementCreate = onDocumentCreated(
  "movements/{movId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }

    const data = snapshot.data();
    const productId = data.product.id;
    const productRef = db.collection("products").doc(productId);

    await db.runTransaction(async (transaction) => {
      const product = await transaction.get(productRef);

      if (!product.exists) throw new Error("Document does not exist!");

      const dataProduct = product.data();
      if (!dataProduct) throw new Error("No Data!");

      const newSumStock = dataProduct.stock + data.quantity;
      transaction.update(productRef, {
        stock: newSumStock,
      });
    });
  }
);

export const onCuttingPlanCreated = onDocumentCreated(
  "coils/{coilId}/strips/{stripId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }

    const data = snapshot.data();
    const productId = data.product.id;
    const productRef = db.collection("products").doc(productId);
    const coilsRef = db.collection("coils").doc(event.params.coilId);

    await db.runTransaction(async (transaction) => {
      const product = await transaction.get(productRef);
      const coil = await transaction.get(coilsRef);

      const dataProduct = product.data();
      const dataCoil = coil.data();

      if (!dataProduct) throw new Error("No Data Product!");
      if (!dataCoil) throw new Error("No Data Coil!");

      const costAverage = dataProduct.price
        ? (dataProduct.price + data.price) / 2
        : data.price;

      transaction.update(productRef, {
        price: costAverage,
      });

      transaction.update(coilsRef, {
        isCutting: true,
      });
    });
  }
);

setGlobalOptions({ maxInstances: 10 });
