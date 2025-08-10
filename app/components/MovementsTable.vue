<script lang="ts" setup>
import type { TableProps } from "ant-design-vue";
import _ from "lodash";
import type { IMovement } from "~/models/movement";

interface Movement {
  id: string;
  name: string;
  stock: number;
}

const emit = defineEmits<{
  onSelected: [movement: Movement];
}>();

const dayjs = useDayjs();

const open = ref(false);
const openCuttingPlan = ref(false);
const openRolling = ref(false);
const movement = ref<IMovement>();

const { data: movements, pending, remove } = useCrudMovements();

const handleRemove = (id: string) => {
  // try {
  //   Modal.confirm({
  //     title: "Eliminar movemento?",
  //     onOk: async () => {
  //       await remove(db, id)
  //       notificationSuccess("movemento eliminado")
  //     },
  //   })
  // } catch (error: any) {
  //   modalError(error.message)
  // }
};

const handleUpdate = (movementSelected: any) => {
  open.value = true;
  movement.value = movementSelected;
};

const handleOpenCuttingPlan = (movementSelected: any) => {
  openCuttingPlan.value = true;
  movement.value = movementSelected;
};

const handleOpenRolling = (movementSelected: any) => {
  openRolling.value = true;
  movement.value = movementSelected;
};

const handleSelected = (movement: any) => {
  emit("onSelected", {
    id: movement.id,
    name: movement.name,
    stock: movement.stock,
  });
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
    title: "FECHA",
    key: "date",
    dataIndex: "date",
    width: "100px",
    align: "center",
    customRender: ({ value }) => {
      return dayjs(value).format("DD/MM/YYYY");
    },
  },
  {
    title: "BOBINA",
    key: "coil",
    dataIndex: "coil",
    width: "100px",
    align: "center",
    customRender: ({ value }) => {
      return value.serie;
    },
  },
  {
    title: "PRODUCTO",
    key: "product",
    dataIndex: "product",
    customRender: ({ value }) => {
      return value.name;
    },
  },
  {
    title: "COMPROBANTE",
    key: "voucher",
    dataIndex: "voucher",
    width: "100px",
    align: "center",
    customRender: ({ value }) => {
      return value ? value.number : "-";
    },
  },
  {
    title: "DESCRIPCIÓN",
    key: "description",
    dataIndex: "description",
  },
  {
    title: "CANTIDAD",
    key: "quantity",
    dataIndex: "quantity",
    width: "100px",
    align: "center",
  },
  {
    title: "",
    key: "action",
    width: "110px",
    align: "center",
  },
];
</script>

<template>
  <div>
    <a-table
      :columns="columns"
      :data-source="movements"
      :loading="pending"
      :pagination="false"
      :scroll="{ x: 1100 }"
      bordered
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'stock'">
          <a-tag v-if="text">{{ text }}</a-tag>
          <span v-else>-</span>
        </template>

        <template v-else-if="column.key === 'action'">
          <!-- <template v-if="isModal">
            <a-button type="link" @click="handleSelected(record)">
              Seleccionar
            </a-button>
          </template> -->

          <!-- <a @click.prevent="handleOpenRolling(record)"> Rolado </a>
          <a-divider type="vertical"></a-divider>
          <a-dropdown placement="bottomRight" :arrow="{ pointAtCenter: true }">
            <a class="ant-dropdown-link" @click.prevent>
              Más
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item>
                  <a @click="handleOpenCuttingPlan(record)">Plan de corte</a>
                </a-menu-item>

                <a-menu-item>
                  <a @click="handleUpdate(record)">Editar</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleRemove(record.id)">Eliminar</a>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown> -->
        </template>
      </template>
    </a-table>
  </div>
</template>
