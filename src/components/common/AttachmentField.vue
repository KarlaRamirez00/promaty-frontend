<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import {
  mdiCheck,
  mdiCloudUploadOutline,
  mdiDeleteOutline,
  mdiDownloadOutline,
  mdiFileDocumentOutline,
  mdiFileExcelBox,
  mdiFileImageOutline,
  mdiFilePdfBox,
  mdiFileWordBox,
  mdiPencilOutline,
} from '@mdi/js'
import { ATTACHMENT_MAX_SIZE_MB, type AttachmentRule, type FileAttachment } from '@/models'
import { formatFileSize } from '@/utils'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'

const props = defineProps<{
  rule: AttachmentRule
  // Adjuntos ya guardados en backend.
  saved: FileAttachment[]
  readonly?: boolean
}>()

// Archivos elegidos que se suben al guardar el formulario, con el nombre que el usuario les dejó.
const pending = defineModel<File[]>({ default: () => [] })

const emit = defineEmits<{
  removeSaved: [attachment: FileAttachment]
  download: [attachment: FileAttachment]
}>()

const FILE_ICONS: Record<string, { path: string; color: string }> = {
  pdf: { path: mdiFilePdfBox, color: 'error' },
  doc: { path: mdiFileWordBox, color: 'info' },
  docx: { path: mdiFileWordBox, color: 'info' },
  xls: { path: mdiFileExcelBox, color: 'success' },
  xlsx: { path: mdiFileExcelBox, color: 'success' },
  jpg: { path: mdiFileImageOutline, color: 'warning' },
  jpeg: { path: mdiFileImageOutline, color: 'warning' },
  png: { path: mdiFileImageOutline, color: 'warning' },
}
const DEFAULT_FILE_ICON = { path: mdiFileDocumentOutline, color: 'grey' }
const MAX_NAME_LENGTH = 100

const inputId = useId()
const input = ref<HTMLInputElement | null>(null)
const error = ref('')
const dragging = ref(false)
const editingIndex = ref<number | null>(null)
const draftName = ref('')

const accept = computed(() => props.rule.formats.map((format) => `.${format}`).join(','))
const formatsLabel = computed(() => props.rule.formats.map((format) => `.${format.toUpperCase()}`).join(', '))
const allowsMany = computed(() => props.rule.maxFiles === null || props.rule.maxFiles > 1)
const total = computed(() => props.saved.length + pending.value.length)
const isFull = computed(() => props.rule.maxFiles !== null && total.value >= props.rule.maxFiles)

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase()
}

function baseNameOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? name : name.slice(0, dot)
}

function iconFor(name: string) {
  return FILE_ICONS[extensionOf(name)] ?? DEFAULT_FILE_ICON
}

function validate(file: File): string {
  if (!props.rule.formats.includes(extensionOf(file.name))) {
    return `Formato no permitido. Se aceptan: ${formatsLabel.value}.`
  }
  if (file.size > ATTACHMENT_MAX_SIZE_MB * 1024 * 1024) {
    return `El archivo supera el máximo de ${ATTACHMENT_MAX_SIZE_MB} MB.`
  }
  return ''
}

function addFiles(files: File[]) {
  error.value = ''
  const accepted: File[] = []
  for (const file of files) {
    const limit = props.rule.maxFiles
    if (limit !== null && total.value + accepted.length >= limit) {
      error.value = limit === 1 ? 'Solo se permite 1 archivo.' : `Solo se permiten ${limit} archivos.`
      break
    }
    const problem = validate(file)
    if (problem) {
      error.value = problem
      continue
    }
    accepted.push(file)
  }
  if (accepted.length) pending.value = [...pending.value, ...accepted]
}

function openPicker() {
  if (!isFull.value) input.value?.click()
}

function onSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files ?? [])
  target.value = ''
  addFiles(files)
}

function onDrop(event: DragEvent) {
  dragging.value = false
  if (isFull.value) return
  addFiles(Array.from(event.dataTransfer?.files ?? []))
}

function removePending(index: number) {
  pending.value = pending.value.filter((_, position) => position !== index)
  if (editingIndex.value === index) editingIndex.value = null
  error.value = ''
}

function startEdit(index: number) {
  editingIndex.value = index
  draftName.value = baseNameOf(pending.value[index].name)
  error.value = ''
}

function cancelEdit() {
  editingIndex.value = null
  error.value = ''
}

// El archivo conserva su extensión; solo cambia el nombre con el que se envía a backend.
function commitEdit() {
  const index = editingIndex.value
  if (index === null) return
  const name = draftName.value.trim()
  if (!name) {
    error.value = 'El nombre no puede quedar vacío.'
    return
  }
  const file = pending.value[index]
  const extension = extensionOf(file.name)
  const renamed = new File([file], extension ? `${name}.${extension}` : name, {
    type: file.type,
    lastModified: file.lastModified,
  })
  pending.value = pending.value.map((item, position) => (position === index ? renamed : item))
  editingIndex.value = null
  error.value = ''
}
</script>

