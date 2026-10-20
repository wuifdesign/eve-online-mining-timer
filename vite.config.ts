import { defineConfig } from 'vitest/config'
import { preact } from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  // preact preset also aliases react/react-dom to preact/compat for zustand
  plugins: [preact(), tailwindcss()],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  base: './',
  build: {
    outDir: 'docs',
  },
  test: {
    globals: true,
  },
})
