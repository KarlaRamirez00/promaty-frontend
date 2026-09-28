<script setup lang="ts">
import { computed } from 'vue'
import { accountTypeLabel, identificationTypeLabel, type Staff } from '@/models'
import { formatDate } from '@/utils'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailFieldList from '@/components/common/DetailFieldList.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const props = withDefaults(
  defineProps<{
    staff: Staff | null
    loading?: boolean
    hasUpdatePermission?: boolean
  }>(),
  {
    hasUpdatePermission: true,
  },
)

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  edit: [staff: Staff]
}>()

const fields = computed(() => {
  const s = props.staff
  if (!s) return []
  return [
    { key: 'fullName', label: 'Nombre completo', value: s.fullName },
    {
      key: 'identification',
      label: 'Identificación',
      value: `${identificationTypeLabel(s.identificationType)} ${s.identificationNumber}`,
    },
    { key: 'birthDate', label: 'Fecha de nacimiento', value: formatDate(s.birthDate) },
    { key: 'registeredSex', label: 'Sexo registral', value: s.registeredSex.name },
    { key: 'maritalStatus', label: 'Estado civil', value: s.maritalStatus.name },
    { key: 'nationality', label: 'Nacionalidad', value: s.nationality.name },
    { key: 'personalEmail', label: 'Correo personal', value: s.personalEmail },
    { key: 'phone1', label: 'Teléfono', value: s.phone1 },
    { key: 'address', label: 'Dirección', value: s.address },
    { key: 'city', label: 'Ciudad', value: s.city },
    { key: 'emergencyContactName', label: 'Contacto de emergencia', value: s.emergencyContactName },
    { key: 'emergencyPhone', label: 'Teléfono de emergencia', value: s.emergencyPhone },
    {
      key: 'children',
      label: 'Hijos',
      value: s.hasChildren ? String(s.childrenCount) : 'No tiene',
    },
    { key: 'shoeSize', label: 'Talla de calzado', value: String(s.shoeSize) },
    { key: 'clothingSize', label: 'Talla de ropa', value: s.clothingSize },
    { key: 'educationLevel', label: 'Nivel educacional', value: s.educationLevel.name },
    { key: 'afp', label: 'AFP', value: s.afp.name },
    { key: 'healthSystem', label: 'Sistema de salud', value: s.healthSystem.name },
    { key: 'bank', label: 'Banco', value: s.bank.name },
    { key: 'accountType', label: 'Tipo de cuenta', value: accountTypeLabel(s.accountType) },
    { key: 'accountNumber', label: 'Número de cuenta', value: s.accountNumber },
    { key: 'createdAt', label: 'Fecha de creación', value: s.createdAt },
    { key: 'createdBy', label: 'Creado por', value: s.createdBy },
    { key: 'updatedAt', label: 'Última actualización', value: s.updatedAt },
    { key: 'updatedBy', label: 'Actualizado por', value: s.updatedBy },
  ]
})
</script>

<template>
  <DetailDrawer
    v-model:open="open"
    entity="colaborador"
    width="clamp(360px, 40vw, 480px)"
  >
    <template v-if="staff" #menu>
      <ActionsMenu
        :record="staff"
        :has-update-permission="hasUpdatePermission"
        :show-view="false"
        @edit="emit('edit', staff)"
      />
    </template>

    <div v-if="loading && !staff" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <DetailFieldList v-else-if="staff" :items="fields" />
  </DetailDrawer>
</template>
