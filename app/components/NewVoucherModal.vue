<script lang="ts" setup>
import type { Rule } from "ant-design-vue/es/form";
import { layout } from "~/constants";
import { type IVoucher } from "~/models/voucher";
import _ from "lodash";
import type { TableProps } from "ant-design-vue";
import { ETypeVoucher } from "~/enums";
import type { Dayjs } from "dayjs";
import type { ICustomer } from "~/models/customer";

interface IItemDetail {
  productId: string;
  productName: string;
  productPrice: number;
  price: number;
  stock: number;
  quantity: number;
}

interface Props {
  open: boolean;
  voucher?: IVoucher;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  onClose: [];
}>();

const dayjs = useDayjs();

const loading = ref(false);
const formRef = ref();
const items = reactive<Partial<IItemDetail>[]>([]);
const formState = reactive<Partial<IVoucher>>({
  date: dayjs(),
  numberVoucher: 0,
  typeVoucher: ETypeVoucher.sale,
  details: [],
});

onMounted(() => {
  if (props.voucher) {
    Object.assign(formState, {
      ...props.voucher,
      date: dayjs(props.voucher.date as Date),
    });
  }
});

const rules: Record<string, Rule[]> = {
  date: [
    {
      required: true,
      message: "Ingresar fecha",
    },
  ],
  customer: [
    {
      required: true,
      message: "Ingresar cliente!",
    },
  ],
};

const totals = computed(() => {
  const totalBorrow = items
    .map((item) => (item.quantity || 0) * (item.price || 0))
    .reduce((prev: number, val: number) => prev + val, 0);

  return {
    totalBorrow: getNumberRound(totalBorrow, 2),
  };
});

const { add: addVoucher, update: updateVoucher } = useCrudVouchers();
const { data: products, pending } = useCrudProducts();

const handleOk = () => {
  if (totals.value.totalBorrow === 0) {
    modalError("Agregar al menos un producto");
    return;
  }

  formRef.value
    .validate()
    .then(async () => {
      try {
        loading.value = true;

        const unReactiveForm = _.cloneDeep(formState);
        const unReactiveItems = _.cloneDeep(items);

        const objDetails = _.cloneDeep(
          unReactiveItems
            .filter((item) => item.quantity && item.price)
            .map(
              (item) =>
                ({
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.price,
                  igv: 1.18,
                  rode: getNumberRound(
                    (item.quantity || 0) * (item.price || 0),
                    5
                  ),
                } as IVoucher["details"][0])
            )
        );

        unReactiveForm.date = (unReactiveForm.date as Dayjs).toDate();
        unReactiveForm.total = totals.value.totalBorrow;
        (unReactiveForm.productIds = objDetails.map(
          (detail: any) => detail.productId
        )),
          (unReactiveForm.details = objDetails);
        unReactiveForm.customer = {
          id: unReactiveForm.customer?.id || "",
          businessEntity: unReactiveForm.customer?.businessEntity || "",
        };

        if (props.voucher) {
          await updateVoucher(props.voucher.id, unReactiveForm as IVoucher);
        } else {
          await addVoucher(unReactiveForm as IVoucher);
        }
        notificationSuccess(
          `Comprobante ${props.voucher ? "editado" : "creado"}`
        );
        emit("onClose");
      } catch (error: any) {
        modalError(error.message);
      } finally {
        loading.value = false;
      }
    })
    .catch((error: any) => {
      console.log("error", error);
    });
};

onMounted(() => {
  if (props.voucher) {
    Object.assign(formState, {
      ...props.voucher,
      date: dayjs(props.voucher.date as Date),
    });

    if (props.voucher.details && props.voucher.details.length) {
      Object.assign(
        items,
        props.voucher.details.map((detail) => {
          const product = products.value.find((p) => p.id === detail.productId);
          return {
            productId: detail.productId,
            productName: product?.name || "",
            productPrice: product?.price || 0,
            price: detail.price,
            stock: product?.stock || 0,
            quantity: detail.quantity,
          };
        })
      );
    }
  }
});

