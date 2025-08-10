<script lang="ts" setup>
definePageMeta({
  name: "Sales",
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <a-page-header
      class="bg-white shadow-md"
      style="border: 1px solid rgb(235, 237, 240)"
    >
      <template #title>
        <span class="text-lg font-bold"><GroupOutlined /> Ventas</span>
      </template>
      <template #subTitle>
        <AddVoucherButton class="inline-block" />
      </template>

      <template #extra>
        <!-- <AddCategoryProductButton /> -->
      </template>
    </a-page-header>

    <a-card class="shadow-md">
      <VouchersTable />
    </a-card>
  </div>
</template>
