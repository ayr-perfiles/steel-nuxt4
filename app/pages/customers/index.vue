<script lang="ts" setup>
import type { TableProps } from "ant-design-vue"
import { collection, getAggregateFromServer, onSnapshot, query, sum, where } from "firebase/firestore"
import { EStatusVoucher, EWaterOutlet } from "~/enums"
import { customerConverter, type ICustomer } from "~/models/customer"
import NotImage from "@/assets/img/not-image.jpeg"
import { categoryCustomerConverter } from "~/models/categoryCustomer"

definePageMeta({
  name: "Customers",
})

const router = useRouter()
const dayjs = useDayjs()

const open = ref(false)
const openCashMovement = ref(false)
const openReport = ref(false)
const openDetail = ref(false)
const customerId = ref("")
const searchQuery = ref("")
const categoryId = ref<string>()
const loadingPrintExcelCustomersSale = ref(false)
const loading = ref(false)
const customers = ref<any[]>([])

const openEditCustomer = ref(false)
const customerCurrent = ref<ICustomer>()

const openDistributionByCustomer = ref(false)

const openCall = ref(false)

const db = useFirestore()

const { remove } = useCrudCustomers()

const customersRef = collection(db, "customers").withConverter(customerConverter)
const unsubscribe = onSnapshot(customersRef, async (querySnapshot) => {
  loading.value = true

  customers.value = await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      const vouchersRef = collection(db, "vouchers")
      const q = query(vouchersRef, where("customer.id", "==", doc.id), where("status", "==", EStatusVoucher.sold))
      const querySnapshot = await getAggregateFromServer(q, {
        totalSale: sum("total"),
        totalDebtPaid: sum("debtPaid"),
      })

      const resultRound = Math.round(((querySnapshot.data().totalSale ?? 0) - (querySnapshot.data().totalDebtPaid ?? 0)) * 100) / 100

      return {
        ...doc.data(),
        sumTotalDeb: resultRound,
      }
    }),
  )

  loading.value = false
})

onUnmounted(() => {
  unsubscribe && unsubscribe()
})

const repositoriesSearchCustomer = computed(() => {
  return customers.value.filter((item) => item.name.toUpperCase().includes(searchQuery.value.toUpperCase()))
})

const repositoriesFilterByCategoryId = computed(() => {
  if (!categoryId.value) return repositoriesSearchCustomer.value
  return repositoriesSearchCustomer.value.filter((item) => item.category.id === categoryId.value)
})

const categoryCustomersRef = collection(db, "categoryCustomers").withConverter(categoryCustomerConverter)
const { data: categoryCustomers } = useCollection(categoryCustomersRef, {
  ssrKey: "categoryCustomers",
})

const { handlePrintCustomersSale, handlePrintCustomers } = useVoucherExcel()

const handleRemove = (customerId: string) => {
  Modal.confirm({
    title: "Borrar cliente?",
    onOk: async () => {
      try {
        await remove(db, customerId)
        notificationSuccess("Se removió cliente")
      } catch (error: any) {
        modalError(error.message)
      }
    },
  })
}

const handleEditCustomer = (customer: any) => {
  openEditCustomer.value = true
  customerCurrent.value = customer
}

const handleAddDebtEnvase = (id: string) => {
  open.value = true
  customerId.value = id
}

const handlePrices = (id: string) => {
  router.push({ name: "CustomerPrices", params: { id } })
}

const handleOrders = (id: string) => {
  router.push({ name: "CustomerOrders", params: { id } })
}

const handleDebts = (id: string) => {
  router.push({ name: "CustomerDebts", params: { id } })
}

const handleCalls = (id: string) => {
  router.push({ name: "CustomerCalls", params: { id } })
}

const handleAddCall = (id: string) => {
  openCall.value = true
  customerId.value = id
}

const handleShowDistributionByCustomer = (id: string) => {
  openDistributionByCustomer.value = true
  customerId.value = id
}

const handleChangeCategory = (categoryId: any) => {
  if (!categoryId) return

  const findCategoryCustomer = categoryCustomers.value.filter((item) => item.id === categoryId)[0]

  // formState.category = {
  //   id: categoryId,
  //   name: findEnvase.name,
  // }
}

const handleOpenDetail = (id: string) => {
  openDetail.value = true
  customerId.value = id
}

const handlePrintExcelCustomersSale = async () => {
  try {
    loadingPrintExcelCustomersSale.value = true

    await handlePrintCustomersSale()
    // await handlePrintTemp()
  } catch (error: any) {
    modalError(error.message)
  } finally {
    loadingPrintExcelCustomersSale.value = false
  }
}

