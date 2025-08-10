<script lang="ts" setup>
import { doc } from "firebase/firestore"
import { customerConverter } from "~/models/customer"

definePageMeta({
  name: "CustomerDetail",
})

const route = useRoute()
const router = useRouter()

const db = useFirestore()
const customerRef = computed(() => doc(db, `customers/${route.params.id}`).withConverter(customerConverter))
const { data: customer } = useDocument(customerRef)
</script>

<template>
  <div>
    <a-page-header class="bg-white shadow-md" :title="`Información de cliente`" @back="() => router.back()"> </a-page-header>

    <br />

    <a-card class="shadow-md">
      <a-descriptions class="w-[600px]" :column="1" :bordered="true" :label-style="{ textAlign: 'right' }">
        <template v-if="customer">
          <a-descriptions-item label="DNI/RUC">{{ customer.identity }}</a-descriptions-item>
          <a-descriptions-item label="Nombre">{{ customer.name }}</a-descriptions-item>
          <a-descriptions-item label="Teléfono">{{ customer.phone }}</a-descriptions-item>
          <a-descriptions-item label="Zona">{{ customer.zone ? customer.zone.name : "" }}</a-descriptions-item>
          <a-descriptions-item label="Dirección">{{ customer.address }}</a-descriptions-item>
          <a-descriptions-item label="Referencia">{{ customer.reference }}</a-descriptions-item>
        </template>
      </a-descriptions>
    </a-card>
  </div>
</template>
