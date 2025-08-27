import { defineStore } from "pinia";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getCountFromServer,
  orderBy,
  where,
  query,
  startAfter,
  startAt,
  limit,
  documentId,
  type DocumentData,
  type QueryConstraint,
  type DocumentSnapshot,
} from "firebase/firestore";
import { ref } from "vue";

export interface PaginationState {
  pageSize: number;
  currentPageIndex: number;
  total: number;
  cursors: Array<
    { first: DocumentSnapshot; last: DocumentSnapshot } | undefined
  >;
}

export interface SortState {
  sortBy: string;
  sortDir: "asc" | "desc";
}

export function createFirestoreCrudStore<
  T extends { id: string },
  TFilters extends Record<string, any> = {}
>(
  storeId: string,
  collectionPath: string,
  defaultFilters: TFilters,
  defaultSort: SortState
) {
  return defineStore(storeId, () => {
    const db = useFirestore();
    const items = ref<T[]>([]);
    const loading = ref(false);

    const filters = ref<TFilters>({ ...defaultFilters });
    const sort = ref<SortState>({ ...defaultSort });

    const pagination = ref<PaginationState>({
      pageSize: 2,
      currentPageIndex: 0,
      total: 0,
      cursors: [],
    });

    /** 🔹 Construir query con filtros + sort */
    const buildQuery = (extra: QueryConstraint[] = [], withLimit = true) => {
      const constraints: QueryConstraint[] = [];

      // filtros dinámicos
      Object.entries(filters.value).forEach(([key, val]) => {
        if (val !== undefined && val !== "" && val !== "all") {
          constraints.push(where(key, "==", val));
        }
      });

      // orden principal + desempate por id de documento
      constraints.push(orderBy(sort.value.sortBy, sort.value.sortDir));
      constraints.push(orderBy(documentId(), "asc"));

      if (withLimit) {
        constraints.push(limit(pagination.value.pageSize));
      }

      constraints.push(...extra);

      return query(collection(db, collectionPath), ...constraints);
    };

    /** 🔹 Cargar una página (sin tiempo real) */
    const loadPage = async (extra: QueryConstraint[] = []) => {
      loading.value = true;
      const q = buildQuery(extra, true);
      const snap = await getDocs(q);

      items.value = snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));

      const first = snap.docs[0];
      const last = snap.docs[snap.docs.length - 1];

      if (first && last) {
        pagination.value.cursors[pagination.value.currentPageIndex] = {
          first,
          last,
        };
      }

      loading.value = false;
    };

    /** 🔹 Total (count server-side, sin limit) */
    const fetchTotal = async () => {
      const q = buildQuery([], false); // sin limit()
      const snapshot = await getCountFromServer(q);
      pagination.value.total = snapshot.data().count;
    };

    /** 🔹 CRUD básico */
    const add = async (data: Omit<T, "id">) => {
      const refDoc = doc(collection(db, collectionPath));
      await setDoc(refDoc, data as DocumentData);
      // opcional: recargar primera página
      // await init();
    };

    const update = async (id: string, data: Partial<T>) => {
      await updateDoc(doc(db, collectionPath, id), data as DocumentData);
    };

    const remove = async (id: string) => {
      await deleteDoc(doc(db, collectionPath, id));
    };

    /** 🔹 Paginación */
    const nextPage = async () => {
      const idx = pagination.value.currentPageIndex;
      const cur = pagination.value.cursors[idx];
      if (!cur || !cur.last) return;

      // si ya estamos en la última página, no avanzar
      const totalPages = Math.max(
        1,
        Math.ceil(pagination.value.total / pagination.value.pageSize)
      );
      if (idx + 1 >= totalPages) return;

      pagination.value.currentPageIndex++;
      await loadPage([startAfter(cur.last)]);
    };

    const prevPage = async () => {
      const idx = pagination.value.currentPageIndex;
      if (idx === 0) return;

      const targetIdx = idx - 1;
      const target = pagination.value.cursors[targetIdx];

      pagination.value.currentPageIndex = targetIdx;

      // si tenemos el cursor de la página objetivo, anclamos con startAt(first)
      if (target?.first) {
        await loadPage([startAt(target.first)]);
      } else {
        // fallback: recargar sin cursor (inicio con filtros/orden actuales)
        await loadPage();
      }
    };

    /** 🔹 API pública */
    const setFilters = async (f: Partial<TFilters>) => {
      filters.value = { ...filters.value, ...f };
      pagination.value.currentPageIndex = 0;
      pagination.value.cursors = [];
      await fetchTotal();
      await loadPage();
    };

    const setSort = async (field: string, dir: "asc" | "desc") => {
      sort.value = { sortBy: field, sortDir: dir };
      pagination.value.currentPageIndex = 0;
      pagination.value.cursors = [];
      await fetchTotal();
      await loadPage();
    };

    const setPageSize = async (size: number) => {
      pagination.value.pageSize = size;
      pagination.value.currentPageIndex = 0;
      pagination.value.cursors = [];
      await fetchTotal();
      await loadPage();
    };

    const init = async () => {
      await fetchTotal();
      await loadPage();
    };

    return {
      items,
      filters,
      sort,
      pagination,
      loading,
      init,
      setFilters,
      setSort,
      add,
      update,
      remove,
      nextPage,
      prevPage,
      setPageSize,
    };
  });
}
