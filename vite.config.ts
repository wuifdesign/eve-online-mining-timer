import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import eslintPlugin from 'vite-plugin-eslint'

// https://vitejs.dev/config/
export default defineConfig((env) => {
  return {
    plugins: [
      react(),
      env.mode !== 'test' &&
        eslintPlugin({
          cache: false,
          include: ['./src/**/*.ts', './src/**/*.tsx'],
          exclude: [],
        }),
    ],
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
  }
})
