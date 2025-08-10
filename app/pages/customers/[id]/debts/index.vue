<script lang="ts" setup>
import type { TableProps } from "ant-design-vue"
import { collection, doc } from "firebase/firestore"
import { customerConverter } from "~/models/customer"

definePageMeta({
  name: "CustomerDebts",
})

const route = useRoute()
const router = useRouter()
const dayjs = useDayjs()

const db = useFirestore()
const customerRef = computed(() => doc(db, `customers/${route.params.id}`).withConverter(customerConverter))
const { data: customer } = useDocument(customerRef)

const debtsRef = computed(() => collection(db, `customers/${route.params.id}/debts`))
const { data: debts, pending: loadingDebts } = useCollection(debtsRef)

const columns: TableProps["columns"] = [
  {
    title: "FECHA",
    key: "createdAt",
    dataIndex: "createdAt",
    width: "110px",
    align: "center",
    defaultSortOrder: "descend",
    sorter: (a: any, b: any) => dayjs(a.createdAt.toDate()).unix() - dayjs(b.createdAt.toDate()).unix(),
    customRender: ({ record }) => {
      return dayjs(record.createdAt.toDate()).format("DD/MM/YYYY HH:mm")
    },
  },
  {
    title: "MONTO",
    dataIndex: "rode",
    width: "110px",
    align: "right",
    customRender: ({ value }) => currency(value, ""),
  },
  {
    title: "DESCRIPCIÓN",
    dataIndex: "description",
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
    <a-page-header class="bg-white shadow-md" :title="`${customer?.identity} - ${customer?.name}`" @back="() => router.push({ name: 'Customers' })" />

    <br />

    <a-card class="shadow-md" title="Deudas">
      <a-table class="w-[700px]" :columns="columns" :data-source="debts" :pagination="false" :loading="loadingDebts" />
    </a-card>
  </div>
</template>
