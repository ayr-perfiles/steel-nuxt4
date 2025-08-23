<script lang="ts" setup>
import _ from "lodash";
import type { IMovement } from "~/models/movement";
import type { Dayjs } from "dayjs";
import type { IStrip } from "~/models/strip";
import { layout } from "~/constants";

interface Props {
  open: boolean;
  strip: IStrip;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  onClose: [];
}>();

const dayjs = useDayjs();

const loading = ref(false);
const formState = reactive<Partial<IMovement>>({
  date: dayjs(),
  strip: props.strip,
});

const handleOk = async () => {
  try {
    loading.value = true;

    notificationSuccess(`Se añadió`);
    emit("onClose");
  } catch (error: any) {
    modalError(error.message);
  } finally {
    loading.value = false;
  }
};

watchEffect(() => {
  // Object.assign(
  //   movements,
  //   stripsByCoil.value
  //     .filter((item) => item.quantityAvailable > 0)
  //     .map((item) => {
  //       return {
  //         strip: item,
  //       };
  //     })
  // );
});

// datepicker
const disabledDate = (current: Dayjs) => {
  // Can not select days before today and today
  return current && current > dayjs().endOf("day");
};
// end datepicker
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
      <!-- <template v-if="formState.strip. === 0">
        <span>No hay flejes</span>
      </template> -->
      <a-form v-bind="layout">
        <a-form-item label="Fecha" name="date">
          <a-date-picker
            v-model:value="formState.date as Dayjs"
            format="DD-MM-YYYY HH:mm:ss"
            :disabled-date="disabledDate"
            :show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
          />
        </a-form-item>

        <a-form-item label="Bobina" name="coil">
          <span>{{ strip.coil.serie }}</span>
        </a-form-item>

        <a-form-item label="Product" name="product">
          <span>{{ strip.product.name }}</span>
        </a-form-item>

        <a-form-item label="Flejes Disponible" name="quantityAvailable">
          <span>{{ strip.quantityAvailable }}</span>
        </a-form-item>

        <a-form-item label="Cantidad" name="quantity">
          <a-input-number
            v-model:value="formState.quantity"
            class="w-full"
            placeholder="Ingresar cantidad"
            :min="1"
          ></a-input-number>
        </a-form-item>
      </a-form>
    </a-card>

    <pre>{{ JSON.stringify(formState, null, 2) }}</pre>
  </a-modal>
</template>
