import { createApp } from 'vue'
import '@fontsource-variable/inter'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from '@/App.vue'
import router from '@/router'
import { vuetify } from '@/plugins/vuetify'
import { vInputMask } from '@/directives/input-mask'
import '@vuepic/vue-datepicker/dist/main.css'

createApp(App)
  .directive('input-mask', vInputMask)
  .use(createPinia())
  .use(router)
  .use(VueQueryPlugin)
  .use(vuetify)
  .mount('#app')
