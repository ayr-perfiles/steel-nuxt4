<!-- <script lang="ts" setup>
import type { TableProps } from "ant-design-vue";
import _ from "lodash";
import type { ICoil } from "~/models/coil";

interface Coil {
  id: string;
  name: string;
  stock: number;
}

const emit = defineEmits<{
  onSelected: [coil: Coil];
}>();

const dayjs = useDayjs();

const open = ref(false);
const openCuttingPlan = ref(false);
const openInfoCoil = ref(false);
const coil = ref<ICoil>();

const { data: coils, pending, remove } = useCrudCoils();
const {
  coils: others,
  prevPage,
  nextPage,
  currentPage,
  sizePerPage,
  totalCoils,
} = useCoils(2);

const handleRemove = (id: string) => {
  Modal.confirm({
    title: "Eliminar Bobina?",
    onOk: async () => {
      try {
        await remove(id);
        notificationSuccess("Bobina eliminado");
      } catch (error: any) {
        modalError(error.message);
      }
    },
  });
};

const getTextPagination = computed(() => {
  const from = sizePerPage.value * currentPage.value + 1;
  let to = sizePerPage.value * (currentPage.value + 1);
  if (to > totalCoils.value) {
    to = totalCoils.value;
  }
  return `${from}-${to} de ${totalCoils.value}`;
});

const handleUpdate = (coilSelected: any) => {
  open.value = true;
  coil.value = coilSelected;
};

const handleOpenCuttingPlan = (coilSelected: any) => {
  openCuttingPlan.value = true;
  coil.value = coilSelected;
};

const handleInfoCoil = (coilSelected: any) => {
  openInfoCoil.value = true;
  coil.value = coilSelected;
};

const columns: TableProps["columns"] = [
  {
    title: "ITEM",
    key: "item",
    width: "80px",
    align: "center",
    customRender: ({ index }) => {
      return _.padStart(`${index + 1}`, 2, "0");
    },
  },
  {
    title: "FECHA",
    key: "date",
    dataIndex: "date",
    width: "120px",
    align: "center",
    defaultSortOrder: "descend",
    sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    customRender: ({ value }) => {
      return dayjs(value).format("DD/MM/YYYY HH:mm");
    },
  },
  {
    title: "SERIE",
    key: "serie",
    dataIndex: "serie",
    sorter: (a: any, b: any) =>
      (a.name as string).charCodeAt(0) - (b.name as string).charCodeAt(0),
    customRender: ({ value, record }) => {
      return `${value} ${record.isCutting ? " | Cortado" : ""}`;
    },
  },
  {
    title: "ANCHO",
    key: "width",
    dataIndex: "width",
    width: "100px",
    align: "right",
    customRender: ({ value }) => {
      return value > 0 ? `${value} [mm]` : "-";
    },
  },

  {
    title: "PESO",
    key: "weight",
    dataIndex: "weight",
    width: "90px",
    align: "right",
    customRender: ({ value }) => {
      return value ? `${value} [kg]` : "-";
    },
  },
  {
    title: "PRECIO POR X KG",
    key: "pricePerKilogram",
    dataIndex: "pricePerKilogram",
    width: "120px",
    align: "right",
    customRender: ({ value }) => {
      return value ? `${currency(value, "")} [PEN]` : "-";
    },
  },
  {
    title: "PRECIO TOTAL",
    key: "total",
    dataIndex: "total",
    width: "120px",
    align: "right",
    customRender: ({ value }) => {
      return value ? `${currency(value, "")} [PEN]` : "-";
    },
  },
  {
    title: "ESTADO",
    key: "status",
    dataIndex: "status",
    width: "100px",
    align: "center",
    customRender: ({ value }) => {
      return getStatusCoil(value);
    },
  },
  {
    title: "",
    key: "action",
    width: "120px",
    align: "center",
  },
];
</script>

