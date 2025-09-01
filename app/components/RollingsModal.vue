<script lang="ts" setup>
import _ from "lodash";
import type { TableProps } from "ant-design-vue";
import type { IStrip } from "~/models/strip";
import type { IRolling } from "~/models/rolling";

interface Props {
  open: boolean;
  strip: IStrip;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  onClose: [];
}>();

const rollingStore = useRollingStore();
const dayjs = useDayjs();

const loading = ref(false);
const rollings = ref<IRolling[]>([]);

const { getRollingsByStripId, remove: removeRolling } = useCrudRollings();

const handleRemove = async (id: string) => {
  Modal.confirm({
    title: "¿Estás seguro de eliminar este rolado?",
    content: "Esta acción no se puede deshacer.",
    okText: "Sí, eliminar",
    okType: "danger",
    cancelText: "Cancelar",
    async onOk() {
      try {
        await removeRolling(id);
        const data = await getRollingsByStripId(props.strip.id);
        rollings.value = data;
        notificationSuccess("Rolado eliminado correctamente");
      } catch (error) {
        modalError(error);
      }
    },
    onCancel() {
      // No action needed on cancel
    },
  });
};

onMounted(async () => {
  try {
    loading.value = true;
    rollings.value = await rollingStore.getByField("stripId", props.strip.id);
  } catch (error) {
    modalError("Error al cargar los rolados");
    console.error(error);
  } finally {
    loading.value = false;
  }
});

// onMounted(async () => {
//   try {
//     const data = await getRollingsByStripId(props.strip.id);
//     rollings.value = data;
//   } catch (error) {
//     modalError(error);
//   }
// });

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
    title: "FECHA",
    key: "date",
    dataIndex: "date",
    width: "120px",
    align: "center",
    defaultSortOrder: "descend",
    sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    customRender: ({ value }) => {
      return dayjs(value).format("DD/MM/YYYY HH:mm");
    },
  },
  {
    title: "CANTIDAD",
    key: "quantity",
    dataIndex: "quantity",
    width: "80px",
    align: "center",
  },
  {
    title: "",
    key: "action",
    width: "120px",
    align: "center",
  },
  {
    title: "",
  },
];
</script>

<template>
  <a-modal
    :open="open"
    :mask-closable="false"
    class="w-full"
    wrap-class-name="full-modal"
    :footer="null"
    @cancel="$emit('onClose')"
  >
    <template #title>
      <span>
        <a-tag color="green"> Rolados: </a-tag>
        {{ `Bobina(${strip.coil.serie}) | ${strip.coil.weight} [kg] ` }}
      </span>
    </template>
    <a-card>
      <a-table
        :columns="columns"
        :data-source="rollings"
        :pagination="false"
        :scroll="{ x: 1100 }"
        bordered
        :loading="loading"
      >
        <template #title>
          <a-typography-title :level="5">
            {{ `Listado de Rolados  (${strip.product.name})` }}
          </a-typography-title>
        </template>

        <template #bodyCell="{ column, text, record, value }">
          <template v-if="column.dataIndex === 'stock'">
            <a-tag v-if="text">{{ text }}</a-tag>
            <span v-else>-</span>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-button type="link" danger @click="handleRemove(record.id)">
              Eliminar
            </a-button>
          </template>
        </template>
      </a-table>
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
