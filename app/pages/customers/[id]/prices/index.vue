<script lang="ts" setup>
import type { TableProps } from "ant-design-vue"
import { collection, doc } from "firebase/firestore"
import { EWaterOutlet } from "~/enums"
import { customerConverter } from "~/models/customer"
import { priceProductConverter, type IPriceProduct } from "~/models/priceProduct"

definePageMeta({
  name: "CustomerPrices",
})

const route = useRoute()
const router = useRouter()

const open = ref(false)
const prices = ref<IPriceProduct[]>([])

const db = useFirestore()
const customerRef = computed(() => doc(db, `customers/${route.params.id}`).withConverter(customerConverter))
const { data: customer } = useDocument(customerRef)

const pricesRef = computed(() => collection(db, `customers/${route.params.id}/prices`).withConverter(priceProductConverter))
const { data: pricesResult, pending: loadingPrices } = useCollection(pricesRef)

const products = computed(() => prices.value.map((item) => item.product))

const { removePriceProductCustomer } = useCrudCustomers()

const brandsRef = collection(db, "brands")
const { data: brands } = useCollection(brandsRef, {
  ssrKey: "brands",
})

const { getProductsByBrandId } = useCrudProducts()

// // action table prices
// const dataSource: Ref<IPriceProduct[]> = ref([])
// const editableData = reactive<Record<string, IPriceProduct>>({})

// const edit = (id: string) => {
//   editableData[id] = _CloneDeep(dataSource.value.filter((item) => id === item.id)[0])
// }

// const save = (id: string) => {
//   Object.assign(dataSource.value.filter((item) => id === item.id)[0], editableData[id])
//   delete editableData[id]
// }

const onDelete = async (id: string) => {
  try {
    await removePriceProductCustomer(db, route.params.id as string, id)
    notificationSuccess("Se ha eliminado precio")
  } catch (error: any) {
    modalError(error.message)
  }
}

const columns: TableProps["columns"] = [
  {
    title: "PRODUCTO",
    dataIndex: "product",
    customRender: ({ value }) => {
      const waterOutlet = value.waterOutlet === EWaterOutlet.spout ? "CAÑO" : "NORMAL"
      return value.name + " - " + value.brand.name + " - " + waterOutlet
    },
  },
  {
    title: "PRECIO",
    dataIndex: "price",
    align: "right",
    width: "100px",
    customRender: ({ value }) => {
      return currency(value, "")
    },
  },
  {
    title: "PRECIO RECARGA",
    dataIndex: "priceRecharge",
    align: "right",
    width: "150px",
    customRender: ({ value }) => {
      return currency(value, "")
    },
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
    <a-page-header class="bg-white shadow-md" :title="`${customer?.identity} - ${customer?.name}`" @back="() => router.push({ name: 'Customers' })">
    </a-page-header>

    <br />

    <a-card class="shadow-md">
      <a-table class="w-[600px]" :columns="columns" :data-source="prices" :pagination="false" :loading="loadingPrices">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-popconfirm title="Eliminar?" @confirm="onDelete(record.id)">
              <a>Eliminar</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>

    <AddPriceProductCustomerModal
      v-if="open"
      :open="open"
      :customer-id="route.params.id as string"
      :exclude-products="products"
      @on-close="open = false"
    />
  </div>
</template>
