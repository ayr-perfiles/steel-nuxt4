// composables/usePaginatedProducts.ts
import { ref, computed, watchEffect } from "vue";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  getDocs,
  QueryDocumentSnapshot,
  Query,
  type DocumentData,
} from "firebase/firestore";
import { useCollection, useFirestore } from "vuefire";
import { productConverter } from "../models/product";

export function usePaginatedProducts(perPage = 5) {
  const dbClient = useFirestore();
  const category = ref<string | null>(null);
  const onlyDone = ref<boolean | null>(null);

  const lastVisible = ref<QueryDocumentSnapshot<DocumentData> | null>(null);
  const firstVisible = ref<QueryDocumentSnapshot<DocumentData> | null>(null);
  const direction = ref<"next" | "prev" | null>(null);

  const productsCollection = collection(dbClient, "products");

  const queryRef = computed(() => {
    let q: Query = query(productsCollection);

    if (category.value) q = query(q, where("category", "==", category.value));
    if (onlyDone.value !== null)
      q = query(q, where("done", "==", onlyDone.value));

    q = query(q, orderBy("createdAt", "desc"), limit(perPage));

    if (direction.value === "next" && lastVisible.value) {
      q = query(q, startAfter(lastVisible.value));
    }

    if (direction.value === "prev" && firstVisible.value) {
      q = query(q, endBefore(firstVisible.value));
    }

    return q.withConverter(productConverter);
  });

  const products = useCollection(queryRef, {
    ssrKey: "products",
  });

  // Actualizar punteros para paginación después de cada cambio de consulta
  watchEffect(async () => {
    const snapshot = await getDocs(queryRef.value);
    firstVisible.value = snapshot.docs[0] ?? null;
    lastVisible.value = snapshot.docs[snapshot.docs.length - 1] ?? null;
  });

  const nextPage = () => {
    direction.value = "next";
  };

  const prevPage = () => {
    direction.value = "prev";
  };

  const resetPagination = () => {
    direction.value = null;
    firstVisible.value = null;
    lastVisible.value = null;
  };

  watchEffect(() => {
    // Reiniciar paginación al cambiar filtros
    resetPagination();
  });

  return {
    products,
    category,
    onlyDone,
    nextPage,
    prevPage,
  };
}
