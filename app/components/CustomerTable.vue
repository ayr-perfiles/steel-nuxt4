<script lang="ts" setup>
import type { TableProps } from "ant-design-vue";
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

const open = ref(false);
const openCuttingPlan = ref(false);
const openRolling = ref(false);
const customer = ref<ICustomer>();

const { data: customers, pending, remove } = useCrudCustomers();

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

const handleOpenCuttingPlan = (customerSelected: any) => {
  openCuttingPlan.value = true;
  customer.value = customerSelected;
};

const handleOpenRolling = (customerSelected: any) => {
  openRolling.value = true;
  customer.value = customerSelected;
};

const handleSelected = (customer: any) => {
  emit("onSelected", {
    id: customer.id,
    name: customer.name,
    stock: customer.stock,
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
      :data-source="customers"
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
  </div>
</template>
