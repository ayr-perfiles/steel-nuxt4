<script setup lang="ts">
import type { SelectValue } from "ant-design-vue/es/select";
import { computed, defineProps, defineEmits } from "vue";

const props = defineProps<{
  pagination: {
    pageSize: number;
    currentPageIndex: number;
    total: number;
  };
}>();

const emit = defineEmits(["update:pageSize", "prev", "next"]);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.pagination.total / props.pagination.pageSize))
);

function onPageSizeChange(val: SelectValue) {
  emit("update:pageSize", val);
}

function onPrev() {
  emit("prev");
}

function onNext() {
  emit("next");
}
</script>

<template>
  <div class="py-4">
    <div class="flex justify-center">
      <a-space>
        <span>Filas por página:</span>
        <a-select
          v-model:value="pagination.pageSize"
          style="width: 60px"
          @change="onPageSizeChange"
        >
          <a-select-option :value="10">10</a-select-option>
          <a-select-option :value="20">20</a-select-option>
          <a-select-option :value="50">50</a-select-option>
        </a-select>

        <span>
          Página {{ pagination.currentPageIndex + 1 }} de
          {{ totalPages }} (Total: {{ pagination.total }} elementos)
        </span>

        <a-button type="link" @click="onPrev">
          <template #icon><arrow-left-outlined /></template>
        </a-button>

        <a-button type="link" @click="onNext">
          <template #icon><arrow-right-outlined /></template>
        </a-button>
      </a-space>
    </div>
  </div>
</template>