<template>
  <div>
    <a-table
      :columns="columns"
      :data-source="others"
      :loading="pending"
      :pagination="false"
      :scroll="{ x: 1100 }"
      bordered
    >
      <template #bodyCell="{ column, text, record, value }">
        <template v-if="column.dataIndex === 'stock'">
          <a-tag v-if="text">{{ text }}</a-tag>
          <span v-else>-</span>
        </template>

        <template v-else-if="column.dataIndex === 'status'">
          <StatusCoilTag :status="value" />
        </template>

        <template v-else-if="column.dataIndex === 'serie'">
          <a v-if="record.isCutting" @click="handleInfoCoil(record)"
            >{{ text }} <InfoCircleOutlined
          /></a>
          <span v-else>{{ text }}</span>
        </template>

        <template v-else-if="column.key === 'action'">
          <a-dropdown placement="bottomRight" :arrow="{ pointAtCenter: true }">
            <a @click.prevent>
              Más
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item :disabled="record.isCutting">
                  <a @click="handleOpenCuttingPlan(record)">Plan de corte</a>
                </a-menu-item>

                <a-menu-item :disabled="record.isCutting">
                  <a @click="handleUpdate(record)">Editar</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleRemove(record.id)">Eliminar</a>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </template>
    </a-table>

    <LoadMoreItems
      v-model="sizePerPage"
      :size-per-page="sizePerPage"
      :current-page="currentPage"
      :total-coils="totalCoils"
      :prev-page="prevPage"
      :next-page="nextPage"
    />

    <NewCoilModal
      v-if="open && coil"
      :coil="coil"
      :open="open"
      @on-close="open = false"
    />

    <NewCuttingModal
      v-if="openCuttingPlan && coil"
      :coil="coil"
      :open="openCuttingPlan"
      @on-close="openCuttingPlan = false"
    />

    <CoilInfoModal
      v-if="openInfoCoil && coil"
      :coil="coil"
      :open="openInfoCoil"
      @on-close="openInfoCoil = false"
    />
  </div>
</template> -->

<script setup lang="ts">
import type { SelectValue } from "ant-design-vue/es/select";
import { useSyncQueryWithStore } from "~/composables/useSyncQueryWithStore";
import { EStatusCoil } from "~/enums";

const coilsStore = useCoilsStore();
const userFilter = ref<string>("");

const loading = ref(false);

const route = useRoute();

// 🔹 Estado local de filtros (vinculado a URL)
const localFilters = reactive({
  status: (route.query.status as string) || "all",
});

async function applyFilters() {
  loading.value = true;
  await coilsStore.setFilters({
    status: localFilters.status,
  });
  loading.value = false;
}

const { init } = useSyncQueryWithStore(coilsStore, {
  filters: { status: "" },
});

await init();
await coilsStore.init();

const handlePrev = async () => {
  await coilsStore.prevPage();
};

const handleNext = async () => {
  await coilsStore.nextPage();
};

const handlePageSizeChange = async (size: SelectValue) => {
  await coilsStore.setPageSize(size as number);
};

function handleTableChange(_: any, __: any, sorter: any) {
  if (!sorter || !sorter.field) return;
  const direction = sorter.order === "ascend" ? "asc" : "desc";
  coilsStore.setSort(sorter.field, direction);
}
</script>

<template>
  <div>
    <!-- FILTROS -->
    <a-space>
      <a-select
        v-model:value="localFilters.status"
        @change="applyFilters"
        style="width: 120px"
      >
        <a-select-option value="all">Todos</a-select-option>
        <a-select-option :value="EStatusCoil.completed"
          >Completados</a-select-option
        >
        <a-select-option :value="EStatusCoil.process"
          >Pendientes</a-select-option
        >
      </a-select>

      <a-input-search
        v-model:value="userFilter"
        placeholder="Filtrar por usuario"
        style="width: 200px"
        @search="applyFilters"
      />
    </a-space>

    <a-divider />

    <a-table
      :dataSource="coilsStore.items"
      rowKey="id"
      bordered
      :pagination="false"
    >
      <a-table-column title="ID" dataIndex="id" />
      <a-table-column title="FECHA" dataIndex="date" />
      <a-table-column title="SERIE" dataIndex="serie" />
      <a-table-column title="PESO" dataIndex="weight" />
      <a-table-column title="ESTADO" dataIndex="status" />
    </a-table>

    <!-- 📌 Controles -->
    <div class="py-4">
      <div class="flex justify-center">
        <a-space>
          <span>Filas por pagina: </span>
          <a-select
            v-model:value="coilsStore.pagination.pageSize"
            style="width: 60px"
            @change="handlePageSizeChange"
          >
            <a-select-option :value="2">10</a-select-option>
            <a-select-option :value="4">30</a-select-option>
            <a-select-option :value="6">50</a-select-option>
          </a-select>

          <span>
            Página {{ coilsStore.pagination.currentPageIndex + 1 }} de
            {{
              Math.max(
                1,
                Math.ceil(
                  coilsStore.pagination.total / coilsStore.pagination.pageSize
                )
              )
            }}
            (Total: {{ coilsStore.pagination.total }} elementos)
          </span>

          <a-button
            type="link"
            :disabled="coilsStore.pagination.currentPageIndex === 0"
            @click="handlePrev"
          >
            <template #icon><arrow-left-outlined /> </template>
          </a-button>

          <a-button
            type="link"
            :disabled="
              coilsStore.pagination.currentPageIndex + 1 >=
              Math.max(
                1,
                Math.ceil(
                  coilsStore.pagination.total / coilsStore.pagination.pageSize
                )
              )
            "
            @click="handleNext"
          >
            <template #icon><arrow-right-outlined /> </template>
          </a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>
