<script lang="ts" setup>
import _ from "lodash";
import type { TableProps } from "ant-design-vue";
import type { IMovement } from "~/models/movement";
import type { IProduct } from "~/models/product";

interface Props {
  open: boolean;
  product: IProduct;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  onClose: [];
}>();

const dayjs = useDayjs();
const movements = ref<IMovement[]>([]);

const { getMovementsByProductId } = useCrudMovements();

onMounted(async () => {
  try {
    const data = await getMovementsByProductId(props.product.id);
    movements.value = data;
  } catch (error) {
    modalError(error);
  }
});

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
  {
    title: "",
  },
];
</script>

<template>
  <a-modal
    :open="open"
    :mask-closable="false"
    class="w-full"
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
        :data-source="movements"
        :pagination="false"
        :scroll="{ x: 1100 }"
        bordered
      >
        <template #title>
          <a-typography-title :level="5">
            {{ product.name }}
          </a-typography-title>
        </template>

        <template #bodyCell="{ column, text, record, value }">
          <template v-if="column.dataIndex === 'stock'">
            <a-tag v-if="text">{{ text }}</a-tag>
            <span v-else>-</span>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-button type="link" danger> Eliminar </a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- <pre>{{ JSON.stringify(formState, null, 2) }}</pre> -->
    <!-- <pre>{{ JSON.stringify(items, null, 2) }}</pre> -->
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
