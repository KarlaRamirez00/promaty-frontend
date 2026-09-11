import pluginVue from 'eslint-plugin-vue'
import pluginSonarjs from 'eslint-plugin-sonarjs'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

// Réplica local (sin servidor) de las reglas de SonarQube que se revisan hoy vía la extensión
// SonarLint de VS Code — ver sección "Convenciones generales" de CLAUDE.md.
export default defineConfigWithVueTs(
  { ignores: ['dist/**', 'node_modules/**'] },
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  pluginSonarjs.configs.recommended,
  {
    rules: {
      // "todo" es una palabra española normal ("en todo el archivo", etc.) — esta regla la
      // confunde con el marcador de pendiente y dispara en comentarios normales.
      'sonarjs/todo-tag': 'off',
      // Vuetify usa nombres de slot con punto (#item.name, #item.active) — sintaxis válida de Vue
      // que esta regla todavía no reconoce y marca como si fuera un modificador de directiva.
      'vue/valid-v-slot': 'off',
    },
  },
)
