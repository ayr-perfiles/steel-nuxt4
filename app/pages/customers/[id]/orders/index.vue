<script lang="ts" setup>
import { doc } from "firebase/firestore"
import { customerConverter } from "~/models/customer"

definePageMeta({
  name: "CustomerOrders",
})

const route = useRoute()
const router = useRouter()

const db = useFirestore()
const customerRef = computed(() => doc(db, `customers/${route.params.id}`).withConverter(customerConverter))
const { data: customer } = useDocument(customerRef)
</script>

<template>
  <div>
    <a-page-header class="bg-white shadow-md" :title="`${customer?.identity} - ${customer?.name}`" @back="() => router.push({ name: 'Customers' })">
      <template #tags>
        <a-tag color="red">
          {{ typeof customer?.debt === "number" ? currency(customer?.debt, "") : "0" }}
        </a-tag>
      </template>
    </a-page-header>

    <br />

    <a-card title="Ventas" class="shadow-md">
      <VouchersTable :customer-id="route.params.id as string" :is-credit="true" :is-sale="true" />
    </a-card>
  </div>
</template>