watchEffect(() => {
  if (!props.voucher) {
    Object.assign(
      items,
      products.value
        .filter((item) => item.stock > 0)
        .map((item) => {
          return {
            productId: item.id,
            productName: item.name,
            productPrice: item.price || 0,
            price: item.price || 0,
            stock: item.stock || 0,
            // quantity: 0,
          };
        })
    );
  }
});

const disabledDate = (current: Dayjs) => {
  // Can not select days before today and today
  return current && current > dayjs().endOf("day");
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
    title: "PRODUCTO",
    key: "productName",
    dataIndex: "productName",
    // sorter: (a: any, b: any) =>
    //   (a.name as string).charCodeAt(0) - (b.name as string).charCodeAt(0),
    // customRender: ({ value }) => {
    //   return `${value.name}`;
    // },
  },
  {
    title: "STOCK",
    key: "stock",
    dataIndex: "stock",
    width: "100px",
    align: "center",
  },
  {
    title: "CANTIDAD",
    key: "quantity",
    dataIndex: "quantity",
    width: "100px",
    align: "center",
  },
  {
    title: "PRECIO",
    key: "price",
    dataIndex: "price",
    width: "100px",
    align: "right",
  },
  {
    title: "MONTO",
    key: "total",
    dataIndex: "total",
    width: "100px",
    align: "right",
    customRender: ({ record }) => {
      const total = getNumberRound(
        (record.quantity || 0) * (record.price || 0),
        5
      );
      return currency(total, "", 5);
    },
  },
];
</script>

<template>
  <a-modal
    :open="open"
    :mask-closable="false"
    :confirm-loading="loading"
    class="w-full"
    wrap-class-name="full-modal"
    destroy-on-close
    @cancel="$emit('onClose')"
    @ok="handleOk"
  >
    <template #title>
      <a-tag color="green">
        <template #icon>
          <PlusOutlined />
        </template>

        {{ props.voucher ? `Editar ` : "Agregar " }}
        <span>
          Venta{{
            `${props.voucher ? `: ${props.voucher.numberVoucher}` : ""}`
          }}</span
        >
      </a-tag>
    </template>
    <a-card>
      <a-card title="Datos del comprobante" class="w-[600px] shadow-md">
        <a-form ref="formRef" :model="formState" :rules="rules" v-bind="layout">
          <a-form-item label="Fecha" name="date">
            <a-date-picker
              v-model:value="formState.date as Dayjs"
              format="DD-MM-YYYY HH:mm:ss"
              :disabled-date="disabledDate"
              :show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
            />
          </a-form-item>

          <a-form-item label="Cliente" name="customer">
            <SelectCustomer v-model="formState.customer as ICustomer" />
          </a-form-item>
        </a-form>
      </a-card>

      <a-card
        title="Detalle de productos"
        class="mt-4 shadow-md w-[900px]"
        :loading="pending"
      >
        <a-table
          row-key="productName"
          :columns="columns"
          :data-source="items"
          :loading="pending"
          bordered
          :pagination="false"
        >
          <template #bodyCell="{ column, text, record }">
            <template
              v-if="['quantity', 'price'].includes(column.dataIndex as string)"
            >
              <div>
                <a-input-number
                  :min="column.dataIndex === 'quantity' ? 1 : 0"
                  :max="
                    column.dataIndex === 'quantity' ? record.stock : undefined
                  "
                  v-model:value="record[column.dataIndex as keyof IItemDetail]"
                ></a-input-number>
              </div>
            </template>
          </template>

          <template #summary>
            <a-table-summary-row>
              <a-table-summary-cell col-span="5" align="right">
                <a-typography-text type="danger">TOTAL</a-typography-text>
              </a-table-summary-cell>
              <a-table-summary-cell align="right">
                <a-typography-text type="danger">{{
                  totals.totalBorrow
                }}</a-typography-text>
              </a-table-summary-cell>
            </a-table-summary-row>
          </template>
        </a-table>
      </a-card>
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
