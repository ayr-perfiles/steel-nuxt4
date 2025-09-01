<script lang="ts" setup>
import { type ICoil } from "~/models/coil";
import _ from "lodash";
import type { TableProps } from "ant-design-vue";
import type { IStrip } from "~/models/strip";

interface Props {
  open: boolean;
  coil: ICoil;
}

const props = defineProps<Props>();
defineEmits<{
  onClose: [];
}>();

const stripStore = useStripsStore();

const loading = ref(false);
const stripsByCoilId = ref<IStrip[]>([]);

onMounted(async () => {
  try {
    loading.value = true;
    stripsByCoilId.value = await stripStore.getByField(
      "coil.id",
      props.coil.id
    );
  } catch (error) {
    console.error(error);
    modalError("Error al cargar los rolados");
  } finally {
    loading.value = false;
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
    title: "PRODUCTO",
    key: "product",
    dataIndex: "product",
    defaultSortOrder: "descend",
    sorter: (a: any, b: any) =>
      (a.product.name as string).charCodeAt(0) -
      (b.product.name as string).charCodeAt(0),
    customRender: ({ value }) => {
      return value.name;
    },
  },
  {
    title: "FLEJES",
    key: "quantity",
    dataIndex: "quantity",
    width: "100px",
    align: "center",
  },
  // {
  //   title: "PRECIO [S/]",
  //   key: "price",
  //   dataIndex: "price",
  //   width: "100px",
  //   align: "right",
  //   customRender: ({ value }) => {
  //     return currency(value, "", 4);
  //   },
  // },
  {
    title: "",
    key: "action",
    width: "110px",
    align: "center",
  },
];
</script>

<template>
  <a-modal
    :open="open"
    :mask-closable="false"
    class="min-w-[600px]"
    :footer="null"
    @cancel="$emit('onClose')"
  >
    <template #title>
      <a-tag color="green">
        <template #icon
          >2str
          <InfoCircleOutlined />
        </template>

        <span> Bobina: {{ coil.serie }} </span>
      </a-tag>
    </template>

    <a-card>
      <a-table
        :columns="columns"
        :data-source="stripsByCoilId"
        :pagination="false"
        bordered
        :loading="loading"
      >
        <template #title>
          <span class="font-semibold">Plan de corte</span>
        </template>
      </a-table>
    </a-card>

    <!-- <pre>{{ JSON.stringify(formState, null, 2) }}</pre> -->
  </a-modal>
</template>
