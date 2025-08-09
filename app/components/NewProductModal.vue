<script lang="ts" setup>
import type { Rule } from "ant-design-vue/es/form";
import { collection, query, where } from "firebase/firestore";
import { ETypeProduct, EWaterOutlet } from "~/enums";
import { productConverter, type IProduct } from "~/models/product";

interface Props {
  open: boolean;
  type: ETypeProduct;
  product?: IProduct;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  onClose: [];
}>();

const db = useFirestore();
const envaseRef = collection(db, "products");
const q = query(
  envaseRef,
  where("type", "==", ETypeProduct.envase)
).withConverter(productConverter);

const { data: envases } = useCollection(q, {
  ssrKey: "envases",
});

const optionsEnvase = computed(() => {
  return envases.value.map((envase) => {
    return {
      label:
        envase.name +
        " - " +
        envase.brand.name +
        " - " +
        getWaterOutlet(envase.waterOutlet),
      value: envase.id,
    };
  });
});

// const { addProduct, update } = useCrudProducts();

const loading = ref(false);
const formRef = ref();
// const formState = reactive<Partial<IProduct>>({
//   type: props.type,
//   waterOutlet: EWaterOutlet.normal,
//   active: props.type === ETypeProduct.product,
//   distribution: props.type === ETypeProduct.product,
// })

const formState = reactive<Partial<IProduct>>({
  type: props.type,
  waterOutlet: EWaterOutlet.normal,
  active: props.type === ETypeProduct.product,
  distribution: props.type === ETypeProduct.product,
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
  newPlantPrice: [
    {
      required: true,
      message: "Ingresar precio!",
    },
  ],
  newDeliveryPrice: [
    {
      required: true,
      message: "Ingresar precio!",
    },
  ],
  rechargePlantPrice: [
    {
      required: true,
      message: "Ingresar precio!",
    },
  ],
  rechargeDeliveryPrice: [
    {
      required: true,
      message: "Ingresar precio!",
    },
  ],
};

const handleOk = () => {
  // formRef.value
  //   .validate()
  //   .then(async () => {
  //     try {
  //       loading.value = true;
  //       if (props.product) {
  //         await update(db, props.product.id, _CloneDeep(formState));
  //       } else {
  //         await addProduct(db, _CloneDeep(formState));
  //       }
  //       notificationSuccess(`Producto ${props.product ? "editado" : "creado"}`);
  //       emit("onClose");
  //     } catch (error: any) {
  //       modalError(error.message);
  //     } finally {
  //       loading.value = false;
  //     }
  //   })
  //   .catch((error: any) => {
  //     console.log("error", error);
  //   });
};

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 },
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
        <span>
          {{
            `Añadir ${type === ETypeProduct.product ? "producto" : "envase"}`
          }}
        </span>
      </a-tag>
    </template>

    <a-card>
      <a-form ref="formRef" :model="formState" :rules="rules" v-bind="layout">
        <a-form-item label="Nombre" name="name">
          <a-input
            v-model:value="formState.name"
            placeholder="Ingresar nombre"
          ></a-input>
        </a-form-item>

        <a-form-item
          label="Categoría"
          name="category"
          :rules="[{ required: true, message: 'Ingresar categoría!' }]"
        >
          <SelectCategoryProduct v-model:value="formState.category" />
        </a-form-item>

        <a-form-item
          label="Marca"
          name="brand"
          :rules="[{ required: true, message: 'Ingresar marca!' }]"
        >
          <SelectBrand v-model:value="formState.brand" />
        </a-form-item>

        <a-form-item label="Precio nuevo en planta" name="newPlantPrice">
          <a-input-number
            v-model:value="formState.newPlantPrice"
            class="w-full"
            placeholder="Ingresar precio!"
          ></a-input-number>
        </a-form-item>

        <a-form-item label="Precio nuevo reparto" name="newDeliveryPrice">
          <a-input-number
            v-model:value="formState.newDeliveryPrice"
            class="w-full"
            placeholder="Ingresar precio!"
          ></a-input-number>
        </a-form-item>

        <a-form-item label="Salida de agua" name="isReturnable">
          <a-radio-group
            v-model:value="formState.waterOutlet"
            name="radioGroup"
          >
            <a-radio :value="EWaterOutlet.normal">Normal</a-radio>
            <a-radio :value="EWaterOutlet.spout">Caño</a-radio>
            <a-radio :value="EWaterOutlet.other">Otro</a-radio>
          </a-radio-group>
        </a-form-item>

        <template v-if="type === ETypeProduct.product">
          <a-form-item
            v-if="type === ETypeProduct.product"
            label="Es retornable?"
            name="isReturnable"
          >
            <a-switch
              v-model:checked="formState.isReturnable"
              checked-children="Sí"
              un-checked-children="No"
            />
          </a-form-item>

          <template v-if="formState.isReturnable">
            <a-form-item
              label="Precio de recarga en planta"
              name="rechargePlantPrice"
            >
              <a-input-number
                v-model:value="formState.rechargePlantPrice"
                class="w-full"
                placeholder="Ingresar precio!"
              ></a-input-number>
            </a-form-item>

            <a-form-item
              label="Precio de recarga en reparto"
              name="rechargeDeliveryPrice"
            >
              <a-input-number
                v-model:value="formState.rechargeDeliveryPrice"
                class="w-full"
                placeholder="Ingresar precio!"
              ></a-input-number>
            </a-form-item>
          </template>

          <a-form-item label="Envase" name="envase">
            <SelectEnvase v-model:value="formState.envase" />
          </a-form-item>
        </template>

        <a-form-item label="Activo" name="active">
          <a-switch
            v-model:checked="formState.active"
            checked-children="Sí"
            un-checked-children="No"
          />
        </a-form-item>

        <a-form-item label="Reparto" name="distribution">
          <a-switch
            v-model:checked="formState.distribution"
            checked-children="Sí"
            un-checked-children="No"
          />
        </a-form-item>

        <!-- <a-form-item label="Incluir en resumen" name="isSummary">
          <a-switch v-model:checked="formState.isSummary" checked-children="Sí" un-checked-children="No" />
        </a-form-item> -->
      </a-form>
    </a-card>

    <!-- <pre>{{ JSON.stringify(formState, null, 2) }}</pre> -->
  </a-modal>
</template>
