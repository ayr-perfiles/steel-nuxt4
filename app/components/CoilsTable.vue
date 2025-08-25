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
const openInfoCoil = ref(false);
const coil = ref<ICoil>();

const { data: coils, pending, remove } = useCrudCoils();

const handleRemove = (id: string) => {
  Modal.confirm({
    title: "Eliminar Bobina?",
    onOk: async () => {
      try {
        await remove(id);
        notificationSuccess("Bobina eliminado");
      } catch (error: any) {
        modalError(error.message);
      }
    },
  });
};

const handleUpdate = (coilSelected: any) => {
  open.value = true;
  coil.value = coilSelected;
};

const handleOpenCuttingPlan = (coilSelected: any) => {
  openCuttingPlan.value = true;
  coil.value = coilSelected;
};

const handleInfoCoil = (coilSelected: any) => {
  openInfoCoil.value = true;
  coil.value = coilSelected;
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
    width: "120px",
    align: "center",
    defaultSortOrder: "descend",
    sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    customRender: ({ value }) => {
      return dayjs(value).format("DD/MM/YYYY HH:mm");
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
    title: "ANCHO",
    key: "width",
    dataIndex: "width",
    width: "100px",
    align: "right",
    customRender: ({ value }) => {
      return value > 0 ? `${value} [mm]` : "-";
    },
  },

  {
    title: "PESO",
    key: "weight",
    dataIndex: "weight",
    width: "90px",
    align: "right",
    customRender: ({ value }) => {
      return value ? `${value} [kg]` : "-";
    },
  },
  {
    title: "PRECIO POR X KG",
    key: "pricePerKilogram",
    dataIndex: "pricePerKilogram",
    width: "120px",
    align: "right",
    customRender: ({ value }) => {
      return value ? `${currency(value, "")} [PEN]` : "-";
    },
  },
  {
    title: "PRECIO TOTAL",
    key: "total",
    dataIndex: "total",
    width: "120px",
    align: "right",
    customRender: ({ value }) => {
      return value ? `${currency(value, "")} [PEN]` : "-";
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

                <a-menu-item :disabled="record.isCutting">
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

    <NewCoilModal
      v-if="open && coil"
      :coil="coil"
      :open="open"
      @on-close="open = false"
    />

    <NewCuttingModal
      v-if="openCuttingPlan && coil"
      :coil="coil"
      :open="openCuttingPlan"
      @on-close="openCuttingPlan = false"
    />

    <CoilInfoModal
      v-if="openInfoCoil && coil"
      :coil="coil"
      :open="openInfoCoil"
      @on-close="openInfoCoil = false"
    />
  </div>
</template>
