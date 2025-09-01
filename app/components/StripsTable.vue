<script lang="ts" setup>
import type { TableProps } from "ant-design-vue";
import type { SelectValue } from "ant-design-vue/es/select";
import _, { get } from "lodash";
import type { IStrip } from "~/models/strip";
import type { DefaultOptionType } from "ant-design-vue/es/select";
import type {
  LabelInValueType,
  RawValueType,
} from "ant-design-vue/es/vc-select/Select";

interface Strip {
  id: string;
  name: string;
  stock: number;
}

const emit = defineEmits<{
  onSelected: [strip: Strip];
}>();

const dayjs = useDayjs();
const stripStore = useStripsStore();

const openRolling = ref(false);
const openRollings = ref(false);
const strip = ref<IStrip>();

const { init } = useSyncQueryWithStore(stripStore, {
  filters: {},
});

onMounted(async () => {
  await init();
  await stripStore.init();
});

onUnmounted(() => {
  stripStore.reset();
});

const handlePrev = async () => {
  await stripStore.prevPage();
};

const handleNext = async () => {
  await stripStore.nextPage();
};

const handlePageSizeChange = async (size: SelectValue) => {
  await stripStore.setPageSize(size as number);
};

// 🔹 Métodos de interacción
const handleApplyFilters = async (val: any) => {
  await stripStore.setFilters({
    status: val,
  });
};

function handleTableChange(_: any, __: any, sorter: any) {
  if (!sorter || !sorter.field) return;
  const direction = sorter.order === "ascend" ? "asc" : "desc";
  stripStore.setSort(sorter.field, direction);
}

const handleOpenRolling = (stripSelected: any) => {
  openRolling.value = true;
  strip.value = stripSelected;
};

const handleOpenMovements = (stripSelected: any) => {
  openRollings.value = true;
  strip.value = stripSelected;
};

// algolia
const { result, search } = useAlgoliaSearch("strips");

// estado local para las opciones
const options = ref<{ label: string; value: string }[]>([]);
const fetching = ref(false);

// 🔹 Buscar sugerencias en Algolia
const handleSearch = async (term: string) => {
  if (!term) {
    options.value = [];
    return;
  }

  fetching.value = true;

  await search({ query: term });

  options.value = result.value.hits.map((hit: any) => ({
    label: hit.coil.serie + " | " + hit.coil.weight + " | " + hit.product.name, // 👈 cambia según tu schema
    value: hit.objectID,
  }));

  fetching.value = false;
};

// 🔹 Cuando seleccionas un item del select
const handleSelect = async (
  option: RawValueType | LabelInValueType,
  _option: DefaultOptionType
) => {
  await stripStore.getById((option as LabelInValueType).value as string);
};

const columns: TableProps["columns"] = [
  {
    title: "ITEM",
    key: "item",
    width: "70px",
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
    sorter: true,
    customRender: ({ value }) => {
      return dayjs(value).format("DD/MM/YYYY HH:mm");
    },
  },
  {
    title: "BOBINA",
    key: "coil",
    dataIndex: "coil",
    width: "150px",
    customRender: ({ value }) => {
      return `${value.serie} | ${value.weight} [kg]`;
    },
  },
  {
    title: "PRODUCTO",
    key: "product",
    dataIndex: "product",
    customRender: ({ value }) => {
      return value.name;
    },
  },
  {
    title: "FLEJES",
    key: "quantity",
    dataIndex: "quantity",
    width: "80px",
    align: "center",
  },
  {
    title: "FLEJES DISPONIBLES",
    key: "quantityAvailable",
    dataIndex: "quantityAvailable",
    width: "100px",
    align: "center",
  },

  {
    title: "PESO FLEJES",
    key: "weightStrips",
    dataIndex: "weightStrips",
    width: "110px",
    align: "right",
    customRender: ({ value }) => {
      return `${value} [kg]`;
    },
  },
  {
    title: "PRECIO REAL X KG",
    key: "priceRealPerKilogram",
    dataIndex: "priceRealPerKilogram",
    width: "130px",
    align: "right",
    customRender: ({ value }) => {
      return `${value} [PEN]`;
    },
  },
  {
    title: "PRECIO X FLEJE",
    key: "pricePerStrip",
    dataIndex: "pricePerStrip",
    width: "130px",
    align: "right",
    customRender: ({ value }) => {
      return `${value} [PEN]`;
    },
  },
  // {
  //   title: "COSTO POR UNIDAD [S/]",
  //   key: "costPerUnit",
  //   dataIndex: "costPerUnit",
  //   width: "120px",
  //   align: "right",
  //   // customRender: ({ value }) => {
  //   //   return currency(value, "");
  //   // },
  // },
  // {
  //   title: "CANT PRODUCTOS ROLADOS",
  //   key: "qProductProduced",
  //   dataIndex: "qProductProduced",
  //   width: "120px",
  //   align: "center",
  //   // customRender: ({ value }) => {
  //   //   script currency(value, "");
  //   // },
  // },
  // {
  //   title: "ROLADO?",
  //   key: "isRolling",
  //   dataIndex: "isRolling",
  //   width: "100px",
  //   align: "center",
  //   customRender: ({ value }) => {
  //     return value ? "Sí" : "No";
  //   },
  // },
  {
    title: "",
    key: "action",
    width: "80px",
    align: "center",
  },
];
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <!-- 🔹 SELECT para buscar -->
      <a-select
        show-search
        label-in-value
        :filter-option="false"
        :options="options"
        :loading="fetching"
        style="width: 300px"
        placeholder="Buscar serie, peso o nombre de producto..."
        allow-clear
        @search="handleSearch"
        @select="handleSelect"
        @change="(val) => !val && stripStore.getById('')"
      />

      <a-button type="primary">
        <template #icon>
          <FilterFilled />
        </template>
        Filtrar
      </a-button>
    </div>

    <a-divider />

    <a-table
      :columns="columns"
      :data-source="
        stripStore.selectedItem ? [stripStore.selectedItem] : stripStore.items
      "
      :loading="stripStore.loading"
      :pagination="false"
      :scroll="{ x: 1100 }"
      bordered
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, text, record, value }">
        <template v-if="column.dataIndex === 'stock'">
          <a-tag v-if="text">{{ text }}</a-tag>
          <span v-else>-</span>
        </template>

        <template v-else-if="column.dataIndex === 'quantityAvailable'">
          <a
            v-if="record.quantityAvailable < record.quantity"
            @click.prevent="handleOpenMovements(record)"
          >
            {{ text }}
          </a>
          <span v-else>{{ text }}</span>
        </template>

        <template v-else-if="column.key === 'action'">
          <a-button
            type="link"
            @click.prevent="handleOpenRolling(record)"
            :disabled="record.quantityAvailable < 1"
          >
            Rolar
          </a-button>
          <!-- <a-divider type="vertical"></a-divider>
          <a-dropdown placement="bottomRight" :arrow="{ pointAtCenter: true }">
            <a @click.prevent>
              Más
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item>
                  <a @click="handleUpdate(record)">Editar</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleRemove(record.id)">Eliminar</a>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown> -->
        </template>
      </template>
    </a-table>

    <pagination-controls
      :pagination="stripStore.pagination"
      @update:pageSize="handlePageSizeChange"
      @prev="handlePrev"
      @next="handleNext"
    />

    <RollingsModal
      v-if="openRollings && strip"
      :strip="strip"
      :open="openRollings"
      @on-close="openRollings = false"
    />

    <NewRollingModal
      v-if="openRolling && strip"
      :strip="strip"
      :open="openRolling"
      @on-close="openRolling = false"
    />
  </div>
</template>
