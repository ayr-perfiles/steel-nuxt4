<script lang="ts" setup>
import { ETypeProduct } from "~/enums";

const open = ref(false);
</script>

<template>
  <div>
    <a-button type="primary" @click="open = true">
      <template #icon> <PlusOutlined /> </template>
      Añadir producto
    </a-button>

    <NewProductModal
      v-if="open"
      :open="open"
      :type="ETypeProduct.product"
      @on-close="open = false"
    />
  </div>
</template>
