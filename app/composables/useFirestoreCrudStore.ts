import { defineStore } from "pinia";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getCountFromServer,
  orderBy,
  where,
  query,
  startAfter,
  limit,
  onSnapshot,
  type DocumentData,
  type QueryConstraint,
  type DocumentSnapshot,
  startAt,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type WithFieldValue,
  Timestamp,
  type WhereFilterOp,
  getDocs,
} from "firebase/firestore";
import { ref, onUnmounted } from "vue";
import { useFirestore } from "vuefire";
import type { IAudit } from "~/models/audit";
import type { Dayjs } from "dayjs";

export interface PaginationState {
  pageSize: number;
  currentPageIndex: number;
  total: number;
  cursors: { first: DocumentSnapshot | null; last: DocumentSnapshot | null }[];
}

export interface SortState {
  sortBy: string;
  sortDir: "asc" | "desc";
}

interface ICreateConverter extends IAudit {
  id: string;
  date?: Date | Timestamp | Dayjs;
}

// 1) Tipos para filtros dinámicos
function isBlank(v: unknown) {
  return v === undefined || v === null || v === "" || v === "all";
}

type Primitive = string | number | boolean | Date | Timestamp | Dayjs;
interface OperatorFilter {
  op: WhereFilterOp;
  value: unknown;
}

function isOperatorFilter(v: unknown): v is OperatorFilter {
  return (
    !!v && typeof v === "object" && "op" in (v as any) && "value" in (v as any)
  );
}

/** 🔹 Converter genérico */
function createConverter<
  T extends ICreateConverter & IAudit
>(): FirestoreDataConverter<T> {
  return {
    toFirestore(modelObject: WithFieldValue<T>): DocumentData {
      // 🔹 eliminamos `id` antes de guardar
      const { id, ...rest } = modelObject as any;
      return rest;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): T {
      const data = snapshot.data(options);

      // 🔹 Convertir fechas de Timestamp a Date
      data.id = snapshot.id;
      data.date = (data.date as Timestamp)?.toDate();
      data.createdAt = (data.createdAt as Timestamp)?.toDate();
      data.updatedAt = (data.updatedAt as Timestamp)?.toDate();

      return data as T;
    },
  };
}

export function createFirestoreCrudStore<
  T extends ICreateConverter,
  TFilters extends Record<string, any> = {}
