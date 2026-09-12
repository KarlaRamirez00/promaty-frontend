import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProjectTypesStore = defineStore('projectTypes', () => {
  const detailOpen = ref(false)
  const selectedId = ref<number | null>(null)

  const formOpen = ref(false)
  const editingId = ref<number | null>(null)

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
    detailOpen,
    selectedId,
    formOpen,
    editingId,
    openDetail,
    openCreateForm,
    openEditForm,
  }
})
