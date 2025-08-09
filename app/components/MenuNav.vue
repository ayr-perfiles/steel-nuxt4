<script lang="ts" setup>
import {
  AimOutlined,
  AuditOutlined,
  BarChartOutlined,
  BarcodeOutlined,
  CarOutlined,
  ContactsOutlined,
  DollarOutlined,
  FileDoneOutlined,
  GlobalOutlined,
  GoldFilled,
  StockOutlined,
  TagsOutlined,
  TeamOutlined,
} from "@ant-design/icons-vue";
import type { ItemType, MenuProps } from "ant-design-vue";
import type { VueElement } from "vue";

const router = useRouter();
const route = useRoute();

const selectedKeys = ref<string[]>([route.name as string]);
const openKeys = ref(["sub1", "sub2"]);

function getItem(
  label: VueElement | string,
  key: string,
  icon?: any,
  children?: ItemType[],
  type?: "group"
): ItemType {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as ItemType;
}

const items: ItemType[] = reactive([
  getItem("Escritorio", "Dashboard", () => h(BarChartOutlined)),
  // getItem("Pedidos", "Orders", () => h(FileDoneOutlined)),
  getItem("Ventas", "Sales", () => h(DollarOutlined)),
  // getItem("Comprobantes", "Vouchers", () => h(BlockOutlined)),
  getItem("Clientes", "Customers", () => h(ContactsOutlined)),

  // getItem("Repartos", "grp", null, [], "group"),
  // { type: "divider" },

  // getItem("Lista de repartos", "Distributions", () => h(AimOutlined)),
  // getItem("Zonas", "Zones", () => h(GlobalOutlined)),
  // getItem("Vehículos", "Vehicles", () => h(CarOutlined)),

  getItem("Producto", "grp", null, [], "group"),
  { type: "divider" },

  getItem("Lista de productos", "Products", () => h(BarcodeOutlined)),
  getItem("Lista de bobinas", "Coils", () => h(BarcodeOutlined)),
  // getItem("Envases", "Envases", () => h(GoldFilled)),
  // getItem("Marcas", "Brands", () => h(TagsOutlined)),

  getItem("Almacén", "grp", null, [], "group"),
  { type: "divider" },

  getItem("Almacén", "Store", () => h(StockOutlined)),

  // getItem('Repartos', 'sub1', null, [
  //   getItem('Lista de repartos', 'Distributions'),
  //   getItem('Zonas', 'Zones'),
  //   getItem('Vehículos', 'Vehicles'),
  // ]),
  // getItem('Productos', 'sub2', null, [
  //   getItem('Lista de productos', 'Products'),
  //   getItem('Envases', 'Envases'),
  //   getItem('Marcas', 'Brands'),
  // ]),

  // getItem("Gastos e ingresos", "grp", null, [], "group"),
  // { type: "divider" },
  // getItem("Gastos e ingresos", "CashMovementsStore", () => h(AuditOutlined)),

  getItem("Configuración", "grp", null, [], "group"),
  { type: "divider" },
  getItem("Usuarios", "Users", h(TeamOutlined)),
]);

const handleClick: MenuProps["onClick"] = (e) => {
  router.push({ name: e.key as string });
};

watch(
  () => route.name,
  (newVal) => {
    selectedKeys.value = [newVal as string];
  }
);
</script>

<template>
  <div>
    <a-menu
      v-model:openKeys="openKeys"
      v-model:selectedKeys="selectedKeys"
      mode="inline"
      theme="dark"
      :items="items"
      @click="handleClick"
    />
  </div>
</template>
