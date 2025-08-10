<script setup lang="ts">
import { theme as antdTheme } from "ant-design-vue";
import esES from "ant-design-vue/es/locale/es_ES";

// const online = useOnline();

const locale = ref(esES);

const theme = reactive({
  algorithm: antdTheme.compactAlgorithm,
  components: {
    Card: {
      colorFillAlter: "#1677ff",
      colorBgContainer: "#ffffff",
      // colorTextHeading: 'white',
    },
  },
  token: {
    borderRadius: 0,
    // fontSize: 11,
  },
});

// const color = reactive({
//   bg:"#fff",
//   color:"#000"
// })
// const changeTheme = (type:'dark' | 'light') => {
//   if(type === 'dark'){
//     theme.algorithm = antdTheme.darkAlgorithm
//     color.bg = "#000"
//     color.color = "#fff"
//   }else{
//     theme.algorithm = antdTheme.defaultAlgorithm
//     color.bg = "#fff"
//     color.color = "#000"
//   }
// }
</script>

<template>
  <div class="font-sans">
    <a-config-provider :locale="locale" :theme="theme">
      <a-layout has-sider>
        <SiderMain />
        <a-layout class="min-h-screen">
          <!-- <HeaderMain /> -->
          <a-layout-content class="mx-4 my-4 over">
            <slot />
          </a-layout-content>
        </a-layout>
        <!-- <InternetStatus v-if="!online" /> -->
      </a-layout>
    </a-config-provider>
  </div>
</template>
