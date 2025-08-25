<script lang="ts" setup>
import type { TableProps } from "ant-design-vue";
import _ from "lodash";
import type { IStrip } from "~/models/strip";

interface Strip {
  id: string;
  name: string;
  stock: number;
}

const emit = defineEmits<{
  onSelected: [strip: Strip];
}>();

const dayjs = useDayjs();

const openRolling = ref(false);
const openRollings = ref(false);
const strip = ref<IStrip>();

const { data: strips, pending } = useCrudStrips();

const handleOpenRolling = (stripSelected: any) => {
  openRolling.value = true;
  strip.value = stripSelected;
};

const handleOpenMovements = (stripSelected: any) => {
  openRollings.value = true;
  strip.value = stripSelected;
};

const columns: TableProps["columns"] = [
  {
    title: "ITEM",
    key: "item",
    width: "70px",
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
    title: "BOBINA",
    key: "coil",
    dataIndex: "coil",
    width: "150px",
    customRender: ({ value }) => {
      return `${value.serie} | ${value.weight} [kg]`;
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
    title: "FLEJES",
    key: "quantity",
    dataIndex: "quantity",
    width: "80px",
    align: "center",
  },
  {
    title: "FLEJES DISPONIBLES",
    key: "quantityAvailable",
    dataIndex: "quantityAvailable",
    width: "100px",
    align: "center",
  },

  {
    title: "PESO FLEJES",
    key: "weightStrips",
    dataIndex: "weightStrips",
    width: "110px",
    align: "right",
    customRender: ({ value }) => {
      return `${value} [kg]`;
    },
  },
  {
    title: "PRECIO REAL X KG",
    key: "priceRealPerKilogram",
    dataIndex: "priceRealPerKilogram",
    width: "130px",
    align: "right",
    customRender: ({ value }) => {
      return `${value} [PEN]`;
    },
  },
  {
    title: "PRECIO X FLEJE",
    key: "pricePerStrip",
    dataIndex: "pricePerStrip",
    width: "130px",
    align: "right",
    customRender: ({ value }) => {
      return `${value} [PEN]`;
    },
  },
  // {
  //   title: "COSTO POR UNIDAD [S/]",
  //   key: "costPerUnit",
  //   dataIndex: "costPerUnit",
  //   width: "120px",
  //   align: "right",
  //   // customRender: ({ value }) => {
  //   //   return currency(value, "");
  //   // },
  // },
  // {
  //   title: "CANT PRODUCTOS ROLADOS",
  //   key: "qProductProduced",
  //   dataIndex: "qProductProduced",
  //   width: "120px",
  //   align: "center",
  //   // customRender: ({ value }) => {
  //   //   return currency(value, "");
  //   // },
  // },
  // {
  //   title: "ROLADO?",
  //   key: "isRolling",
  //   dataIndex: "isRolling",
  //   width: "100px",
  //   align: "center",
  //   customRender: ({ value }) => {
  //     return value ? "Sí" : "No";
  //   },
  // },
  {
    title: "",
    key: "action",
    width: "80px",
    align: "center",
  },
];
</script>

<template>
  <div>
    <a-table
      :columns="columns"
      :data-source="strips"
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

        <template v-else-if="column.dataIndex === 'quantityAvailable'">
          <a
            v-if="record.quantityAvailable < record.quantity"
            @click.prevent="handleOpenMovements(record)"
          >
            {{ text }}
          </a>
          <span v-else>{{ text }}</span>
        </template>

        <template v-else-if="column.key === 'action'">
          <a-button
            type="link"
            @click.prevent="handleOpenRolling(record)"
            :disabled="record.quantityAvailable < 1"
          >
            Rolar
          </a-button>
          <!-- <a-divider type="vertical"></a-divider>
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
          </a-dropdown> -->
        </template>
      </template>
    </a-table>

    <RollingsModal
      v-if="openRollings && strip"
      :strip="strip"
      :open="openRollings"
      @on-close="openRollings = false"
    />

    <NewRollingModal
      v-if="openRolling && strip"
      :strip="strip"
      :open="openRolling"
      @on-close="openRolling = false"
    />
  </div>
</template>