const filterOption = (input: string, option: any) => {
  return option.value.toLowerCase().includes(input.toLowerCase())
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
    title: "DNI/RUC",
    dataIndex: "identity",
    align: "right",
    width: "110px",
  },
  {
    title: "CLIENTE",
    dataIndex: "name",
    sorter: (a: any, b: any) => (a.name as string).charCodeAt(0) - (b.name as string).charCodeAt(0),
  },
  {
    title: "CATEGORÍA",
    dataIndex: "category",
    width: "150px",
    customRender: ({ value }) => {
      return value.name ?? "-"
    },
  },
  // {
  //   title: "ENVASES",
  //   dataIndex: "envases",
  // },
  // {
  //   title: "ID",
  //   dataIndex: "id",
  // },
  {
    title: "ÚLTIMA VENTA",
    key: "lastSale",
    dataIndex: "lastSale",
    width: "120px",
    align: "center",
    sorter: (a: any, b: any) => {
      return dayjs(a.lastSale.toDate()).unix() - dayjs(b.lastSale.toDate()).unix()
    },
  },
  {
    title: "ÚLTIMA LLAMADA",
    key: "lastCall",
    dataIndex: "lastCall",
    width: "120px",
    align: "center",
    sorter: (a: any, b: any) => {
      if (a.lastCall && b.lastCall) {
        return dayjs(a.lastCall.toDate()).unix() - dayjs(b.lastCall.toDate()).unix()
      }
      return 0
    },
  },
  {
    title: "DEUDA INIT",
    key: "debt",
    dataIndex: "debt",
    width: "80px",
    align: "right",
    sorter: (a: any, b: any) => {
      return (a.sumTotalDeb ?? 0) - (b.sumTotalDeb ?? 0)
    },
  },
  {
    title: "DEUDA",
    dataIndex: "sumTotalDeb",
    width: "80px",
    align: "right",
    defaultSortOrder: "descend",
    sorter: (a: any, b: any) => {
      return (a.sumTotalDeb ?? 0) - (b.sumTotalDeb ?? 0)
    },
    // customRender: ({ value }) => {
    //   return value > 0 ? currency(value, '') : '-'
    // },
  },
  {
    title: "TOTAL VENTA",
    dataIndex: "totalSale",
    width: "100px",
    align: "right",
    sorter: (a: any, b: any) => {
      return (a.totalSale ?? 0) - (b.totalSale ?? 0)
    },
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
  <div class="flex flex-col gap-4">
    <a-page-header class="bg-white shadow-md sticky top-0 z-10" style="border: 1px solid rgb(235, 237, 240)">
      <template #title>
        <span class="text-lg font-bold"><ContactsOutlined /> Clientes</span>
      </template>
      <template #subTitle>
        <a-space>
          <AddCustomerButton />
          <a-button type="primary" ghost danger @click="openReport = true">Reportes</a-button>
        </a-space>
      </template>

      <template #extra>
        <AddCategoryCustomerButton />
      </template>
    </a-page-header>

    <a-card class="shadow-md">
      <div class="pb-2">
        <a-space>
          <strong>Filtros: </strong>

          <a-select
            v-model:value="categoryId"
            class="w-[200px]"
            placeholder="Seleccionar categoría"
            :field-names="{ label: 'name', value: 'id' }"
            :options="categoryCustomers"
            :filter-option="filterOption"
            allow-clear
            @change="handleChangeCategory"
          ></a-select>

          <a-input-search v-model:value="searchQuery" placeholder="Buscar cliente" style="width: 200px" />

          <a-button type="primary" @click="handlePrintCustomers(repositoriesFilterByCategoryId)"> Excel </a-button>
          <a-button type="primary" :loading="loadingPrintExcelCustomersSale" @click="handlePrintExcelCustomersSale"> Excel ventas </a-button>
        </a-space>
      </div>
    </a-card>

    <a-card class="shadow-md">
      <a-table :columns="columns" :data-source="repositoriesFilterByCategoryId" :scroll="{ x: 1500 }" bordered :loading="loading">
        <template #bodyCell="{ column, record, value }">
          <!-- <template v-if="column.dataIndex === 'name'">
            <strong>{{ record.name }}</strong>
            <br />
            <span class="text-xs">{{ `Telf: ${record.phone}` }}</span>
            <br />
            <span class="text-xs">{{ `Dirección: ${record.address ?? "-"}` }}</span>
            <br />
            <span class="text-xs">{{ `image: ${record.image}` }}</span>
            <br />
            <a v-if="record.reference && (record.reference as string).includes('https')" :href="record.reference" target="_blank">
              {{ record.reference }}
            </a>
            <span v-else>{{ record.reference }}</span>
            <br />

            <a v-if="record.coordenada && (record.coordenada as string).includes('https')" :href="record.coordenada" target="_blank">
              {{ record.coordenada }}
            </a>
            <span v-else>{{ record.coordenada }}</span>
          </template> -->

          <template v-if="column.dataIndex === 'name'">
            <div class="flex">
              <div class="flex flex-col justify-center">
                <a-image :preview="!!record.image" :width="40" :height="40" :src="record.image ? record.image : NotImage" />
                <!-- <NuxtImg /> -->
              </div>
              <div class="ml-2">
                <a-button class="pl-0" type="link" @click="handleOpenDetail(record.id)">{{ record.name }}</a-button>
                <PushpinOutlined v-if="!record.coordenada" class="text-red-500" />
                <!-- <br />
                <span v-if="record.phone">{{ record.phone }}</span>
                <template v-if="record.coordenada">
                  <br />
                  <span>
                    <a v-if="record.coordenada && (record.coordenada as string).includes('https')" :href="record.coordenada" target="_blank">
                      {{ record.coordenada }}
                    </a>
                  </span>
                </template> -->
              </div>
            </div>
          </template>

          <template v-else-if="column.dataIndex === 'identity'">
            <!-- <NuxtLink :to="{ name: 'CustomerDetail', params: { id: record.id } }">
              {{ _PadStart(value, 11, "0") }}
            </NuxtLink> -->
            {{ _PadStart(value, 11, "0") }}
          </template>

          <!-- <template v-else-if="column.dataIndex === 'lastSale'">
            <template v-if="value">
              <NuxtLink :to="{ name: 'CustomerOrders', params: { id: record.id } }">
                {{ dayjs(value.toDate()).format("DD/MM/YYYY") }}
              </NuxtLink>
              <br />
              {{ dayjs(value.toDate()).fromNow() }}
            </template>
          </template>

          <template v-else-if="column.dataIndex === 'lastCall'">
            <template v-if="value">
              <a @click="handleCalls(record.id)">
                {{ dayjs(value.toDate()).format("DD/MM/YYYY") }}
              </a>
              <br />
              {{ dayjs(value.toDate()).fromNow() }}
            </template>
          </template> -->

          <template v-else-if="column.dataIndex === 'sumTotalDeb'">
            <NuxtLink :to="{ name: 'CustomerOrders', params: { id: record.id } }">
              {{ currency(value, "") }}
            </NuxtLink>
          </template>

          <template v-else-if="column.dataIndex === 'envases'">
            <ul>
              <li v-for="item in record.envases" :key="item.id">
                <span>{{ Math.abs(item.quantity) }}</span>
                &nbsp;
                <span>{{ item.product.name }}</span>
                -
                <span>{{ item.product.brand.name }}</span>
                -
                <span>{{ item.product.waterOutlet === EWaterOutlet.spout ? "CAÑO" : "NORMAL" }}</span>
              </li>
            </ul>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-dropdown placement="bottomRight" :arrow="{ pointAtCenter: true }">
              <a class="ant-dropdown-link" @click.prevent>
                Más
                <DownOutlined />
              </a>

              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <a @click="handleAddCall(record.id)"> Agregar llamada </a>
                  </a-menu-item>
                  <a-menu-item>
                    <a @click="handleAddDebtEnvase(record.id)">Agregar deuda de envases</a>
                  </a-menu-item>
                  <!-- <a-menu-item>
                    <a @click="handleAddCashMovement(record.id, EMovement.increment)">
                      Agregar deuda monetaria
                    </a>
                  </a-menu-item>
                  <a-menu-item>
                    <a @click="handleAddCashMovement(record.id, EMovement.decrement)">
                      Pagar deuda
                    </a>
                  </a-menu-item> -->
                  <a-menu-item>
                    <a @click="handlePrices(record.id)"> Gestionar precios </a>
                  </a-menu-item>
                  <a-menu-item>
                    <a @click="handleOrders(record.id)">Ver pedidos</a>
                  </a-menu-item>
                  <a-menu-item>
                    <a @click="handleEditCustomer(record)">Editar</a>
                  </a-menu-item>
                  <a-menu-item>
                    <a @click="handleShowDistributionByCustomer(record.id)">Distribución PDF</a>
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
    </a-card>

    <!-- <pre>{{ JSON.stringify(customers, null, 2) }}</pre> -->

    <NewDebtEnvases v-if="open" :open="open" :customer-id="customerId" @on-close="open = false" />
    <NewCall v-if="openCall" :open="openCall" :customer-id="customerId" @on-close="openCall = false" />
    <NewDebtMoneyModal v-if="openCashMovement" :open="openCashMovement" :customer-id="customerId" @on-close="openCashMovement = false" />
    <NewCustomerModal v-if="openEditCustomer" :open="openEditCustomer" :customer="customerCurrent" @on-close="openEditCustomer = false" />
    <CustomerDetailDrawer v-if="openDetail" :open="openDetail" :customer-id="customerId" @on-close="openDetail = false" />
    <DistributionByCustomerModal
      v-if="openDistributionByCustomer"
      :open="openDistributionByCustomer"
      :customer-id="customerId"
      @on-close="openDistributionByCustomer = false"
    />
    <ReportCustomersModal v-if="openReport" :open="openReport" @on-close="openReport = false" />
  </div>
</template>
