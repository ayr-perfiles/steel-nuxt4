<script lang="ts" setup>
import type { TableProps } from "ant-design-vue";
import _ from "lodash";
import type { IVoucher } from "~/models/voucher";

interface Voucher {
  id: string;
  name: string;
  stock: number;
}

const emit = defineEmits<{
  onSelected: [voucher: Voucher];
}>();

const dayjs = useDayjs();

const open = ref(false);
const voucher = ref<IVoucher>();

const { data: vouchers, pending, remove } = useCrudVouchers();

const handleRemove = (id: string) => {
  Modal.confirm({
    title: "¿Estás seguro de eliminar este comprobante?",
    content: "Esta acción no se puede deshacer.",
    okText: "Sí, eliminar",
    okType: "danger",
    cancelText: "Cancelar",
    async onOk() {
      try {
        await remove(id);
        notificationSuccess("Comprobante eliminado correctamente");
      } catch (error) {
        modalError("Error al eliminar el comprobante" + error);
      }
    },
  });
};

const handleUpdate = (voucherSelected: any) => {
  open.value = true;
  voucher.value = voucherSelected;
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
    title: "FECHA",
    key: "date",
    dataIndex: "date",
    width: "120px",
    align: "center",
    defaultSortOrder: "descend",
    sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    customRender: ({ value }) => {
      return dayjs(value).format("DD/MM/YYYY HH:mm");
    },
  },
  {
    title: "NUM",
    key: "numberVoucher",
    dataIndex: "numberVoucher",
    width: "100px",
    align: "center",
  },
  {
    title: "RAZÓN SOCIAL",
    key: "customer",
    dataIndex: "customer",
    customRender: ({ value }) => {
      return value.businessEntity;
    },
  },
  // {
  //   title: "DESCRIPCIÓN",
  //   key: "description",
  //   dataIndex: "description",
  // },
  {
    title: "TOTAL",
    key: "total",
    dataIndex: "total",
    width: "100px",
    align: "right",
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
      :data-source="vouchers"
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

        <template v-else-if="column.key === 'numberVoucher'">
          <a
            class="text-blue-600 hover:underline cursor-pointer"
            @click="handleUpdate(record)"
            >{{ text }}</a
          >
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

    <NewVoucherModal
      v-if="open"
      :voucher="voucher"
      :open="open"
      @on-close="open = false"
    />
  </div>
</template>
