<script lang="ts" setup>
import type { TableProps } from "ant-design-vue";
import _ from "lodash";
import type { ICoil } from "~/models/coil";

interface Coil {
  id: string;
  name: string;
  stock: number;
}

const emit = defineEmits<{
  onSelected: [coil: Coil];
}>();

const dayjs = useDayjs();

const open = ref(false);
const openCuttingPlan = ref(false);
const openRolling = ref(false);
const coil = ref<ICoil>();

const { data: coils, pending, remove } = useCrudCoils();

const handleRemove = (id: string) => {
  // try {
  //   Modal.confirm({
  //     title: "Eliminar coilo?",
  //     onOk: async () => {
  //       await remove(db, id)
  //       notificationSuccess("coilo eliminado")
  //     },
  //   })
  // } catch (error: any) {
  //   modalError(error.message)
  // }
};

const handleUpdate = (coilSelected: any) => {
  open.value = true;
  coil.value = coilSelected;
};

const handleOpenCuttingPlan = (coilSelected: any) => {
  openCuttingPlan.value = true;
  coil.value = coilSelected;
};

const handleOpenRolling = (coilSelected: any) => {
  openRolling.value = true;
  coil.value = coilSelected;
};

const handleSelected = (coil: any) => {
  emit("onSelected", {
    id: coil.id,
    name: coil.name,
    stock: coil.stock,
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
    key: "createdAt",
    dataIndex: "createdAt",
    width: "100px",
    align: "center",
    customRender: ({ value }) => {
      return dayjs(value).format("DD/MM/YYYY");
    },
  },
  {
    title: "SERIE",
    key: "serie",
    dataIndex: "serie",
    sorter: (a: any, b: any) =>
      (a.name as string).charCodeAt(0) - (b.name as string).charCodeAt(0),
    // customRender: ({ value, record }) => {
    //   return value + ' - ' + (record.waterOutlet === EWaterOutlet.spout ? 'CAÑO' : 'NORMAL')
    // },
  },
  {
    title: "ANCHO",
    key: "width",
    dataIndex: "width",
    width: "100px",
    align: "center",
  },

  {
    title: "PESO KG",
    key: "weight",
    dataIndex: "weight",
    width: "100px",
    align: "center",
  },
  {
    title: "PRECIO POR KG",
    key: "price",
    dataIndex: "price",
    width: "100px",
    align: "center",
  },
  {
    title: "TOTAL",
    key: "total",
    dataIndex: "total",
    width: "100px",
    align: "center",
  },
  {
    title: "ESTADO",
    key: "status",
    dataIndex: "status",
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
      :data-source="coils"
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

          <a @click.prevent="handleOpenRolling(record)"> Rolado </a>
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
          </a-dropdown>
        </template>
      </template>
    </a-table>

    <NewCuttingModal
      v-if="openCuttingPlan && coil"
      :coil="coil"
      :open="openCuttingPlan"
      @on-close="openCuttingPlan = false"
    />

    <NewMovementModal
      v-if="openRolling && coil"
      :coil="coil"
      :open="openRolling"
      @on-close="openRolling = false"
    />
  </div>
</template>
