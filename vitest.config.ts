import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['unit/**/*.test.ts'],
    setupFiles: ['unit/setup.ts'],
    css: false,
    // Con la instrumentación de cobertura los tests que montan la app completa tardan varios segundos.
    testTimeout: 60_000,
    hookTimeout: 60_000,
    server: { deps: { inline: ['vuetify'] } },
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'text', 'lcov', 'html'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/main.ts', 'src/types/**', 'src/**/*.d.ts'],
    },
  },
})
