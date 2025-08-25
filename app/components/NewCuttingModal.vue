<script lang="ts" setup>
import { type ICoil } from "~/models/coil";
import _ from "lodash";
import type { IStrip } from "~/models/strip";
import type { TableProps } from "ant-design-vue";
import type { Dayjs } from "dayjs";

interface Props {
  open: boolean;
  coil: ICoil;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  onClose: [];
}>();

const dayjs = useDayjs();
const value1 = ref<Dayjs>(dayjs());

const loading = ref(false);

const { data: products, pending } = useCrudProducts();
const { addAll: addAllStrips } = useCrudStrips(props.coil.id);

const strips = reactive<IStrip[]>([]);

const weightStripsTotal = computed(() =>
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
  () => props.coil.total / weightStripsTotal.value
);

const handleCalCost = (val: number | string) => {
  Object.assign(
    strips,
    strips.map((item) => {
      if (!item.quantity) return { coil: item.coil, product: item.product };

      const calcWeightStrip =
        (props.coil.weight / (props.coil.width / 1000)) *
        (item.product.width / 1000);

      const calcPriceStrip = calcWeightStrip * calcPriceReal.value;

      return {
        ...item,
        weightStrips: parseFloat((calcWeightStrip * item.quantity).toFixed(4)),
        priceRealPerKilogram: parseFloat(calcPriceReal.value.toFixed(4)),
        pricePerStrip: parseFloat(calcPriceStrip.toFixed(4)),
        // formula: `(${props.coil.weight} / (${props.coil.width} / 1000)) * (${item.product.width} / 1000) * ${calcPriceReal.value} = ${calcPriceStrip}`,
        // costo: `${calcPriceStrip} / ${calcCoil} = ${calcPriceStrip / calcCoil}`,
      };
    })
  );
};

const handleOk = async () => {
  if (strips.length > 0) {
    try {
      loading.value = true;
      await addAllStrips(
        _.cloneDeep(
          strips
            .filter((item) => item.quantity)
            .map((item) => {
              return { ...item, date: value1.value.toDate() };
            })
        ),
        props.coil.id
      );
      notificationSuccess(`Se añadió`);
      emit("onClose");
      console.log("finish!");
    } catch (error: any) {
      modalError(error.message);
    } finally {
      loading.value = false;
    }
  }
};

const disabledDate = (current: Dayjs) => {
  // Can not select days before today and today
  return current && current > dayjs().endOf("day");
};

watchEffect(() => {
  Object.assign(
    strips,
    products.value.map((item) => {
      return {
        coil: {
          id: props.coil.id,
          serie: props.coil.serie,
          weight: props.coil.weight,
        },
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
    defaultSortOrder: "descend",
    sorter: (a: any, b: any) =>
      (b.product.name as string).charCodeAt(0) -
      (a.product.name as string).charCodeAt(0),
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
    key: "weightStrips",
    dataIndex: "weightStrips",
    width: "100px",
    align: "right",
    customRender: ({ value }) => {
      return value ? `${value} [kg]` : "-";
    },
  },
  {
    title: "PRECIO REAL X KG [S/]",
    key: "priceRealPerKilogram",
    dataIndex: "priceRealPerKilogram",
    width: "150px",
    align: "right",
    // customRender: ({ value }) => {
    //   return currency(value, "", 4);
    // },
  },
  {
    title: "PRECIO X FLEJE [S/]",
    key: "pricePerStrip",
    dataIndex: "pricePerStrip",
    width: "130px",
    align: "right",
    // customRender: ({ value }) => {
    //   return currency(value, "", 4);
    // },
  },
  // {
  //   title: "TEMP",
  //   key: "price",
  //   dataIndex: "price",
  //   width: "100px",
  //   align: "center",
  //   // customRender: ({ value }) => {
  //   //   return currency(value, "", 4);
  //   // },
  // },
  // {
  //   title: "COSTO POR UNIDAD",
  //   key: "costo",
  //   dataIndex: "costo",
  //   width: "100px",
  //   align: "center",
  //   // customRender: ({ value }) => {
  //   //   return currency(value, "", 4);
  //   // },
  // },
];
</script>

<template>
  <a-modal
    :open="open"
    :mask-closable="false"
    :confirm-loading="loading"
    :width="1000"
    :ok-button-props="{
      disabled: weightStripsTotal > coil.weight || weightStripsTotal === 0,
    }"
    @cancel="$emit('onClose')"
    @ok="handleOk"
  >
    <template #title>
      <a-tag color="green">
        <template #icon>
          <PlusOutlined />
        </template>
        <span> Plan de corte</span>
      </a-tag>
    </template>

    <a-card>
      <a-form>
        <a-form-item>
          <a-date-picker
            v-model:value="value1"
            format="DD-MM-YYYY HH:mm:ss"
            :disabled-date="disabledDate"
            :show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
          />
        </a-form-item>

        <a-form-item>
          <p>Bobina serie: {{ coil.serie }}</p>
          <p>Bobina preso: {{ coil.weight }}</p>
          <p>Peso flejes: {{ currency(weightStripsTotal, "", 4) }}</p>
          <!-- <p>
            <strong>
              calculo de bobina: {{ currency(calcCoil, "", 4) }}
            </strong>
            {{
              `| formula: (${props.coil.weight} / (${props.coil.width} / 1000) / ${props.coil.density} / ${props.coil.thickness} `
            }}
          </p> -->
          <p>
            <strong> Precio real: {{ currency(calcPriceReal, "", 4) }} </strong>
            {{ `| formula: ${props.coil.total} / ${weightStripsTotal}` }}
          </p>
        </a-form-item>
      </a-form>

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
                min="1"
                @change="handleCalCost"
              ></a-input-number>
            </div>
          </template>
        </template>

        <template #summary>
          <a-table-summary-row>
            <a-table-summary-cell col-span="4" align="right">
              <p>Peso flejes: {{ weightStripsTotal }} [kg]</p>
              <p>Peso bobina: {{ coil.weight }} [kg]</p>
              <a-divider />
              <p :class="weightStripsTotal > coil.weight ? 'text-red-500' : ''">
                Peso dif: {{ coil.weight - weightStripsTotal }} [kg]
              </p>
            </a-table-summary-cell>
            <a-table-summary-cell col-span="2"> </a-table-summary-cell>
          </a-table-summary-row>
        </template>
      </a-table>

      <br />

      <a-alert
        v-if="weightStripsTotal > coil.weight"
        :message="`El peso total de los flejes (${weightStripsTotal} [kg]) excede el peso de la bobina (${coil.weight} [kg])`"
        type="error"
      />
    </a-card>

    <!-- <pre>{{ JSON.stringify(strips, null, 2) }}</pre> -->
  </a-modal>
</template>
