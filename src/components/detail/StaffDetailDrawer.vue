<script setup lang="ts">
import { computed } from 'vue'
import {
  accountTypeLabel,
  STAFF_STATUS_CODE,
  staffStatusColor,
  type Staff,
} from '@/models'
import type { DetailSection } from '@/types/detail'
import { formatDate, formatPhone, NO_DATA } from '@/utils'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailTabs from '@/components/common/DetailTabs.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const props = defineProps<{
  staff: Staff | null
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  edit: [staff: Staff]
  block: [staff: Staff]
  unblock: [staff: Staff]
}>()

const isActive = computed(() => props.staff?.status.code === STAFF_STATUS_CODE.ACTIVE)
const isBlocked = computed(() => props.staff?.status.code === STAFF_STATUS_CODE.BLOCKED)

const sections = computed<DetailSection[]>(() => {
  const s = props.staff
  if (!s) return []
  return [
    {
      key: 'personal',
      tab: 'Personal',
      title: 'Datos personales',
      fields: [
        { key: 'fullName', label: 'Nombre completo', value: s.fullName },
        { key: 'identificationNumber', label: 'RUT', value: s.identificationNumber },
        { key: 'birthDate', label: 'Fecha de nacimiento', value: formatDate(s.birthDate) },
        { key: 'registeredSex', label: 'Sexo registral', value: s.registeredSex.name },
        { key: 'maritalStatus', label: 'Estado civil', value: s.maritalStatus.name },
        { key: 'nationality', label: 'Nacionalidad', value: s.nationality.name },
        { key: 'personalEmail', label: 'Correo personal', value: s.personalEmail },
        { key: 'phone1', label: 'Teléfono', value: formatPhone(s.phone1) },
        { key: 'address', label: 'Dirección', value: s.address },
        { key: 'region', label: 'Región', value: s.region.name },
        { key: 'provincia', label: 'Provincia', value: s.provincia.name },
        { key: 'comuna', label: 'Comuna', value: s.comuna.name },
        { key: 'emergencyContactName', label: 'Contacto de emergencia', value: s.emergencyContactName },
        { key: 'emergencyPhone', label: 'Teléfono de emergencia', value: formatPhone(s.emergencyPhone) },
        {
          key: 'children',
          label: 'Hijos',
          value: s.hasChildren ? String(s.childrenCount) : 'No tiene',
        },
        { key: 'shoeSize', label: 'Talla de calzado', value: String(s.shoeSize) },
        { key: 'clothingSize', label: 'Talla de ropa', value: s.clothingSize },
        { key: 'educationLevel', label: 'Nivel educacional', value: s.educationLevel.name },
      ],
    },
    {
      key: 'work',
      tab: 'Laboral',
      title: 'Información laboral',
      fields: [
        { key: 'hireDate', label: 'Fecha de ingreso', value: formatDate(s.hireDate) },
        { key: 'afp', label: 'AFP', value: s.afp.name },
        { key: 'healthSystem', label: 'Sistema de salud', value: s.healthSystem.name },
        { key: 'bank', label: 'Banco', value: s.bank.name },
        { key: 'accountType', label: 'Tipo de cuenta', value: accountTypeLabel(s.accountType) },
        { key: 'accountNumber', label: 'Número de cuenta', value: s.accountNumber },
        ...(isBlocked.value
          ? [{ key: 'blockReason', label: 'Motivo del bloqueo', value: s.blockReason || NO_DATA }]
          : []),
      ],
    },
    {
      key: 'traceability',
      tab: 'Trazabilidad',
      title: 'Trazabilidad',
      fields: [
        { key: 'createdAt', label: 'Fecha de creación', value: s.createdAt },
        { key: 'createdBy', label: 'Creado por', value: s.createdBy },
        { key: 'updatedAt', label: 'Última actualización', value: s.updatedAt },
        { key: 'updatedBy', label: 'Actualizado por', value: s.updatedBy },
      ],
    },
  ]
})
</script>

<template>
  <DetailDrawer
    v-model:open="open"
    entity="colaborador"
    width="clamp(360px, 40vw, 480px)"
  >
    <template #badge>
      <v-chip
        v-if="staff"
        size="small"
        variant="tonal"
        :color="staffStatusColor(staff.status.code)"
        class="mt-1"
      >
        {{ staff.status.name }}
      </v-chip>
    </template>

    <template v-if="staff" #menu>
      <ActionsMenu
        :record="staff"
        :show-view="false"
        :blockable="isActive"
        :unblockable="isBlocked"
        @edit="emit('edit', staff)"
        @block="emit('block', staff)"
        @unblock="emit('unblock', staff)"
      />
    </template>

    <div v-if="loading && !staff" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <DetailTabs v-else-if="staff" :sections="sections" />
  </DetailDrawer>
</template>
