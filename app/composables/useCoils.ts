import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  getDocs,
  type Query,
  type QueryDocumentSnapshot,
  type DocumentData,
  getCountFromServer,
} from "firebase/firestore";
import { useFirestore } from "vuefire";
import { coilConverter } from "~/models/coil";

export function useCoils(perPage = 2) {
  const dbClient = useFirestore();

  // filtros
  const category = ref<string | null>(null);
  const onlyDone = ref<boolean | null>(null);

  // estado
  const coils = ref<any[]>([]);
  const loading = ref(false);
  const sizePerPage = ref(perPage);
  const totalCoils = ref(0);

  // punteros de navegación
  const currentPage = ref(0);
  const pageSnapshots: QueryDocumentSnapshot<DocumentData>[][] = []; // stack de docs por página

  const coilsCollection = collection(dbClient, "coils");

  const buildQuery = (anchor: QueryDocumentSnapshot<DocumentData> | null) => {
    let q: Query = query(coilsCollection);

    if (category.value) q = query(q, where("category", "==", category.value));
    if (onlyDone.value !== null)
      q = query(q, where("done", "==", onlyDone.value));

    q = query(q, orderBy("date", "desc"), limit(sizePerPage.value));

    if (anchor) {
      q = query(q, startAfter(anchor));
    }

    return q.withConverter(coilConverter);
  };

  const fetchPage = async (pageIndex: number) => {
    loading.value = true;
    calcTotalCoils();

    let anchor: QueryDocumentSnapshot<DocumentData> | null = null;

    if (pageIndex > 0) {
      const prevDocs = pageSnapshots[pageIndex - 1] ?? [];
      anchor = prevDocs[prevDocs.length - 1] ?? null;
    }

    const snapshot = await getDocs(buildQuery(anchor));
    const docs = snapshot.docs;

    if (docs.length > 0) {
      coils.value = docs.map((doc) => doc.data());
      pageSnapshots[pageIndex] = docs;
      currentPage.value = pageIndex;
    } else {
      if (pageIndex > currentPage.value) {
        // no había siguiente, quedarse en la página actual
        return;
      }
    }

    loading.value = false;
  };

  // funciones de navegación
  const nextPage = async () => {
    await fetchPage(currentPage.value + 1);
  };

  const prevPage = async () => {
    if (currentPage.value > 0) {
      // volver a usar docs almacenados de esa página
      const docs = pageSnapshots[currentPage.value - 1];
      coils.value = docs?.map((doc) => doc.data()) || [];
      currentPage.value--;
    }
  };

  // by gsm
  const calcTotalCoils = async () => {
    const snapshotAggregate = await getCountFromServer(coilsCollection);
    totalCoils.value = snapshotAggregate.data().count;
  };

  // reset cuando cambian filtros
  watch(
    [category, onlyDone, sizePerPage],
    async () => {
      pageSnapshots.length = 0;
      currentPage.value = 0;
      await fetchPage(0);
    },
    { immediate: true }
  );

  return {
    coils,
    category,
    onlyDone,
    loading,
    nextPage,
    prevPage,
    currentPage,
    sizePerPage,
    totalCoils,
  };
}
