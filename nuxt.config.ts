import { defineNuxtConfig } from 'nuxt/config'
import { resolve } from 'path'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['./app/sass/_main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "${resolve(process.cwd(), 'app/sass/variables/_variables.scss').replace(/\\/g, '/')}" as *;`
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