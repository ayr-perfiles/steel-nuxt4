<script lang="ts" setup>
import _ from "lodash";
import type { TableProps } from "ant-design-vue";
import type { IProduct } from "~/models/product";
import type { SelectValue } from "ant-design-vue/es/select";
import type { IMovement } from "~/models/movement";

interface Props {
  open: boolean;
  product: IProduct;
}

const props = defineProps<Props>();

defineEmits<{
  onClose: [];
}>();

const dayjs = useDayjs();
const movementStore = useMovementStore();

const loading = ref(false);
const movementsByProductId = ref<IMovement[]>([]);

onMounted(async () => {
  try {
    loading.value = true;
    movementsByProductId.value = await movementStore.getByField(
      "productIds",
      props.product.id,
      "array-contains"
    );
  } catch (error) {
    modalError("Error al cargar los movimientos");
    console.error(error);
  } finally {
    loading.value = false;
  }
});

const movementsDTO = computed(() =>
  movementsByProductId.value.map((mov) => {
    const detail = mov.details.find((d) => d.productId === props.product.id);
    return {
      ...mov,
      origin: mov.rollingId ? "rolling" : "voucher",
      quantity: detail?.quantity || 0,
      description: detail?.description || "-",
    };
  })
);

const handlePrev = async () => {
  await movementStore.prevPage();
};

const handleNext = async () => {
  await movementStore.nextPage();
};

const handlePageSizeChange = async (size: SelectValue) => {
  await movementStore.setPageSize(size as number);
};

function handleTableChange(_: any, __: any, sorter: any) {
  if (!sorter || !sorter.field) return;
  const direction = sorter.order === "ascend" ? "asc" : "desc";
  movementStore.setSort(sorter.field, direction);
}

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
    key: "createdAt",
    dataIndex: "createdAt",
    width: "120px",
    align: "center",
    defaultSortOrder: "descend",
    sorter: (a: any, b: any) =>
      dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    customRender: ({ value }) => {
      return dayjs(value).format("DD/MM/YYYY HH:mm:ss");
    },
  },
  {
    title: "ORIGEN",
    key: "origin",
    dataIndex: "origin",
    width: "80px",
    align: "center",
  },
  {
    title: "DESCRIPCIÓN",
    key: "description",
    dataIndex: "description",
  },
  {
    title: "CANTIDAD",
    key: "quantity",
    dataIndex: "quantity",
    width: "80px",
    align: "center",
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
  <a-modal
    :open="open"
    :mask-closable="false"
    class="w-full"
    destroy-on-close
    wrap-class-name="full-modal"
    :footer="null"
    @cancel="$emit('onClose')"
  >
    <template #title>
      <span>
        <a-tag color="green"> Movimientos </a-tag>
        {{ product.name }}
      </span>
    </template>
    <a-card>
      <a-table
        :columns="columns"
        :data-source="movementsDTO"
        :pagination="false"
        :scroll="{ x: 1100 }"
        :loading="loading"
        bordered
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record, value }">
          <template v-if="column.dataIndex === 'stock'">
            <a-tag v-if="text">{{ text }}</a-tag>
            <span v-else>-</span>
          </template>
        </template>
      </a-table>

      <pagination-controls
        :pagination="movementStore.pagination"
        @update:pageSize="handlePageSizeChange"
        @prev="handlePrev"
        @next="handleNext"
      />
    </a-card>

    <!-- <p v-for="item in movementsByProductId" :key="item.id">{{ item.id }}</p> -->
    <!-- <p>{{ movementsDTO.length }}</p> -->

    <!-- <pre>{{ JSON.stringify(movementsByProductId, null, 2) }}</pre> -->
    <!-- <pre>{{ JSON.stringify(movementStore.items, null, 2) }}</pre> -->
  </a-modal>
</template>

<style>
.full-modal .ant-modal {
  max-width: 100%;
  top: 0;
  padding-bottom: 0;
  margin: 0;
}
.full-modal .ant-modal-content {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh);
}
.full-modal .ant-modal-body {
  flex: 1;
}
</style>
