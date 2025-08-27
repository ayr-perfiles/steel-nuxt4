// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "@ant-design-vue/nuxt",
    "dayjs-nuxt",
    "nuxt-vuefire",
    "@pinia/nuxt",
  ],

  vuefire: {
    auth: {
      enabled: false,
    },
    emulators: true,
    config: {
      apiKey: "AIzaSyDI8o8O7jOP2LlxeXcrVXVJM1DdkQHPhHo",
      authDomain: "steel-f5208.firebaseapp.com",
      projectId: "steel-f5208",
      storageBucket: "steel-f5208.firebasestorage.app",
      messagingSenderId: "1096379907075",
      appId: "1:1096379907075:web:1afaeb4a3118205a682236",
      measurementId: "G-L4SYV296NG",
    },
  },

  tailwindcss: {
    // cssPath: "~/assets/css/tailwind.css",
    viewer: false,
    config: {
      important: true,
      darkMode: "class",
      corePlugins: {
        preflight: false,
      },
      content: ["./app/**/*.{vue,js,ts}"],
      theme: {
        extend: {},
      },
      plugins: [],
    },
  },

  antd: {
    extractStyle: true,
  },

  dayjs: {
    locales: ["en", "es"],
    plugins: ["relativeTime", "utc", "timezone", "isBetween"],
    defaultLocale: "es",
    defaultTimezone: "America/Lima",
  },

  css: ["ant-design-vue/dist/reset.css"],

  vite: {
    resolve: {
      alias: {
        "ant-design-vue/dist": "ant-design-vue/dist",
        "ant-design-vue/es": "ant-design-vue/es",
        "ant-design-vue/lib": "ant-design-vue/es",
        "ant-design-vue": "ant-design-vue/es",
      },
    },
  },
});