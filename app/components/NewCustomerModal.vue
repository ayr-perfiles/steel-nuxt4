<script lang="ts" setup>
import type { Rule } from "ant-design-vue/es/form";
import { layout } from "~/constants";
import { type ICustomer } from "~/models/customer";
import _ from "lodash";

interface Props {
  open: boolean;
  customer?: ICustomer;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  onClose: [];
}>();

const loading = ref(false);
const formRef = ref();

const formState = reactive<Partial<ICustomer>>({});

onMounted(() => {
  if (props.customer) {
    Object.assign(formState, { ...props.customer });
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

const { add: addCustomer, update: updateCustomer } = useCrudCustomers();

const handleOk = () => {
  formRef.value
    .validate()
    .then(async () => {
      try {
        loading.value = true;
        if (props.customer) {
          await updateCustomer(
            props.customer.id,
            _.cloneDeep(formState as ICustomer)
          );
        } else {
          await addCustomer(_.cloneDeep(formState as ICustomer));
        }
        // notificationSuccess(`Customero ${props.customer ? "editado" : "creado"}`);
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

        {{ props.customer ? "Editar " : "Agregar " }}
        <span> Cliente </span>
      </a-tag>
    </template>

    <a-form ref="formRef" :model="formState" :rules="rules" v-bind="layout">
      <a-card>
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
      </a-card>
    </a-form>

    <!-- <pre>{{ JSON.stringify(formState, null, 2) }}</pre> -->
  </a-modal>
</template>
