<script lang="ts" setup>
import type { Rule } from "ant-design-vue/es/form";
import { layout } from "~/constants";
import { type ICoil } from "~/models/coil";
import _ from "lodash";
import { EStatusCoil } from "~/enums";

interface Props {
  open: boolean;
  coil?: ICoil;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  onClose: [];
}>();

const loading = ref(false);
const formRef = ref();

const formState = reactive<Partial<ICoil>>({
  serie: "",
  width: 1200,
  thickness: 0.45,
  density: 7.85,
  status: EStatusCoil.process,
  isCutting: false,
});

onMounted(() => {
  if (props.coil) {
    Object.assign(formState, { ...props.coil });
  }
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

const handleOk = () => {
  formRef.value
    .validate()
    .then(async () => {
      try {
        loading.value = true;
        if (props.coil) {
          await updateCoil(props.coil.id, _.cloneDeep(formState as ICoil));
        } else {
          await addCoil(_.cloneDeep(formState as ICoil));
        }
        notificationSuccess(`Se añadió`);
        emit("onClose");
        console.log("finish!");
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
</script>

<template>
  <a-modal
    :open="open"
    :mask-closable="false"
    :confirm-loading="loading"
    class="w-[600px]"
    @cancel="$emit('onClose')"
    @ok="handleOk"
  >
    <template #title>
      <a-tag color="green">
        <template #icon>
          <PlusOutlined />
        </template>

        {{ props.coil ? "Editar " : "Agregar " }}
        <span> bobina </span>
      </a-tag>
    </template>

    <a-form ref="formRef" :model="formState" :rules="rules" v-bind="layout">
      <a-card>
        <a-form-item label="Serie" name="serie">
          <a-input
            v-model:value="formState.serie"
            placeholder="Ingresar serie"
          ></a-input>
        </a-form-item>

        <a-form-item label="Peso kg" name="weight">
          <a-input-number
            v-model:value="formState.weight"
            class="w-full"
            placeholder="Ingresar peso"
          ></a-input-number>
        </a-form-item>

        <a-form-item label="Precio por kg" name="price">
          <a-input-number
            v-model:value="formState.price"
            class="w-full"
            placeholder="Ingresar precio por kg"
          ></a-input-number>
        </a-form-item>

        <a-form-item label="Ancho mm" name="width">
          <a-input-number
            v-model:value="formState.width"
            class="w-full"
            placeholder="Ingresar ancho"
          ></a-input-number>
        </a-form-item>

        <a-form-item label="Espesor mm" name="thickness">
          <a-input-number
            v-model:value="formState.thickness"
            class="w-full"
            placeholder="Ingresar Espesor"
          ></a-input-number>
        </a-form-item>

        <a-form-item label="Factor kg/m^3" name="density">
          <a-input-number
            v-model:value="formState.density"
            class="w-full"
            placeholder="Ingresar factor"
          ></a-input-number>
        </a-form-item>
      </a-card>
    </a-form>

    <!-- <pre>{{ JSON.stringify(formState, null, 2) }}</pre> -->
  </a-modal>
</template>
