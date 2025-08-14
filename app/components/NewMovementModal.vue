<script lang="ts" setup>
import { type ICoil } from "~/models/coil";
import _ from "lodash";
import type { TableProps } from "ant-design-vue";
import type { IMovement } from "~/models/movement";
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

const loading = ref(false);
const value1 = ref<Dayjs>(dayjs());

// const formRef = ref();

const { data: strips } = useCrudStrips(props.coil.id);
const { addAll: addAllMovements, pending } = useCrudMovements();

const movements = reactive<IMovement[]>([]);

const handleOk = async () => {
  if (movements.length > 0) {
    try {
      loading.value = true;
      await addAllMovements(
        _.cloneDeep(
          movements
            .filter((item) => item.quantity)
            .map((item) => {
              return { ...item, date: value1.value.toDate() };
            })
        )
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

watchEffect(() => {
  Object.assign(
    movements,
    strips.value.map((item) => {
      return {
        coil: {
          id: props.coil.id,
          serie: props.coil.serie,
        },
        product: {
          id: item.product.id,
          name: item.product.name,
        },
      } as IMovement;
    })
  );
});

// datepicker
const range = (start: number, end: number) => {
  const result = [];

  for (let i = start; i < end; i++) {
    result.push(i);
  }

  return result;
};

const disabledDate = (current: Dayjs) => {
  // Can not select days before today and today
  return current && current > dayjs().endOf("day");
};

// end datepicker

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
        <span> Rolado </span>
      </a-tag>
    </template>

    <a-card>
      <template v-if="strips.length < 1">
        <span>No hay cortes</span>
      </template>
      <template v-else>
        <a-form>
          <a-form-item>
            <p>Bobina serie: {{ coil.serie }}</p>
          </a-form-item>

          <a-form-item>
            <a-date-picker
              v-model:value="value1"
              format="DD-MM-YYYY HH:mm:ss"
              :disabled-date="disabledDate"
              :show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
            />
          </a-form-item>
        </a-form>

        <a-table
          :row-key="(item: IMovement) => item.product.id"
          :columns="columns"
          :data-source="movements"
          :loading="pending"
          bordered
          :pagination="false"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="['quantity'].includes(column.dataIndex as string)">
              <div>
                <a-input-number
                  v-model:value="record.quantity"
                ></a-input-number>
              </div>
            </template>
          </template>
        </a-table>
      </template>
    </a-card>

    <!-- <pre>{{ JSON.stringify(movements, null, 2) }}</pre> -->
  </a-modal>
</template>
