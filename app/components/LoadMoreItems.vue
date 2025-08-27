<script lang="ts" setup>
const props = defineProps<{
  currentPage: number;
  totalCoils: number;
  prevPage: () => void;
  nextPage: () => void;
}>();

const sizePerPage = defineModel({ type: Number, required: true });

const getTextPagination = computed(() => {
  const from = sizePerPage.value * props.currentPage + 1;
  let to = sizePerPage.value * (props.currentPage + 1);
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
        <span>Filas por pagina: </span>
        <a-select v-model:value="sizePerPage" style="width: 60px">
          <a-select-option :value="2">10</a-select-option>
          <a-select-option :value="4">30</a-select-option>
          <a-select-option :value="6">50</a-select-option>
        </a-select>

        <span>
          {{ getTextPagination }}
        </span>

        <a-button
          type="link"
          @click="prevPage"
          :disabled="props.currentPage === 0"
        >
          <template #icon><arrow-left-outlined /> </template>
        </a-button>

        <a-button
          type="link"
          @click="nextPage"
          :disabled="(props.currentPage + 1) * sizePerPage >= props.totalCoils"
        >
          <template #icon><arrow-right-outlined /> </template>
        </a-button>
      </a-space>
    </div>
  </div>
</template>
