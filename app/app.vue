<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Steel` : "Steel";
  },
});
</script>

<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtErrorBoundary>
        <template #error="{ error }">
          <p>An error occurred: {{ error }}</p>
        </template>
      </NuxtErrorBoundary>
      <NuxtPage />
      <!-- <a-extract-style>
        <NuxtPage />
      </a-extract-style> -->
    </NuxtLayout>
  </div>
</template>
