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

const open = ref(false);
const openRolling = ref(false);
const openInfoStrip = ref(false);
const strip = ref<IStrip>();

const { data: strips, pending, remove } = useCrudStrips();

const handleRemove = (id: string) => {
  // try {
  //   Modal.confirm({
  //     title: "Eliminar stripo?",
  //     onOk: async () => {
  //       await remove(db, id)
  //       notificationSuccess("stripo eliminado")
  //     },
  //   })
  // } catch (error: any) {
  //   modalError(error.message)
  // }
};

const handleUpdate = (stripSelected: any) => {
  open.value = true;
  strip.value = stripSelected;
};

const handleOpenRolling = (stripSelected: any) => {
  openRolling.value = true;
  strip.value = stripSelected;
};

const handleInfoStrip = (stripSelected: any) => {
  openInfoStrip.value = true;
  strip.value = stripSelected;
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
    title: "CANTIDAD FLEJES",
    key: "quantity",
    dataIndex: "quantity",
    width: "100px",
    align: "center",
  },
  {
    title: "CANTIDAD FLEJES DISPONIBLES",
    key: "quantityAvailable",
    dataIndex: "quantityAvailable",
    width: "100px",
    align: "center",
  },

  {
    title: "PESO FLEJES [kg]",
    key: "weightStrips",
    dataIndex: "weightStrips",
    width: "100px",
  },
  {
    title: "PRECIO REAL POR [kg]",
    key: "priceRealPerKilogram",
    dataIndex: "priceRealPerKilogram",
    width: "120px",
    align: "right",
    // customRender: ({ value }) => {
    //   return currency(value, "", 4);
    // },
  },
  {
    title: "PRECIO POR FLEJE [S/]",
    key: "pricePerStrip",
    dataIndex: "pricePerStrip",
    width: "120px",
    align: "right",
    // customRender: ({ value }) => {
    //   return currency(value, "", 4);
    // },
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
    width: "120px",
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

        <!-- <template v-else-if="column.dataIndex === 'serie'">
          <a v-if="record.isCutting" @click="handleInfoStrip(record)"
            >{{ text }} <InfoCircleOutlined
          /></a>
          <span v-else>{{ text }}</span>
        </template> -->

        <template v-else-if="column.key === 'action'">
          <a-button
            type="link"
            @click.prevent="handleOpenRolling(record)"
            :disabled="record.quantityAvailable < 1"
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

    <NewRollingModal
      v-if="openRolling && strip"
      :strip="strip"
      :open="openRolling"
      @on-close="openRolling = false"
    />
  </div>
</template>
