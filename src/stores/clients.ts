import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createClientFilters, type ClientFilters } from '@/models/client/client.models'
import type { ApiRequestError } from '@/lib/http'

export const useClientsStore = defineStore('clients', () => {
  const filters = ref<ClientFilters>(createClientFilters())
  const page = ref(1)
  const size = ref(10)

  const detailOpen = ref(false)
  const selectedId = ref<number | null>(null)

  const formOpen = ref(false)
  const editingId = ref<number | null>(null)

  const errorBack = ref<ApiRequestError | null>(null)

  function resetFilters() {
    filters.value = createClientFilters()
    page.value = 1
  }

  function openDetail(id: number) {
    selectedId.value = id
    detailOpen.value = true
  }

  function openCreateForm() {
    editingId.value = null
    formOpen.value = true
  }

  function openEditForm(id: number) {
    editingId.value = id
    detailOpen.value = false
    formOpen.value = true
  }

  return {
    filters,
    page,
    size,
    detailOpen,
    selectedId,
    formOpen,
    editingId,
    errorBack,
    resetFilters,
    openDetail,
    openCreateForm,
    openEditForm,
  }
})
