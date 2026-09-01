import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { es } from 'vuetify/locale'

export const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases,
      clear: aliases.close,
      delete: aliases.close,
    },
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#DC2626',
          secondary: '#F87171',
        },
      },
      dark: {
        colors: {
          primary: '#DC2626',
          secondary: '#F87171',
        },
      },
    },
  },
  locale: {
    locale: 'es',
    messages: { es },
  },
})
