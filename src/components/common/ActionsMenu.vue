<script setup lang="ts">
import { computed } from 'vue'
import {
  mdiAccountLockOpenOutline,
  mdiAccountLockOutline,
  mdiCancel,
  mdiCheck,
  mdiClose,
  mdiDotsHorizontal,
  mdiEyeOutline,
  mdiPencilOutline,
  mdiPower,
} from '@mdi/js'
import { ACTION } from '@/constants/actions.constants'

const props = withDefaults(
  defineProps<{
    record: { active?: boolean; actions: string[] }
    // false en el slide de detalle: "Ver detalle" no tiene sentido si ya estás viendo el detalle.
    showView?: boolean
    // El estado del registro (no solo el permiso) decide si se puede bloquear.
    blockable?: boolean
    unblockable?: boolean
  }>(),
  {
    showView: true,
    blockable: false,
    unblockable: false,
  },
)

const emit = defineEmits<{
  view: []
  edit: []
  toggle: []
  approve: []
  validate: []
  reject: []
  annul: []
  block: []
  unblock: []
}>()

// actions[] es la única fuente: backend ya lo calcula según los permisos del usuario y el estado del registro.
const showEdit = computed(() => props.record.actions.includes(ACTION.UPDATE))
const showToggle = computed(
  () =>
    props.record.active !== undefined &&
    props.record.actions.includes(ACTION.ACTIVE),
)
const showApprove = computed(() => props.record.actions.includes(ACTION.APPROVE))
const showValidate = computed(() => props.record.actions.includes(ACTION.VALIDATE))
const showReject = computed(() => showApprove.value || showValidate.value)
const showAnnul = computed(() => props.record.actions.includes(ACTION.ANNUL))
const showBlock = computed(() => props.blockable && props.record.actions.includes(ACTION.STATUS))
const showUnblock = computed(() => props.unblockable && props.record.actions.includes(ACTION.STATUS))
const toggleLabel = computed(() => (props.record.active ? 'Desactivar' : 'Activar'))
const toggleColor = computed(() => (props.record.active ? 'error' : 'success'))

// Fuente única: si ninguna acción aplica para este registro, no se renderiza el botón "..." —
// un menú sin opciones es un botón muerto (ver Documentacion/.../actions-slide.md).
const hasAnyAction = computed(
  () =>
    props.showView ||
    showEdit.value ||
    showToggle.value ||
    showBlock.value ||
    showUnblock.value ||
    showApprove.value ||
    showValidate.value ||
    showAnnul.value,
)
</script>

<template>
  <v-menu v-if="hasAnyAction">
    <template #activator="{ props: menuProps }">
      <v-btn
        :icon="mdiDotsHorizontal"
        variant="text"
        size="small"
        data-testid="row-actions"
        v-bind="menuProps"
      />
    </template>

    <v-list class="actions-list" density="compact" nav>
      <v-list-item
        v-if="showView"
        :prepend-icon="mdiEyeOutline"
        base-color="info"
        title="Ver detalle"
        data-testid="action-view"
        @click="emit('view')"
      />
      <v-list-item
        v-if="showApprove"
        :prepend-icon="mdiCheck"
        base-color="success"
        title="Aprobar"
        data-testid="action-approve"
        @click="emit('approve')"
      />
      <v-list-item
        v-if="showValidate"
        :prepend-icon="mdiCheck"
        base-color="success"
        title="Validar"
        data-testid="action-validate"
        @click="emit('validate')"
      />
      <v-list-item
        v-if="showReject"
        :prepend-icon="mdiClose"
        base-color="error"
        title="Rechazar"
        data-testid="action-reject"
        @click="emit('reject')"
      />
      <v-list-item
        v-if="showAnnul"
        :prepend-icon="mdiCancel"
        base-color="error"
        title="Anular"
        data-testid="action-annul"
        @click="emit('annul')"
      />
      <v-list-item
        v-if="showEdit"
        :prepend-icon="mdiPencilOutline"
        base-color="warning"
        title="Editar"
        @click="emit('edit')"
      />
      <v-list-item
        v-if="showToggle"
        :prepend-icon="mdiPower"
        :base-color="toggleColor"
        :title="toggleLabel"
        @click="emit('toggle')"
      />
      <v-list-item
        v-if="showBlock"
        :prepend-icon="mdiAccountLockOutline"
        base-color="error"
        title="Bloquear"
        data-testid="action-block"
        @click="emit('block')"
      />
      <v-list-item
        v-if="showUnblock"
        :prepend-icon="mdiAccountLockOpenOutline"
        base-color="success"
        title="Desbloquear"
        @click="emit('unblock')"
      />
    </v-list>
  </v-menu>
</template>

<style scoped>
.actions-list {
  border-radius: 12px;
}

.actions-list :deep(.v-list-item) {
  cursor: pointer;
  user-select: none;
}

.actions-list :deep(.v-list-item__overlay) {
  background-color: rgb(var(--v-theme-on-surface));
}
</style>
