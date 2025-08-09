<script lang="ts" setup>
definePageMeta({
  name: "Coils",
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <a-page-header
      class="bg-white shadow-md"
      style="border: 1px solid rgb(235, 237, 240)"
    >
      <template #title>
        <span class="text-lg font-bold"><BarcodeOutlined /> Bobinas</span>
      </template>
      <template #subTitle>
        <!-- <AddProductButton class="inline-block" /> -->
      </template>

      <template #extra>
        <!-- <AddCategoryProductButton /> -->
      </template>
    </a-page-header>

    <a-card class="shadow-md">
      <!-- <ProductsTable :is-modal="false" /> -->
    </a-card>
  </div>
</template>