>(
  storeId: string,
  collectionPath: string,
  defaultFilters: TFilters,
  defaultSort: SortState
) {
  return defineStore(storeId, () => {
    const db = useFirestore();
    const converter = createConverter<T>();
    const colRef = collection(db, collectionPath).withConverter(converter);

    const items = ref<T[]>([]);
    const loading = ref(false);

    const filters = ref<TFilters>({ ...defaultFilters });
    const sort = ref<SortState>({ ...defaultSort });

    const pagination = ref<PaginationState>({
      pageSize: 10,
      currentPageIndex: 0,
      total: 0,
      cursors: [],
    });

    let unsubscribe: (() => void) | null = null;

    /** 🔹 Construir query con filtros + sort */
    // const buildQuery = (extra: QueryConstraint[] = [], withLimit = true) => {
    //   const constraints: QueryConstraint[] = [];

    //   // filtros dinámicos
    //   Object.entries(filters.value).forEach(([key, val]) => {
    //     if (val !== undefined && val !== "" && val !== "all") {
    //       constraints.push(where(key, "==", val));
    //     }
    //   });

    //   // orden
    //   constraints.push(orderBy(sort.value.sortBy, sort.value.sortDir));

    //   // paginación
    //   if (withLimit) {
    //     constraints.push(limit(pagination.value.pageSize));
    //   }
    //   constraints.push(...extra);

    //   return query(colRef, ...constraints);
    // };

    // 3) buildQuery robusto
    const buildQuery = (extra: QueryConstraint[] = [], withLimit = true) => {
      const constraints: QueryConstraint[] = [];

      for (const [key, raw] of Object.entries(
        filters.value as Record<
          string,
          Primitive | OperatorFilter | null | undefined
        >
      )) {
        if (isBlank(raw)) continue;

        if (isOperatorFilter(raw)) {
          if (isBlank(raw.value)) continue; // ← evita where con value = ''
          constraints.push(where(key, raw.op, raw.value as any));
        } else {
          constraints.push(where(key, "==", raw as any));
        }
      }

      // Orden
      constraints.push(orderBy(sort.value.sortBy, sort.value.sortDir));

      if (withLimit) constraints.push(limit(pagination.value.pageSize));
      constraints.push(...extra);

      return query(colRef, ...constraints);
    };

    /** 🔹 Obtener total (sin limit) */
    const fetchTotal = async () => {
      const q = buildQuery([], false); // sin limit
      const snapshot = await getCountFromServer(q);
      pagination.value.total = snapshot.data().count;
    };

    /** 🔹 Suscribirse en tiempo real */
    const subscribe = async (extra: QueryConstraint[] = []) => {
      loading.value = true;
      if (unsubscribe) unsubscribe();

      const q = buildQuery(extra);

      unsubscribe = onSnapshot(q, (snap) => {
        items.value = snap.docs.map((d) => d.data());

        // guardar primer y último cursor de la página actual
        if (snap.docs.length > 0) {
          pagination.value.cursors[pagination.value.currentPageIndex] = {
            first: snap.docs[0] ?? null,
            last: snap.docs[snap.docs.length - 1] ?? null,
          };
        }
        loading.value = false;
      });
    };

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
    });

    /** 🔹 CRUD básico */
    const add = async (data: Omit<T, "id">) => {
      const refDoc = doc(colRef);
      await setDoc(refDoc, data as DocumentData);
      return refDoc.id; // devolvemos el id
    };

    const update = async (id: string, data: Partial<T>) => {
      await updateDoc(doc(colRef, id), data as DocumentData);
    };

    const remove = async (id: string) => {
      await deleteDoc(doc(colRef, id));
    };

    /** 🔹 Paginación */
    const nextPage = async () => {
      if (
        pagination.value.currentPageIndex + 1 >=
        Math.ceil(pagination.value.total / pagination.value.pageSize)
      )
        return;

      const current =
        pagination.value.cursors[pagination.value.currentPageIndex];
      if (!current?.last) return;

      pagination.value.currentPageIndex++;
      await subscribe([startAfter(current.last)]);
    };

    const prevPage = async () => {
      if (pagination.value.currentPageIndex === 0) return;

      pagination.value.currentPageIndex--;
      const prev = pagination.value.cursors[pagination.value.currentPageIndex];
      if (!prev?.first) return;

      await subscribe([startAt(prev.first)]);
    };

    /** 🔹 Cambiar tamaño de página */
    const setPageSize = async (size: number) => {
      pagination.value.pageSize = size;
      pagination.value.currentPageIndex = 0;
      pagination.value.cursors = [];
      await fetchTotal();
      await subscribe();
    };

    /** 🔹 API pública */
    const setFilters = async (f: Partial<TFilters>) => {
      filters.value = { ...filters.value, ...f };
      pagination.value.currentPageIndex = 0;
      pagination.value.cursors = [];
      await fetchTotal();
      await subscribe();
    };

    const setSort = async (field: string, dir: "asc" | "desc") => {
      sort.value = { sortBy: field, sortDir: dir };
      pagination.value.currentPageIndex = 0;
      pagination.value.cursors = [];
      await subscribe();
    };

    /** 🔹 Obtener documentos por campo (incluyendo campos anidados / Map) */
    const getByField = async (
      fieldPath: string, // permite 'datos.nombre' o 'config.activo'
      value: Primitive,
      matchMode: "equals" | "startsWith" = "equals"
    ): Promise<T[]> => {
      const constraints: QueryConstraint[] = [];

      if (matchMode === "equals") {
        constraints.push(where(fieldPath, "==", value));
      } else if (matchMode === "startsWith") {
        const val = (value as string).toLowerCase();
        constraints.push(where(fieldPath, ">=", val));
        constraints.push(where(fieldPath, "<", val + "\uf8ff"));
      }

      const q = query(colRef, ...constraints);
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    };

    const init = async () => {
      await fetchTotal();
      await subscribe();
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
      setPageSize,
      add,
      update,
      remove,
      nextPage,
      prevPage,
      getByField,
    };
  });
}
