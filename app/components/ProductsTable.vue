<script lang="ts" setup>
import type { TableProps } from "ant-design-vue"
import { collection } from "firebase/firestore"
import { ETypeProduct } from "~/enums"
import { productConverter, type IProduct } from "~/models/product"

interface Props {
  isModal: boolean
}

interface Product {
  id: string
  name: string
  stock: number
}

defineProps<Props>()

const emit = defineEmits<{
  onSelected: [product: Product]
}>()

const open = ref(false)
const product = ref<IProduct>()

const db = useFirestore()
const productRef = collection(db, "products").withConverter(productConverter)
const { data, pending } = useCollection(productRef, {
  ssrKey: "products",
})

const products = computed(() => {
  return data.value.filter((product) => product.type === ETypeProduct.product)
})

const { remove } = useCrudProducts()

const handleRemove = (id: string) => {
  try {
    Modal.confirm({
      title: "Eliminar producto?",
      onOk: async () => {
        await remove(db, id)
        notificationSuccess("producto eliminado")
      },
    })
  } catch (error: any) {
    modalError(error.message)
  }
}

const handleUpdate = (productSelected: any) => {
  open.value = true
  product.value = productSelected
}

const handleSelected = (product: any) => {
  emit("onSelected", {
    id: product.id,
    name: product.name,
    stock: product.stock,
  })
}

const columns: TableProps["columns"] = [
  {
    title: "ITEM",
    key: "item",
    width: "80px",
    align: "center",
    customRender: ({ index }) => {
      return _PadStart(`${index + 1}`, 2, "0")
    },
  },
  {
    title: "MARCA",
    key: "brand",
    dataIndex: "brand",
    align: "center",
    width: "80px",
    defaultSortOrder: "descend",
    sorter: (a: any, b: any) => (a.brand.name as string).charCodeAt(0) - (b.brand.name as string).charCodeAt(0),
    customRender: ({ value }) => {
      return value.name
    },
  },
  {
    title: "CATEGORÍA",
    key: "category",
    dataIndex: "category",
    width: "150px",
    customRender: ({ value }) => {
      return value ? value.name : ""
    },
  },
  {
    title: "PRODUCTO",
    key: "product",
    dataIndex: "product",
    sorter: (a: any, b: any) => (a.name as string).charCodeAt(0) - (b.name as string).charCodeAt(0),
    // customRender: ({ value, record }) => {
    //   return value + ' - ' + (record.waterOutlet === EWaterOutlet.spout ? 'CAÑO' : 'NORMAL')
    // },
  },
  {
    title: "PRECIO NUEVO PLANTA",
    key: "newPlantPrice",
    dataIndex: "newPlantPrice",
    align: "right",
    width: "120px",
    customRender: ({ text }) => {
      return currency(text, "")
    },
  },
  {
    title: "PRECIO NUEVO REPARTO",
    key: "newDeliveryPrice",
    dataIndex: "newDeliveryPrice",
    align: "right",
    width: "120px",
    customRender: ({ text }) => {
      return currency(text, "")
    },
  },
  {
    title: "PRECIO RECARGA PLANTA",
    key: "rechargePlantPrice",
    dataIndex: "rechargePlantPrice",
    align: "right",
    width: "120px",
    customRender: ({ text }) => {
      return currency(text, "")
    },
  },
  {
    title: "PRECIO RECARGA REPARTO",
    key: "rechargeDeliveryPrice",
    dataIndex: "rechargeDeliveryPrice",
    align: "right",
    width: "120px",
    customRender: ({ text }) => {
      return currency(text, "")
    },
  },
  // {
  //   title: 'ENVASE',
  //   key: 'envase',
  //   dataIndex: 'envase',

  //   customRender: ({ value }) => {
  //     return value
  //       ? value.name + ' - ' + value.brand.name + ' - ' + getWaterOutlet(value.waterOutlet)
  //       : ''
  //   },
  // },
  {
    title: "STOCK",
    key: "stock",
    dataIndex: "stock",
    width: "100px",
    align: "center",
  },
  {
    title: "ID",
    key: "id",
    dataIndex: "id",
    width: "100px",
    align: "center",
  },
  {
    title: "",
    key: "action",
    width: "110px",
    align: "center",
  },
]

const columnsSelected: TableProps["columns"] = [
  {
    title: "ITEM",
    key: "item",
    width: "80px",
    align: "center",
    customRender: ({ index }) => {
      return _PadStart(`${index + 1}`, 2, "0")
    },
  },
  {
    title: "PRODUCTO",
    key: "name",
    dataIndex: "name",
  },
  {
    title: "STOCK",
    key: "stock",
    dataIndex: "stock",
    width: "100px",
    align: "center",
  },
  {
    title: "",
    key: "action",
    width: "110px",
    align: "center",
  },
]
</script>

<template>
  <div>
    <a-table
      :columns="isModal ? columnsSelected : columns"
      :data-source="products"
      :pagination="false"
      :loading="pending"
      :scroll="{ x: 1500 }"
      bordered
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'stock'">
          <a-tag v-if="text">{{ text }}</a-tag>
          <span v-else>-</span>
        </template>

        <template v-else-if="column.key === 'product'">
          <span class="font-semibold">{{ record.name + " - " + getWaterOutlet(record.waterOutlet) }}</span>

          <br />
          <span class="text-[11px]">{{ record.envase ? record.envase?.name + " - " + getWaterOutlet(record.envase.waterOutlet) : "" }}</span>
        </template>

        <!-- <template v-else-if="column.key === 'envase'">
        <span>{{ record.envase.name }}</span>
        <br />
        <span>{{ record.envase.brand.name }}</span>
      </template> -->

        <template v-else-if="column.key === 'action'">
          <template v-if="isModal">
            <a-button type="link" @click="handleSelected(record)"> Seleccionar </a-button>
          </template>

          <template v-else>
            <a-dropdown placement="bottomRight" :arrow="{ pointAtCenter: true }">
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
          </template>
        </template>
      </template>
    </a-table>

    <NewProductModal v-if="open" :open="open" :type="ETypeProduct.product" :product="product" @on-close="open = false" />
  </div>
</template>
