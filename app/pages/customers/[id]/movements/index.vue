<script lang="ts" setup>
import type { TableProps } from "ant-design-vue"
import { collection, doc } from "firebase/firestore"
import { customerConverter } from "~/models/customer"

definePageMeta({
  name: "CustomerMovements",
})

const dayjs = useDayjs()
const route = useRoute()
const router = useRouter()

const db = useFirestore()
const customerRef = computed(() => doc(db, `customers/${route.params.id}`).withConverter(customerConverter))
const { data: customer } = useDocument(customerRef)

const cashMovementsRef = computed(() => collection(db, `customers/${route.params.id}/cashMovements`))

const { data: cashMovements, pending: loadingCashMovements } = useCollection(cashMovementsRef)

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
    title: "FECHA",
    key: "timestamp",
    dataIndex: "timestamp",
    width: "120px",
    align: "center",
    defaultSortOrder: "descend",
    sorter: (a: any, b: any) => dayjs(a.timestamp.toDate()).unix() - dayjs(b.timestamp.toDate()).unix(),
    customRender: ({ record }) => {
      return dayjs(record.timestamp.toDate()).format("DD/MM/YYYY HH:mm")
    },
  },
  {
    title: "MONTO",
    key: "rode",
    dataIndex: "rode",
    width: "120px",
    align: "right",
    defaultSortOrder: "descend",
    customRender: ({ value }) => currency(value, ""),
  },
  {
    title: "DESCRIPCIÓN",
    key: "description",
    dataIndex: "description",
  },
]
</script>

<template>
  <div>
    <a-page-header class="bg-white shadow-md" :title="`${customer?.identity} - ${customer?.name}`" @back="() => router.push({ name: 'Customers' })">
    </a-page-header>

    <br />

    <a-card class="shadow-md" title="Movimientos">
      <a-table class="w-[800px]" :columns="columns" :data-source="cashMovements" :pagination="false" :loading="loadingCashMovements"> </a-table>
    </a-card>
  </div>
</template>
