<script lang="ts" setup>
const open = ref(false);
</script>

<template>
  <div>
    <a-button type="primary" @click="open = true">
      <template #icon> <PlusOutlined /> </template>
      Añadir cliente
    </a-button>

    <NewCustomerModal v-if="open" :open="open" @on-close="open = false" />
  </div>
</template>
