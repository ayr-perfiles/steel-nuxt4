import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";

interface SyncOptions<TFilters extends Record<string, any>> {
  filters?: TFilters;
  onInit?: (query: Record<string, any>) => Promise<void> | void;
}

/**
 * Sincroniza el estado de un Pinia store con los query params de la URL
 */
export function useSyncQueryWithStore<
  TFilters extends Record<string, any>,
  TStore extends {
    filters: TFilters;
    // currentPageIndex: number;
    // sortBy: string;
    // sortDir: "asc" | "desc";
    sort: SortState;
    pagination: PaginationState;
    setFilters: (f: Partial<TFilters>) => Promise<void> | void;
    setSort: (field: string, dir: "asc" | "desc") => void;
    setPageSize: (size: number) => Promise<void>;
    nextPage: () => Promise<void> | void;
    prevPage: () => Promise<void> | void;
  }
>(store: TStore, options: SyncOptions<TFilters> = {}) {
  const route = useRoute();
  const router = useRouter();

  // 1. Inicializar desde la URL
  const init = async () => {
    const q = route.query;

    // Filtros
    if (options.filters) {
      const applied: Partial<TFilters> = {};
      Object.keys(options.filters).forEach((k) => {
        if (q[k] !== undefined) {
          applied[k as keyof TFilters] = q[k] as any;
        }
      });
      if (Object.keys(applied).length > 0) {
        await store.setFilters(applied);
      }
    }

    // Orden
    if (q.sortBy && q.sortDir) {
      store.setSort(q.sortBy as string, q.sortDir as "asc" | "desc");
    }

    // Orden
    if (q.pageSize) {
      store.setPageSize(parseInt(q.pageSize as string));
    }

    // // Página
    // if (q.page) {
    //   const page = parseInt(q.page as string);
    //   if (page > 1) {
    //     for (let i = 1; i < page; i++) {
    //       await store.nextPage();
    //     }
    //   }
    // }

    if (options.onInit) {
      await options.onInit(q);
    }
  };

  // 2. Sincronizar cambios del store hacia la URL
  watch(
    () => ({
      ...store.filters,
      // page: store.pagination.currentPageIndex + 1,
      pageSize: store.pagination.pageSize,
      sortBy: store.sort.sortBy,
      sortDir: store.sort.sortDir,
    }),
    (val) => {
      router.push({
        query: Object.fromEntries(
          Object.entries(val).filter(
            ([_, v]) => v !== undefined && v !== null && v !== ""
          )
        ),
      });
    },
    { deep: true }
  );

  return { init };
}
