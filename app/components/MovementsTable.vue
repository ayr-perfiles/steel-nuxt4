<script lang="ts" setup>
import type { TableProps } from "ant-design-vue";
import _ from "lodash";
import type { ICoil } from "~/models/coil";
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
const openCoilInfoCurrent = ref(false);
const movement = ref<IMovement>();
const coilIdCurrent = ref();

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

const handleOpenCoilInfoDrawer = (coilId: string) => {
  openCoilInfoCurrent.value = true;
  coilIdCurrent.value = coilId;
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
    title: "FECHA DE ROLADO",
    key: "date",
    dataIndex: "date",
    width: "130px",
    align: "center",
    customRender: ({ value }) => {
      return dayjs(value).format("DD/MM/YYYY HH:mm");
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
      <template #bodyCell="{ column, text, record, value }">
        <template v-if="column.dataIndex === 'stock'">
          <a-tag v-if="text">{{ text }}</a-tag>
          <span v-else>-</span>
        </template>

        <template v-else-if="column.dataIndex === 'coil'">
          <a @click="handleOpenCoilInfoDrawer(record.coil.id)">
            {{ value.serie }}
          </a>
        </template>

        <template v-else-if="column.dataIndex === 'quantity'">
          <span :class="value > 0 ? '' : 'text-red-500'">
            <ArrowUpOutlined v-if="value > 0" /> <ArrowDownOutlined v-else />
            {{ text }}
          </span>
        </template>

        <template v-else-if="column.key === 'action'">
          <a-dropdown placement="bottomRight" :arrow="{ pointAtCenter: true }">
            <a @click.prevent>
              Más
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item>
                  <a @click="handleUpdate(record)">Editar</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleRemove(record.id)">Eliminar</a>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </template>
    </a-table>

    <CoilInfoDrawer
      v-if="openCoilInfoCurrent && coilIdCurrent"
      :open="openCoilInfoCurrent"
      :coil-id="coilIdCurrent"
      @onClose="openCoilInfoCurrent = false"
    />
  </div>
</template>
