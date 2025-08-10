<script lang="ts" setup>
import type { FormInstance, Rule } from "ant-design-vue/es/form";
import { type ICoil } from "~/models/coil";
import _ from "lodash";
import { EStatusCoil } from "~/enums";
import type { IStrip } from "~/models/strip";
import type { TableProps } from "ant-design-vue";

interface Props {
  open: boolean;
  coil: ICoil;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  onClose: [];
}>();

const loading = ref(false);
// const formRef = ref();

const formState = reactive<Partial<ICoil>>({
  serie: "",
  width: 1200,
  thickness: 0.45,
  density: 7.85,
  status: EStatusCoil.process,
});

const rules: Record<string, Rule[]> = {
  serie: [
    {
      required: true,
      message: "Ingresar serie!",
    },
  ],
  weight: [
    {
      required: true,
      message: "Ingresar peso!",
    },
  ],
  price: [
    {
      required: true,
      message: "Ingresar precio!",
    },
  ],
  width: [
    {
      required: true,
      message: "Ingresar ancho!",
    },
  ],
  thickness: [
    {
      required: true,
      message: "Ingresar thickness!",
    },
  ],
  density: [
    {
      required: true,
      message: "Ingresar factor!",
    },
  ],
};

const { add: addCoil, update: updateCoil } = useCrudCoils();
const { data: products, pending } = useCrudProducts();
const { addAll: addAllStrips } = useCrudStrips(props.coil.id);

const formRef = ref<FormInstance>();
const strips = reactive<IStrip[]>([]);

const calcCoil =
  props.coil.weight /
  (props.coil.width / 1000) /
  props.coil.density /
  props.coil.thickness /
  props.coil.price;

const calcWeightStripsTotal = computed(() =>
  strips
    .filter((item) => item.quantity)
    .map(
      (item) =>
        (props.coil.weight / (props.coil.width / 1000)) *
        (item.product.width / 1000) *
        item.quantity
    )
    .reduce((prev: number, val: number) => prev + val, 0)
);

const calcPriceReal = computed(
  () => props.coil.total / calcWeightStripsTotal.value
);

const handleCalCost = (val: number | string) => {
  Object.assign(
    strips,
    strips.map((item) => {
      if (!item.quantity) return { ...item };

      const calcWeightStrip =
        (props.coil.weight / (props.coil.width / 1000)) *
        (item.product.width / 1000);
      const calcPriceStrip = calcWeightStrip * calcPriceReal.value;

      return {
        ...item,
        price: calcPriceStrip / calcCoil,
      };
    })
  );
};

const handleOk = async () => {
  if (strips.length > 0) {
    try {
      loading.value = true;
      await addAllStrips(_.cloneDeep(strips.filter((item) => item.quantity)));
      console.log("finish!");
    } catch (error) {
      console.log(error);
    } finally {
      loading.value = false;
    }
  }
};

watchEffect(() => {
  Object.assign(
    strips,
    products.value.map((item) => {
      return {
        product: { id: item.id, name: item.name, width: item.width },
      } as IStrip;
    })
  );
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
    sorter: (a: any, b: any) =>
      (a.name as string).charCodeAt(0) - (b.name as string).charCodeAt(0),
    customRender: ({ value }) => {
      return `${value.name}`;
    },
  },
  {
    title: "CANTIDAD",
    key: "quantity",
    dataIndex: "quantity",
    width: "100px",
    align: "center",
  },
  {
    title: "PESO",
    key: "weight",
    dataIndex: "weight",
    width: "100px",
    align: "center",
    customRender: ({ record }) =>
      record.quantity
        ? (props.coil.weight / (props.coil.width / 1000)) *
          (record.product.width / 1000) *
          record.quantity
        : "-",
  },
  {
    title: "COSTO",
    key: "price",
    dataIndex: "price",
    width: "100px",
    align: "center",
  },
];
</script>

<template>
  <a-modal
    :open="open"
    :mask-closable="false"
    :confirm-loading="loading"
    @cancel="$emit('onClose')"
    @ok="handleOk"
  >
    <template #title>
      <a-tag color="green">
        <template #icon>
          <PlusOutlined />
        </template>
        <span> Plan de corte {{ coil.serie }}</span>
      </a-tag>
    </template>

    <a-card>
      <a-table
        :row-key="(item: IStrip) => item.product.id"
        :columns="columns"
        :data-source="strips"
        :loading="pending"
        bordered
        :pagination="false"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="['quantity'].includes(column.dataIndex as string)">
            <div>
              <a-input-number
                v-model:value="record.quantity"
                @change="handleCalCost"
              ></a-input-number>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- <pre>{{ JSON.stringify(strips, null, 2) }}</pre> -->
  </a-modal>
</template>
