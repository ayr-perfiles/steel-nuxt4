<script lang="ts" setup>
import type { TableProps } from "ant-design-vue";
import _ from "lodash";
import { EStatusCoil } from "~/enums";
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
const openInfoCoil = ref(false);
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

const handleInfoCoil = (coilSelected: any) => {
  openInfoCoil.value = true;
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
    customRender: ({ value, record }) => {
      return `${value} ${record.isCutting ? " | Cortado" : ""}`;
    },
  },
  {
    title: "ANCHO (mm)",
    key: "width",
    dataIndex: "width",
    width: "100px",
  },

  {
    title: "PESO (kg)",
    key: "weight",
    dataIndex: "weight",
    width: "100px",
  },
  {
    title: "PRECIO POR (kg)",
    key: "price",
    dataIndex: "price",
    width: "120px",
    align: "right",
    customRender: ({ value }) => {
      return currency(value, "", 4);
    },
  },
  {
    title: "PRECIO TOTAL (s/)",
    key: "total",
    dataIndex: "total",
    width: "120px",
    align: "right",
    customRender: ({ value }) => {
      return currency(value, "");
    },
  },
  {
    title: "ESTADO",
    key: "status",
    dataIndex: "status",
    width: "100px",
    align: "center",
    customRender: ({ value }) => {
      return getStatusCoil(value);
    },
  },
  {
    title: "",
    key: "action",
    width: "120px",
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
      <template #bodyCell="{ column, text, record, value }">
        <template v-if="column.dataIndex === 'stock'">
          <a-tag v-if="text">{{ text }}</a-tag>
          <span v-else>-</span>
        </template>

        <template v-else-if="column.dataIndex === 'status'">
          <StatusCoilTag :status="value" />
        </template>

        <template v-else-if="column.dataIndex === 'serie'">
          <a v-if="record.isCutting" @click="handleInfoCoil(record)"
            >{{ text }} <InfoCircleOutlined
          /></a>
          <span v-else>{{ text }}</span>
        </template>

        <template v-else-if="column.key === 'action'">
          <a-button
            type="link"
            @click.prevent="handleOpenRolling(record)"
            :disabled="!record.isCutting"
          >
            Rolar
          </a-button>
          <a-divider type="vertical"></a-divider>
          <a-dropdown placement="bottomRight" :arrow="{ pointAtCenter: true }">
            <a @click.prevent>
              Más
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item :disabled="record.isCutting">
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

    <CoilInfoModal
      v-if="openInfoCoil && coil"
      :coil="coil"
      :open="openInfoCoil"
      @on-close="openInfoCoil = false"
    />
  </div>
</template>
