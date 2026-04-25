import { defineNuxtConfig } from 'nuxt/config'
import { resolve } from 'path'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['./app/sass/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/sass/abstract/_variables.scss" as *;
            @use "@/sass/abstract/_functions.scss" as *;
            @use "@/sass/abstract/_mixins.scss" as *;
          `
        }
      }
    }
  },

  modules: [
    '@nuxt/hints',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image'
  ]
})
