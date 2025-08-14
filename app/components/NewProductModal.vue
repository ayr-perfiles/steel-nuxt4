<script lang="ts" setup>
import type { Rule } from "ant-design-vue/es/form";
import { layout } from "~/constants";
import { type IProduct } from "~/models/product";
import _ from "lodash";

interface Props {
  open: boolean;
  product?: IProduct;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  onClose: [];
}>();

const loading = ref(false);
const formRef = ref();

const formState = reactive<Partial<IProduct>>({
  name: "",
});

onMounted(() => {
  if (props.product) {
    Object.assign(formState, { ...props.product });
  }
});

const rules: Record<string, Rule[]> = {
  name: [
    {
      required: true,
      message: "Ingresar nombre!",
    },
  ],
  width: [
    {
      required: true,
      message: "Ingresar peso!",
    },
  ],
};

const { add: addProduct, update: updateProduct } = useCrudProducts();

const handleOk = () => {
  formRef.value
    .validate()
    .then(async () => {
      try {
        loading.value = true;
        if (props.product) {
          await updateProduct(
            props.product.id,
            _.cloneDeep(formState as IProduct)
          );
        } else {
          await addProduct(_.cloneDeep(formState as IProduct));
        }
        // notificationSuccess(`Producto ${props.product ? "editado" : "creado"}`);
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

        {{ props.product ? "Editar " : "Agregar " }}
        <span> producto </span>
      </a-tag>
    </template>

    <a-form ref="formRef" :model="formState" :rules="rules" v-bind="layout">
      <a-card>
        <a-form-item label="Nombre" name="name">
          <a-input
            v-model:value="formState.name"
            placeholder="Ingresar nombre"
          ></a-input>
        </a-form-item>

        <a-form-item label="Ancho [mm]" name="width">
          <a-input-number
            v-model:value="formState.width"
            class="w-full"
            placeholder="Ingresar ancho"
          ></a-input-number>
        </a-form-item>
      </a-card>
    </a-form>

    <!-- <pre>{{ JSON.stringify(formState, null, 2) }}</pre> -->
  </a-modal>
</template>
