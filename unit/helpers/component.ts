import { mount } from '@vue/test-utils'
import type { Component } from 'vue'
import { createPinia } from 'pinia'
import { vuetify } from '@/plugins/vuetify'
import { vInputMask } from '@/directives/input-mask'

// Monta un componente aislado con Vuetify y la directiva de máscara, sin router ni backend.
export function mountComponent(component: Component, props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(component, {
    props,
    slots,
    attachTo: document.body,
    global: { plugins: [createPinia(), vuetify], directives: { 'input-mask': vInputMask } },
  })
}

export function fileList(...files: File[]): FileList {
  return Object.assign([...files], { item: (i: number) => files[i] ?? null }) as unknown as FileList
}
