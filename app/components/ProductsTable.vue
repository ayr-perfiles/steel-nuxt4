<script lang="ts" setup>
import type { TableProps } from "ant-design-vue";
import _ from "lodash";
import type { IProduct } from "~/models/product";

interface Product {
  id: string;
  name: string;
  stock: number;
}

const emit = defineEmits<{
  onSelected: [product: Product];
}>();

const open = ref(false);
const product = ref<IProduct>();

const { data: products, pending, remove } = useCrudProducts();

const handleRemove = (id: string) => {
  // try {
  //   Modal.confirm({
  //     title: "Eliminar producto?",
  //     onOk: async () => {
  //       await remove(db, id)
  //       notificationSuccess("producto eliminado")
  //     },
  //   })
  // } catch (error: any) {
  //   modalError(error.message)
  // }
};

const handleUpdate = (productSelected: any) => {
  open.value = true;
  product.value = productSelected;
};

const handleSelected = (product: any) => {
  emit("onSelected", {
    id: product.id,
    name: product.name,
    stock: product.stock,
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
    title: "PRODUCTO",
    key: "name",
    dataIndex: "name",
    defaultSortOrder: "descend",
    sorter: (a: any, b: any) =>
      (a.name as string).charCodeAt(0) - (b.name as string).charCodeAt(0),
    // customRender: ({ value, record }) => {
    //   return value + ' - ' + (record.waterOutlet === EWaterOutlet.spout ? 'CAÑO' : 'NORMAL')
    // },
  },
  {
    title: "ANCHO (mm)",
    key: "width",
    dataIndex: "width",
    width: "100px",
    align: "center",
  },

  {
    title: "STOCK",
    key: "stock",
    dataIndex: "stock",
    width: "100px",
    align: "center",
  },
  {
    title: "COSTO",
    key: "price",
    dataIndex: "price",
    width: "100px",
    align: "right",
    customRender: ({ value }) => {
      return currency(value, "", 4);
    },
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
      :data-source="products"
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
          </template>

          <template v-else>
            <a-dropdown
              placement="bottomRight"
              :arrow="{ pointAtCenter: true }"
            >
              <a class="ant-dropdown-link" @click.prevent>
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
          </template> -->
        </template>
      </template>
    </a-table>
  </div>
</template>
