<script lang="ts" setup>
const props = defineProps<{
  sizePerPage: number;
  currentPage: number;
  totalCoils: number;
  prevPage: () => void;
  nextPage: () => void;
}>();

const getTextPagination = computed(() => {
  const from = props.sizePerPage * props.currentPage + 1;
  let to = props.sizePerPage * (props.currentPage + 1);
  if (to > props.totalCoils) {
    to = props.totalCoils;
  }
  return `${from}-${to} de ${props.totalCoils}`;
});
</script>

<template>
  <div class="py-4">
    <div class="flex justify-center">
      <a-space>
        <span>Filas por pagina:</span>
        <a-select v-model:value="sizePerPage" style="width: 60px">
          <a-select-option :value="10">10</a-select-option>
          <a-select-option :value="30">30</a-select-option>
          <a-select-option :value="50">50</a-select-option>
          <!-- <a-select-option :value="200">200</a-select-option> -->
        </a-select>

        <span>
          {{ getTextPagination }}
        </span>

        <a-button type="link" @click="prevPage">
          <template #icon><arrow-left-outlined /> </template>
        </a-button>

        <a-button type="link" @click="nextPage">
          <template #icon><arrow-right-outlined /> </template>
        </a-button>
      </a-space>
    </div>
  </div>
</template>
