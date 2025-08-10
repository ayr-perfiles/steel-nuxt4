<script lang="ts" setup>
import type { Rule } from "ant-design-vue/es/form";
import { layout } from "~/constants";
import { type IVoucher } from "~/models/voucher";
import _ from "lodash";
import type { IStrip } from "~/models/strip";
import type { TableProps } from "ant-design-vue";
import type { IMovement } from "~/models/movement";

interface Props {
  open: boolean;
  voucher?: IVoucher;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  onClose: [];
}>();

const loading = ref(false);
const formRef = ref();
const movements = reactive<IMovement[]>([]);
const formState = reactive<Partial<IVoucher>>({});

onMounted(() => {
  if (props.voucher) {
    Object.assign(formState, { ...props.voucher });
  }
});

const rules: Record<string, Rule[]> = {
  identity: [
    {
      required: true,
      message: "Ingresar RUC/DNI!",
    },
  ],
  businessEntity: [
    {
      required: true,
      message: "Ingresar razón social!",
    },
  ],
};

const { add: addVoucher, update: updateVoucher } = useCrudVouchers();
const { data: products, pending } = useCrudProducts();

const handleOk = () => {
  formRef.value
    .validate()
    .then(async () => {
      try {
        loading.value = true;
        if (props.voucher) {
          await updateVoucher(
            props.voucher.id,
            _.cloneDeep(formState as IVoucher)
          );
        } else {
          await addVoucher(_.cloneDeep(formState as IVoucher));
        }
        // notificationSuccess(`Vouchero ${props.voucher ? "editado" : "creado"}`);
        emit("onClose");
      } catch (error: any) {
        // modalError(error.message);
      } finally {
        loading.value = false;
      }
    })
    .catch((error: any) => {
      console.log("error", error);
    });
};

watchEffect(() => {
  Object.assign(
    movements,
    products.value.map((item) => {
      return {
        product: {
          id: item.id,
          name: item.name,
          width: item.width,
        },
        stock: item.stock,
      };
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
];
</script>

<template>
  <a-modal
    :open="open"
    :mask-closable="false"
    :confirm-loading="loading"
    class="w-full"
    wrap-class-name="full-modal"
    @cancel="$emit('onClose')"
    @ok="handleOk"
  >
    <template #title>
      <a-tag color="green">
        <template #icon>
          <PlusOutlined />
        </template>

        {{ props.voucher ? "Editar " : "Agregar " }}
        <span> Venta</span>
      </a-tag>
    </template>
    <a-card>
      <!-- <a-form ref="formRef" :model="formState" :rules="rules" v-bind="layout">
        <a-form-item label="RUC/DNI" name="identity">
          <a-input
            v-model:value="formState.identity"
            placeholder="Ingresar RUC/DNI"
          ></a-input>
        </a-form-item>

        <a-form-item label="Razón social" name="businessEntity">
          <a-input
            v-model:value="formState.businessEntity"
            class="w-full"
            placeholder="Ingresar razón social"
          ></a-input>
        </a-form-item>

        <a-form-item label="Dirección" name="address">
          <a-input
            v-model:value="formState.address"
            class="w-full"
            placeholder="Ingresar dirección"
          ></a-input>
        </a-form-item>
    </a-form> -->

      <a-table
        :row-key="(item: IStrip) => item.product.id"
        :columns="columns"
        :data-source="movements"
        :loading="pending"
        bordered
        :pagination="false"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="['quantity'].includes(column.dataIndex as string)">
            <div>
              <a-input-number v-model:value="record.quantity"></a-input-number>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- <pre>{{ JSON.stringify(formState, null, 2) }}</pre> -->
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