<template>
  <div class="attachment-field">
    <div :id="`${inputId}-label`" class="text-body-2 mb-2">Archivo adjunto</div>

    <template v-if="!readonly">
      <input
        :id="inputId"
        ref="input"
        :aria-labelledby="`${inputId}-label`"
        type="file"
        class="d-none"
        :accept="accept"
        :multiple="allowsMany"
        @change="onSelect"
      />
      <button
        type="button"
        class="attachment-field__dropzone"
        :class="{
          'attachment-field__dropzone--active': dragging,
          'attachment-field__dropzone--disabled': isFull,
        }"
        :aria-disabled="isFull"
        @click="openPicker"
        @dragover.prevent="dragging = !isFull"
        @dragleave.prevent="dragging = false"
        @drop.prevent="onDrop"
      >
        <v-icon :icon="mdiCloudUploadOutline" size="40" color="primary" />
        <span class="text-body-1 mt-2">
          {{ allowsMany ? 'Agrega o arrastra los archivos aquí' : 'Agrega o arrastra el archivo aquí' }}
        </span>
        <span class="text-caption text-medium-emphasis mt-1">
          Formatos permitidos: {{ formatsLabel }} (Máx. {{ ATTACHMENT_MAX_SIZE_MB }}MB)
        </span>
      </button>
    </template>

    <FieldErrorComponent :message="error" />

    <div v-if="total > 0" class="d-flex flex-column ga-2 mt-3">
      <v-sheet v-for="item in saved" :key="`saved-${item.id}`" class="attachment-field__item">
        <v-icon :icon="iconFor(item.name).path" :color="iconFor(item.name).color" size="28" />
        <div class="attachment-field__name">
          <span class="text-body-2 text-truncate">{{ item.name }}</span>
          <span class="text-caption text-medium-emphasis">{{ item.fileSizeLabel }}</span>
        </div>
        <v-btn
          :icon="mdiDownloadOutline"
          variant="text"
          size="small"
          color="info"
          aria-label="Descargar"
          @click="emit('download', item)"
        />
        <v-btn
          v-if="!readonly"
          :icon="mdiDeleteOutline"
          variant="text"
          size="small"
          color="error"
          aria-label="Eliminar"
          @click="emit('removeSaved', item)"
        />
      </v-sheet>

      <v-sheet v-for="(file, index) in pending" :key="`pending-${index}`" class="attachment-field__item">
        <v-icon :icon="iconFor(file.name).path" :color="iconFor(file.name).color" size="28" />

        <v-text-field
          v-if="editingIndex === index"
          v-model="draftName"
          v-input-mask="'lettersNumbersAndSeparators'"
          :suffix="`.${extensionOf(file.name)}`"
          :maxlength="MAX_NAME_LENGTH"
          variant="underlined"
          density="compact"
          hide-details
          autofocus
          aria-label="Nombre del archivo"
          @keydown.enter.prevent="commitEdit"
          @keydown.esc.prevent="cancelEdit"
        />
        <div v-else class="attachment-field__name">
          <span class="text-body-2 text-truncate">{{ file.name }}</span>
          <span class="text-caption text-medium-emphasis">{{ formatFileSize(file.size) }}</span>
        </div>

        <v-btn
          :icon="editingIndex === index ? mdiCheck : mdiPencilOutline"
          variant="text"
          size="small"
          :color="editingIndex === index ? 'success' : 'warning'"
          :aria-label="editingIndex === index ? 'Confirmar nombre' : 'Editar nombre'"
          @click="editingIndex === index ? commitEdit() : startEdit(index)"
        />
        <v-btn
          :icon="mdiDeleteOutline"
          variant="text"
          size="small"
          color="error"
          aria-label="Eliminar"
          @click="removePending(index)"
        />
      </v-sheet>
    </div>

    <div v-else-if="readonly" class="text-body-2 text-medium-emphasis">Sin archivos adjuntos.</div>
  </div>
</template>

<style scoped>
.attachment-field__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  font: inherit;
  color: inherit;
  background: none;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  border: thin dashed rgba(var(--v-theme-on-surface), 0.38);
  border-radius: 4px;
  outline: none;
  transition:
    border-color 0.15s,
    background-color 0.15s;
}

.attachment-field__dropzone:hover,
.attachment-field__dropzone:focus-visible,
.attachment-field__dropzone--active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.06);
}

.attachment-field__dropzone--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: rgba(var(--v-theme-on-surface), 0.38);
  background-color: transparent;
}

.attachment-field__item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 4px 8px 4px 16px;
  border: thin solid rgba(var(--v-theme-on-surface), 0.38);
  border-radius: 4px;
}

.attachment-field__name {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}
</style>
