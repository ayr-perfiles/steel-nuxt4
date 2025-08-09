<script lang="ts" setup>
import type { TableProps } from "ant-design-vue"
import { collection } from "firebase/firestore"
import { ERole } from "~/enums"

definePageMeta({
  name: "Users",
})

const db = useFirestore()
const usersRef = collection(db, "users")
const { data: users, pending } = useCollection(usersRef, {
  ssrKey: "users",
})

// const vouchersRef = collection(db, 'vouchers')
// const q = query(
//   vouchersRef,
//   where('customer.id', '==', 'rMCABUzXa4IPn9qhTG0W'),
//   where('isPaid', '==', false),
//   orderBy('updateAt', 'asc'),
// )

// const { data: vouchers } = useCollection(q)

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
    title: "ROL",
    dataIndex: "role",
    width: "110px",
    defaultSortOrder: "ascend",
    sorter: (a: any, b: any) => (a.role as string).charCodeAt(0) - (b.role as string).charCodeAt(0),
    customRender: ({ value }) => {
      return getRole(value)
    },
  },
  {
    title: "EMAIL",
    dataIndex: "email",
    width: "300px",
  },
  {
    title: "NOMBRE",
    dataIndex: "name",
    sorter: (a: any, b: any) => (a.name as string).charCodeAt(0) - (b.name as string).charCodeAt(0),
  },
  {
    title: "ACTIVO",
    dataIndex: "active",
    width: "110px",
    align: "center",
    customRender: ({ value }) => {
      return value ? "Sí" : "No"
    },
  },

  {
    title: "ESTADO",
    dataIndex: "isBusy",
    width: "110px",
  },
  {
    title: "",
    // key: 'action',
    width: "120px",
    align: "center",
  },
]
</script>

<template>
  <div class="flex flex-col gap-4">
    <a-page-header class="bg-white shadow-md" style="border: 1px solid rgb(235, 237, 240)">
      <template #title>
        <span class="text-lg font-bold"><TeamOutlined /> Usuarios</span>
      </template>
      <template #subTitle>
        <AddUserButton class="inline-block" :is-add="true" />
      </template>
    </a-page-header>

    <a-card class="shadow-md">
      <a-table :columns="columns" :data-source="users" :pagination="false" :loading="pending" bordered>
        <template #bodyCell="{ column, index, value, record }">
          <template v-if="column.key === 'test'">
            <span>{{ index }}</span>
          </template>

          <template v-else-if="column.dataIndex === 'isBusy'">
            <template v-if="record.role === ERole.distributor">
              <a-tag v-if="value === true" color="error">
                <template #icon>
                  <CloseCircleOutlined />
                </template>
                OCUPADO
              </a-tag>

              <a-tag v-else color="success">
                <template #icon>
                  <CheckCircleOutlined />
                </template>
                DISPONIBLE
              </a-tag>
            </template>
            <template v-else>
              <span>-</span>
            </template>
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
                    <a href="javascript:;">Editar</a>
                  </a-menu-item>
                  <a-menu-item>
                    <a href="javascript:;">Eliminar</a>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- <pre>{{ JSON.stringify(vouchers, null, 2) }}</pre> -->
  </div>
</template>
