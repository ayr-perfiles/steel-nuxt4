<script lang="ts" setup>
import { EStatusCoil } from "~/enums";

interface Props {
  status: EStatusCoil;
}

const props = defineProps<Props>();

const color = ref("");

watchEffect(() => {
  if (EStatusCoil.process === props.status) color.value = "blue";
  else if (EStatusCoil.useless === props.status) color.value = "red";
  else if (EStatusCoil.completed === props.status) color.value = "green";
});
</script>

<template>
  <div>
    <a-tag :color="color">{{ getStatusCoil(status) }}</a-tag>
  </div>
</template>
