<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiArrowDownCircleOutline, mdiContentSave } from '@mdi/js'
import {
  createRoleAction,
  getPermissionOptionsAction,
  getRoleDetailAction,
  updateRoleAction,
} from '@/actions'
import { useMessage } from '@/composables/useMessage'
import { useError } from '@/utils'
import messages from '@/messages'
import roleMessages from '@/messages/role.messages'
import { ROUTE } from '@/router/route-names'
import { createRoleForm, type RoleForm, type RolePermissionOption, type RoleSubModuleSummary } from '@/models'
import { firstError, roleNameRules } from '@/rules'
import type { ApiErrorFields } from '@/types/api'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'

const props = defineProps<{
  id?: string
}>()

const router = useRouter()
const queryClient = useQueryClient()
const { toastSaved, toastFailed } = useMessage()
const { normalizeError } = useError()

const roleId = computed(() => (props.id ? Number(props.id) : null))
const isEditing = computed(() => roleId.value !== null)

const { data: existingRole } = useQuery({
  queryKey: computed(() => ['roles', 'detail', roleId.value]),
  queryFn: () => getRoleDetailAction(roleId.value as number),
  enabled: computed(() => roleId.value !== null),
})

const { data: permissionOptions } = useQuery({
  queryKey: ['permissions', 'options'],
  queryFn: getPermissionOptionsAction,
})

// Catálogo de permisos agrupado por submódulo — no hay endpoint separado de submodules, se derivan
// de acá (deduplicado por id, en el orden en que aparecen).
const subModuleOptions = computed<RoleSubModuleSummary[]>(() => {
  const seen = new Map<number, RoleSubModuleSummary>()
  for (const permission of permissionOptions.value ?? []) {
    if (!seen.has(permission.subModule.id)) seen.set(permission.subModule.id, permission.subModule)
  }
  return [...seen.values()]
})

const permissionGroups = computed(() => {
  const groups = new Map<number, { subModule: RoleSubModuleSummary; permissions: RolePermissionOption[] }>()
  for (const permission of permissionOptions.value ?? []) {
    const group = groups.get(permission.subModule.id)
    if (group) {
      group.permissions.push(permission)
    } else {
      groups.set(permission.subModule.id, { subModule: permission.subModule, permissions: [permission] })
    }
  }
  return [...groups.values()]
})

const form = ref<RoleForm>(createRoleForm())
const fieldErrors = ref<Record<string, string>>({})
const backendErrorFields = ref<ApiErrorFields | null>(null)

const hasValidationError = computed(() => Object.keys(fieldErrors.value).length > 0)
const alert = computed(() =>
  hasValidationError.value ? roleMessages.alertError : roleMessages.alertInfo,
)

watch(
  existingRole,
  (role) => {
    if (role) {
      form.value = createRoleForm({
        id: role.id,
        name: role.name,
        description: role.description ?? '',
        permissionIds: role.permissions.map((p) => p.id),
        subModuleIds: role.subModules.map((s) => s.id),
      })
    }
  },
  { immediate: true },
)

function togglePermission(permissionId: number, checked: boolean | null) {
  form.value.permissionIds = checked
    ? [...form.value.permissionIds, permissionId]
    : form.value.permissionIds.filter((id) => id !== permissionId)
}

function goToList() {
  router.push({ name: ROUTE.ROLE_LIST })
}

function validate(): boolean {
  const errors: Record<string, string> = {}
  const nameError = firstError(form.value.name, roleNameRules)
  if (nameError) errors.name = nameError
  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function saveRole(value: RoleForm): Promise<void> {
  if (value.id) {
    await updateRoleAction(value)
  } else {
    await createRoleAction(value)
  }
}

const saveMutation = useMutation({
  mutationFn: saveRole,
  onSuccess: (_data, value) => {
    queryClient.invalidateQueries({ queryKey: ['roles'] })
    toastSaved(value.id, messages.role)
    goToList()
  },
  onError: (error: unknown) => {
    const { fieldErrors: backendFields } = normalizeError(error)
    fieldErrors.value = backendFields ?? {}
    backendErrorFields.value = Object.keys(fieldErrors.value).length ? null : backendFields
    toastFailed(messages.role)
  },
})

function submit() {
  if (!validate()) return
  saveMutation.mutate(form.value)
}
</script>

<template>
  <h1 class="text-h4 font-weight-bold mb-4">
    {{ isEditing ? 'Editar rol' : 'Nuevo rol' }}
  </h1>

  <AlertComponent
    :type="hasValidationError ? 'error' : 'info'"
    :message="alert.message"
    :icon="mdiArrowDownCircleOutline"
  />

  <ErrorComponent :error-fields="backendErrorFields" />

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-2 mb-4">Datos principales</h2>

  <v-row>
    <v-col cols="12" md="6">
      <v-text-field
        v-model="form.name"
        label="Nombre"
        placeholder="Ingresa nombre del rol"
        variant="outlined"
        density="comfortable"
        :error="!!fieldErrors.name"
        maxlength="120"
        counter
        hide-details="auto"
        persistent-placeholder
        autofocus
      />
      <FieldErrorComponent :message="fieldErrors.name" />
    </v-col>

    <v-col cols="12" md="6">
      <v-text-field
        v-model="form.description"
        label="Descripción (opcional)"
        placeholder="Ingresa una descripción"
        variant="outlined"
        density="comfortable"
        maxlength="255"
        counter
        hide-details
        persistent-placeholder
      />
    </v-col>

    <v-col cols="12">
      <v-select
        v-model="form.subModuleIds"
        :items="subModuleOptions"
        :item-title="(item) => item.alias || item.name"
        item-value="id"
        label="Submódulos con acceso"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        persistent-placeholder
        multiple
        chips
        closable-chips
        hide-details
      />
    </v-col>
  </v-row>

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-6 mb-2">Permisos</h2>
  <p class="text-body-2 text-medium-emphasis mb-4">
    Selecciona las acciones permitidas para este rol en cada módulo.
  </p>

  <v-row>
    <v-col v-for="group in permissionGroups" :key="group.subModule.id" cols="12" md="6">
      <v-card flat border class="pa-3">
        <div class="text-subtitle-2 font-weight-bold mb-2">
          {{ group.subModule.alias || group.subModule.name }}
        </div>
        <v-checkbox
          v-for="permission in group.permissions"
          :key="permission.id"
          :model-value="form.permissionIds.includes(permission.id)"
          :label="permission.alias || permission.name"
          density="compact"
          hide-details
          @update:model-value="togglePermission(permission.id, $event)"
        />
      </v-card>
    </v-col>
  </v-row>

  <div class="d-flex justify-end ga-2 mt-6">
    <v-btn variant="text" @click="goToList">Cancelar</v-btn>
    <v-btn
      color="primary"
      variant="flat"
      :prepend-icon="mdiContentSave"
      :loading="saveMutation.isPending.value"
      @click="submit"
    >
      Guardar
    </v-btn>
  </div>
</template>
