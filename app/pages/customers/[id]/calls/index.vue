<script lang="ts" setup>
import type { TableProps } from "ant-design-vue"
import { collection, doc } from "firebase/firestore"
import { customerConverter } from "~/models/customer"

definePageMeta({
  name: "CustomerCalls",
})

const route = useRoute()
const router = useRouter()
const dayjs = useDayjs()

const db = useFirestore()
const customerRef = computed(() => doc(db, `customers/${route.params.id}`).withConverter(customerConverter))
const { data: customer } = useDocument(customerRef)

const callsRef = computed(() => collection(db, `customers/${route.params.id}/calls`))
const { data: calls, pending: loadingCalls } = useCollection(callsRef)

const columns: TableProps["columns"] = [
  {
    title: "FECHA",
    key: "timestamp",
    dataIndex: "timestamp",
    width: "110px",
    align: "center",
    defaultSortOrder: "descend",
    sorter: (a: any, b: any) => dayjs(a.timestamp.toDate()).unix() - dayjs(b.timestamp.toDate()).unix(),
    customRender: ({ record }) => {
      return dayjs(record.timestamp.toDate()).format("DD/MM/YYYY HH:mm")
    },
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

    <a-card class="shadow-md" title="Historial de llamadas">
      <a-table class="w-[700px]" :columns="columns" :data-source="calls" :pagination="false" :loading="loadingCalls" />
    </a-card>
  </div>
</template>
