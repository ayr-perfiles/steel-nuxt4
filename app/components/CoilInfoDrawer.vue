<script setup lang="ts">
import { layout } from "~/constants";

interface Props {
  open: boolean;
  coilId: string;
}

const props = defineProps<Props>();

defineEmits<{
  onClose: [];
}>();

const { repository: coil, pendingRepository: pending } = useCrudCoils(
  props.coilId
);
</script>

<template>
  <div>
    <a-drawer
      width="640"
      placement="right"
      :closable="false"
      :open="open"
      @close="$emit('onClose')"
    >
      <p v-if="pending || !coil">Cargando...</p>

      <template v-else>
        <p>
          Bobina <strong>{{ coil.serie }}</strong>
        </p>

        <a-descriptions title="Info" :column="1" bordered>
          <a-descriptions-item label="Peso [kg]">
            {{ coil.weight }}
          </a-descriptions-item>
          <a-descriptions-item label="Ancho [mm]">
            {{ coil.width }}
          </a-descriptions-item>
          <a-descriptions-item label="Precio por [kg]">
            {{ coil.price }}
          </a-descriptions-item>
        </a-descriptions>
      </template>
    </a-drawer>
  </div>
</template>
