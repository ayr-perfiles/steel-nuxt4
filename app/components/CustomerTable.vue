<script lang="ts" setup>
import type { TableProps } from "ant-design-vue";
import type { SelectValue } from "ant-design-vue/es/select";
import _ from "lodash";
import type { ICustomer } from "~/models/customer";

interface Customer {
  id: string;
  name: string;
  stock: number;
}

const emit = defineEmits<{
  onSelected: [customer: Customer];
}>();

const dayjs = useDayjs();
const customerStore = useCustomerStore();

const open = ref(false);
const customer = ref<ICustomer>();

const { init } = useSyncQueryWithStore(customerStore, {
  filters: {},
});

onMounted(async () => {
  await init();
  await customerStore.init();
});

const handlePrev = async () => {
  await customerStore.prevPage();
};

const handleNext = async () => {
  await customerStore.nextPage();
};

const handlePageSizeChange = async (size: SelectValue) => {
  await customerStore.setPageSize(size as number);
};

// 🔹 Métodos de interacción
const handleApplyFilters = async (val: any) => {
  await customerStore.setFilters({});
};

function handleTableChange(_: any, __: any, sorter: any) {
  if (!sorter || !sorter.field) return;
  const direction = sorter.order === "ascend" ? "asc" : "desc";
  customerStore.setSort(sorter.field, direction);
}

const handleRemove = (id: string) => {
  // try {
  //   Modal.confirm({
  //     title: "Eliminar customero?",
  //     onOk: async () => {
  //       await remove(db, id)
  //       notificationSuccess("customero eliminado")
  //     },
  //   })
  // } catch (error: any) {
  //   modalError(error.message)
  // }
};

const handleUpdate = (customerSelected: any) => {
  open.value = true;
  customer.value = customerSelected;
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
    title: "IDENTIDAD",
    key: "identity",
    dataIndex: "identity",
    width: "100px",
    align: "center",
  },
  {
    title: "RAZÓN SOCIAL",
    key: "businessEntity",
    dataIndex: "businessEntity",
    sorter: true,
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
      :data-source="customerStore.items"
      :loading="customerStore.loading"
      :pagination="false"
      :scroll="{ x: 1100 }"
      bordered
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'stock'">
          <a-tag v-if="text">{{ text }}</a-tag>
          <span v-else>-</span>
        </template>

        <template v-else-if="column.key === 'action'">
          <!-- <a @click.prevent="handleOpenRolling(record)"> Rolado </a>
          <a-divider type="vertical"></a-divider> -->
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
    </a-table>

    <pagination-controls
      :pagination="customerStore.pagination"
      @update:pageSize="handlePageSizeChange"
      @prev="handlePrev"
      @next="handleNext"
    />
  </div>
</template>
