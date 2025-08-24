<script lang="ts" setup>
import type { TableProps } from "ant-design-vue";

definePageMeta({
  name: "Dashboard",
});

const { updateReport, reportInformation } = useReportCoils();
const {
  updateReport: updateReportStrips,
  reportInformation: reportInformationStrips,
} = useReportStrips();

onMounted(() => {
  updateReport();
  updateReportStrips();
});

const columns: TableProps["columns"] = [
  {
    title: "PRODUCTO",
    key: "productName",
    dataIndex: "productName",
    defaultSortOrder: "descend",
    sorter: (a: any, b: any) =>
      (b.productName as string).charCodeAt(0) -
      (a.productName as string).charCodeAt(0),
  },
  {
    title: "TOTAL FLEJES",
    key: "totalStrips",
    dataIndex: "totalStrips",
    width: "100px",
    align: "center",
    customRender: ({ value }) => {
      return value > 0 ? value : "-";
    },
  },
  {
    title: "TOTAL FLEJES DISPONIBLES",
    key: "totalStripsAvailable",
    dataIndex: "totalStripsAvailable",
    width: "200px",
    align: "center",
    customRender: ({ value }) => {
      return value > 0 ? value : "-";
    },
  },

  {
    title: "TOTAL PESO FLEJES [kg]",
    key: "totalWeight",
    dataIndex: "totalWeight",
    width: "200px",
    align: "right",
    customRender: ({ value }) => {
      return value > 0 ? value : "-";
    },
  },
  // {
  //   title: "PRECIO REAL POR [kg]",
  //   key: "priceRealPerKilogram",
  //   dataIndex: "priceRealPerKilogram",
  //   width: "120px",
  //   align: "right",
  //   // customRender: ({ value }) => {
  //   //   return currency(value, "", 4);
  //   // },
  // },
  // {
  //   title: "PRECIO POR FLEJE [S/]",
  //   key: "pricePerStrip",
  //   dataIndex: "pricePerStrip",
  //   width: "120px",
  //   align: "right",
  //   // customRender: ({ value }) => {
  //   //   return currency(value, "", 4);
  //   // },
  // },

  {
    title: "",
    key: "action",
    width: "120px",
    align: "center",
  },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <a-page-header
      class="bg-white shadow-md sticky top-0 z-10"
      style="border: 1px solid rgb(235, 237, 240)"
    >
      <template #title>
        <span class="text-lg font-bold"><BarChartOutlined /> Dashboard</span>
      </template>
      <template #subTitle>
        <!-- <AddVoucherButton class="inline-block" /> -->
      </template>

      <template #extra>
        <!-- <AddCategoryProductButton /> -->
      </template>
    </a-page-header>

    <a-card class="shadow-md">
      <!-- <VouchersTable /> -->

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <h1 class="text-2xl font-bold col-span-full text-center">
          Reporte de Bobinas
        </h1>
        <div
          class="p-4 rounded-lg shadow-md bg-blue-100 flex flex-col items-center"
        >
          <span class="text-sm font-medium text-blue-700">Total Bobinas</span>
          <span class="text-2xl font-bold text-blue-900">
            {{ reportInformation.totalCoils }}
          </span>
        </div>
        <div
          class="p-4 rounded-lg shadow-md bg-green-100 flex flex-col items-center"
        >
          <span class="text-sm font-medium text-green-700"
            >Total Bobinas Cortadas</span
          >
          <span class="text-2xl font-bold text-green-900">
            {{ reportInformation.totalCuttingCoils }}
          </span>
        </div>

        <div
          class="p-4 rounded-lg shadow-md bg-red-100 flex flex-col items-center"
        >
          <span class="text-sm font-medium text-yellow-700"
            >Total peso [kg]</span
          >
          <span class="text-2xl font-bold text-yellow-900">
            {{ reportInformation.totalWeight }}
          </span>
        </div>

        <div
          class="p-4 rounded-lg shadow-md bg-yellow-100 flex flex-col items-center"
        >
          <span class="text-sm font-medium text-yellow-700">Total [S/]</span>
          <span class="text-2xl font-bold text-yellow-900">
            {{ currency(reportInformation.totalValue, "") }}
          </span>
        </div>
      </div>

      <a-divider class="col-span-full my-10" />

      <h1 class="text-2xl font-bold col-span-full text-center mb-4">
        Reporte de Flejes
      </h1>

      <a-table
        rowKey="productName"
        :columns="columns"
        :data-source="reportInformationStrips"
        :pagination="false"
        :scroll="{ x: 1100 }"
        bordered
      >
      </a-table>

      <a-divider class="col-span-full my-10" />

      <h1 class="text-2xl font-bold col-span-full text-center mb-4">
        Report de Productos
      </h1>

      <ProductsTable />
      <!-- <pre>{{ reportInformationStrips }}</pre> -->
    </a-card>
  </div>
</template>
