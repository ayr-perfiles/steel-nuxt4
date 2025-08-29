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
import {
  onDocumentCreated,
  onDocumentDeleted,
} from "firebase-functions/firestore";
import getUpdateAverage from "../utils/getUpdateAverage";
import getPreviousAverage from "../utils/getPreviousAverage";

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
    const stripData = await stripRef.get().then((doc) => {
      return { ...doc.data(), id: doc.id } as any;
    });

    if (!stripData) {
      console.log("No existe el strip asociado");
      return;
    }

    const prodRef = db.collection("products").doc(stripData.product.id);
    const prodData = await prodRef.get().then((doc) => {
      return { ...doc.data(), id: doc.id } as any;
    });
    if (!prodData) {
      console.log("No existe el product asociado");
      return;
    }

    // before transactions
    const batch = db.batch();

    // add movement
    const movimientoRef = db.collection("movements").doc();
    const details = [
      {
        productId: stripData.product.id,
        quantity: rollingData.quantity,
        description: `Movimiento generado por el rollo ${rollingId} del strip ${stripData.id}`,
      },
    ];

    batch.set(movimientoRef, {
      date: rollingData.date,
      rollingId: rollingId,
      userId: rollingData.userId || "sistema",
      productIds: [stripData.product.id],
      details: details,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // update strip
    const newQuantityAvailable = stripData.quantityAvailable - 1;
    const newQProductProduced =
      (stripData.qProductProduced || 0) + rollingData.quantity;
    const newCostPerUnit =
      (stripData.pricePerStrip * (stripData.quantity - newQuantityAvailable)) /
      newQProductProduced;

    batch.update(stripRef, {
      quantityAvailable: newQuantityAvailable,
      qProductProduced: newQProductProduced,
      costPerUnit: newCostPerUnit,
      isRolling: newQuantityAvailable < 1,
    });

    // update product
    const stock = prodData.stock || 0;
    const newStock = stock + rollingData.quantity;
    const newQRolling = (prodData.quantityRolling || 0) + 1;
    const currentCostPerUnit = stripData.pricePerStrip / rollingData.quantity;
    const newPrice =
      newQRolling <= 1
        ? currentCostPerUnit
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

exports.onRollingRemoved = onDocumentDeleted(
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
    const stripData = await stripRef.get().then((doc) => {
      return { ...doc.data(), id: doc.id } as any;
    });

    if (!stripData) {
      console.log("No existe el strip asociado");
      return;
    }

    const prodRef = db.collection("products").doc(stripData.product.id);
    const prodData = await prodRef.get().then((doc) => {
      return { ...doc.data(), id: doc.id } as any;
    });
    if (!prodData) {
      console.log("No existe el product asociado");
      return;
    }

    // before transactions
    const batch = db.batch();

    // add movement
    const movimientoRef = db.collection("movements").doc();
    const details = [
      {
        productId: stripData.product.id,
        quantity: -rollingData.quantity,
        description: `Movimiento generado al eliminar el rollo ${rollingId} del strip ${stripData.id}`,
      },
    ];

    batch.set(movimientoRef, {
      date: rollingData.date,
      rollingId: rollingId,
      userId: rollingData.userId || "sistema",
      productIds: [stripData.product.id],
      details: details,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // update strip
    const newQuantityAvailable = stripData.quantityAvailable + 1;
    const newQProductProduced =
      (stripData.qProductProduced || 0) - rollingData.quantity;
    const newQuantityRolled = stripData.quantity - newQuantityAvailable;
    let newCostPerUnit = null;
    if (newQuantityRolled > 0)
      newCostPerUnit =
        (stripData.pricePerStrip * newQuantityRolled) / newQProductProduced;

    batch.update(stripRef, {
      quantityAvailable: newQuantityAvailable,
      qProductProduced: newQProductProduced,
      costPerUnit: newCostPerUnit,
      isRolling: newQuantityAvailable < 1,
    });

    // update product
    const stock = prodData.stock || 0;
    const newStock = stock - rollingData.quantity;
    const newQRolling = (prodData.quantityRolling || 0) - 1;
    const currentCostPerUnit = stripData.pricePerStrip / rollingData.quantity;
    let newPrice = null;

    if (newQRolling === 1) newPrice = newCostPerUnit;
    else if (newQRolling > 1)
      newPrice = getPreviousAverage(
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

exports.onVoucherCreated = onDocumentCreated(
  "vouchers/{voucherId}",
  async (event) => {
    const voucherId = event.params.voucherId;
    const voucherData = event.data?.data();
    if (!voucherData) {
      console.log("No data associated with the event");
      return;
    }

    // before transactions
    const batch = db.batch();

    // add movement
    const movimientoRef = db.collection("movements").doc();

    const details = voucherData.details.map((detail: any) => ({
      productId: detail.productId,
      quantity: -detail.quantity,
      description: `Movimiento generado por el voucher ${voucherId}`,
    }));

    batch.set(movimientoRef, {
      date: voucherData.date,
      voucherId: voucherId,
      userId: voucherData.userId || "sistema",
      productIds: voucherData.productIds,
      details: details,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // update product
    for (const detail of voucherData.details) {
      const prodRef = db.collection("products").doc(detail.productId);
      const prodData = await prodRef.get().then((doc) => doc.data());
      if (!prodData) {
        console.log("No existe el product asociado");
        continue;
      }

      const stock = prodData.stock || 0;
      const newStock = stock - detail.quantity;

      batch.update(prodRef, {
        stock: newStock,
      });
    }

    await batch.commit();
    console.log("Transaction successfully committed!");
  }
);

exports.onVoucherRemoved = onDocumentDeleted(
  "vouchers/{voucherId}",
  async (event) => {
    const voucherId = event.params.voucherId;
    const voucherData = event.data?.data();
    if (!voucherData) {
      console.log("No data associated with the event");
      return;
    }

    // before transactions
    const batch = db.batch();

    // add movement
    const movimientoRef = db.collection("movements").doc();

    const details = voucherData.details.map((detail: any) => ({
      productId: detail.productId,
      quantity: detail.quantity,
      description: `Movimiento eliminado por el voucher ${voucherId}`,
    }));

    batch.set(movimientoRef, {
      date: voucherData.date,
      voucherId: voucherId,
      userId: voucherData.userId || "sistema",
      productIds: voucherData.productIds,
      details: details,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // update product
    for (const detail of voucherData.details) {
      const prodRef = db.collection("products").doc(detail.productId);
      const prodData = await prodRef.get().then((doc) => doc.data());
      if (!prodData) {
        console.log("No existe el product asociado");
        continue;
      }

      const stock = prodData.stock || 0;
      const newStock = stock + detail.quantity;

      batch.update(prodRef, {
        stock: newStock,
      });
    }

    await batch.commit();
    console.log("Transaction successfully committed!");
  }
);

// const ALGOLIA_APP_ID = "3Y16MMA19D";
// const ALGOLIA_ADMIN_KEY = "2b7c8350a9436fb67d3086049a577229";
// const ALGOLIA_INDEX_NAME = "strips";

// const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
// const index = client.(ALGOLIA_INDEX_NAME);

// exports.syncToAlgolia = onDocumentWritten(
//   {
//     document: "strips/{stripId}", // Tu colección
//     concurrency: 10,
//     cpu: 1,
//     memory: "256MiB",
//   },
//   async (event) => {
//     const { params, data } = event;
//     const stripId = params.stripId;

//     if (!data?.after?.exists) {
//       console.log(`Eliminando ${stripId} de Algolia`);
//       await index.deleteObject(stripId);
//       return;
//     }

//     const newData = data.after.data();
//     if (!newData) return;

//     newData.objectID = stripId;
//     await index.saveObject(newData);
//   }
// );

// setGlobalOptions({ maxInstances: 10 });
