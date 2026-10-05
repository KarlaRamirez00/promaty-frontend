<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  mdiArrowDownCircleOutline,
  mdiContentSave,
  mdiLayersOutline,
  mdiMagnify,
  mdiShieldKeyOutline,
} from '@mdi/js'
import {
  createRoleAction,
  getPermissionOptionsAction,
  getRoleDetailAction,
  updateRoleAction,
} from '@/actions'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage } from '@/composables/useMessage'
import { useRolePermissions } from '@/composables/useRolePermissions'
import messages from '@/messages'
import roleMessages from '@/messages/role.messages'
import { ROUTE } from '@/router/route-names'
import { createRoleForm, type RoleForm } from '@/models'
import { firstError, roleNameRules } from '@/rules'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'

const props = defineProps<{
  id?: string
}>()

const router = useRouter()
const queryClient = useQueryClient()
const { toastSaved, toastFailed } = useMessage()
const {
  backendErrorFields,
  setFromError,
  clear: clearBackendErrors,
  hasBackendError,
} = useBackendFieldErrors()

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

const form = ref<RoleForm>(createRoleForm())
const fieldErrors = ref<Record<string, string>>({})

const selectedPermissionIds = computed({
  get: () => form.value.permissionIds,
  set: (value: number[]) => {
    form.value.permissionIds = value
  },
})

const openSubModuleId = ref<number>()

const {
  subModuleSearch,
  sections,
  totalAvailable,
  totalSelected,
  isSelected,
  selectedCount,
  isAllSelected,
  isDisabled,
  toggleAll,
  togglePermission,
  toggleScopePermission,
} = useRolePermissions(permissionOptions, selectedPermissionIds)

function hasError(field: string): boolean {
  return !!fieldErrors.value[field] || hasBackendError(field)
}

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
      })
    }
  },
  { immediate: true },
)

function goToList() {
  router.push({ name: ROUTE.ROLE_LIST })
}

function validate(): boolean {
  const errors: Record<string, string> = {}
  const nameError = firstError(form.value.name, roleNameRules)
  if (nameError) errors.name = nameError
  if (!form.value.permissionIds.length) errors.permissionIds = roleMessages.rules.permissionsRequired
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
    queryClient.invalidateQueries({ queryKey: ['roles'], refetchType: 'none' })
    toastSaved(value.id, messages.role)
    goToList()
  },
  onError: (error: unknown) => {
    if (!setFromError(error)) toastFailed(messages.role)
  },
})

function submit() {
  clearBackendErrors()
  if (!validate()) return
  saveMutation.mutate(form.value)
}
</script>

<template>
  <h1 class="text-h5 font-weight-bold mb-4">
    {{ isEditing ? 'Editar rol' : 'Nuevo rol' }}
  </h1>

  <AlertComponent
    :type="hasValidationError ? 'error' : 'info'"
    :message="alert.message"
    :icon="mdiArrowDownCircleOutline"
  />

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-2 mb-4">Datos principales</h2>

  <v-row>
    <v-col cols="12">
      <v-text-field
        v-model="form.name"
        v-input-mask="'freeText'"
        label="Nombre"
        placeholder="Ingresa nombre del rol"
        variant="outlined"
        density="comfortable"
        :error="hasError('name')"
        maxlength="120"
        counter
        hide-details="auto"
        persistent-placeholder
        autofocus
      />
      <FieldErrorComponent :message="fieldErrors.name" />
    </v-col>

    <v-col cols="12">
      <v-textarea
        v-model="form.description"
        v-input-mask="'freeText'"
        label="Descripción (opcional)"
        placeholder="Ingresa una descripción"
        variant="outlined"
        density="comfortable"
        maxlength="255"
        counter
        rows="2"
        auto-grow
        hide-details
        persistent-placeholder
      />
    </v-col>
  </v-row>

  <div class="d-flex align-start justify-space-between ga-4 mt-6 mb-4">
    <div>
      <h2 class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold text-primary">
        <v-icon :icon="mdiShieldKeyOutline" size="20" />
        Permisos
      </h2>
      <p class="text-body-2 text-medium-emphasis mt-1">
        Revisa los permisos de cada módulo y <strong>asigna permisos al rol</strong> según sea necesario.
      </p>
    </div>
    <span class="text-subtitle-1 text-medium-emphasis flex-shrink-0">
      {{ totalSelected }} / {{ totalAvailable }}
    </span>
  </div>

  <v-text-field
    v-model="subModuleSearch"
    v-input-mask="'freeText'"
    :prepend-inner-icon="mdiMagnify"
    placeholder="Buscar submódulo"
    variant="outlined"
    density="comfortable"
    clearable
    hide-details
    persistent-placeholder
    class="mb-6"
  />

  <section v-for="section in sections" :key="section.title" class="mb-6">
    <h3 class="d-flex align-center ga-2 text-subtitle-2 font-weight-bold mb-3">
      <v-icon :icon="section.icon" size="20" />
      {{ section.title }}
    </h3>

    <v-sheet
      v-for="permission in section.scopePermissions"
      :key="permission.id"
      border
      rounded
      class="border-warning d-flex align-center justify-space-between ga-4 px-4 py-3 mb-3"
    >
      <div>
        <div class="text-subtitle-2 font-weight-bold">{{ permission.alias || permission.name }}</div>
        <div class="text-body-2 text-medium-emphasis">
          {{ permission.description ?? roleMessages.scopePermissionDescription }}
        </div>
      </div>
      <v-switch
        :model-value="isSelected(permission)"
        color="primary"
        density="compact"
        hide-details
        @update:model-value="toggleScopePermission(permission, !!$event)"
      />
    </v-sheet>

    <v-expansion-panels v-model="openSubModuleId">
      <v-expansion-panel
        v-for="group in section.groups"
        :key="group.subModule.id"
        :value="group.subModule.id"
      >
        <v-expansion-panel-title>
          <div class="d-flex align-center justify-space-between flex-grow-1">
            <span class="d-flex align-center ga-3">
              <v-icon
                :icon="mdiLayersOutline"
                :color="selectedCount(group) ? 'primary' : undefined"
                size="20"
              />
              <span class="text-subtitle-2 font-weight-bold">
                {{ group.subModule.alias || group.subModule.name }}
              </span>
            </span>
            <span class="text-body-2 text-medium-emphasis">
              {{ selectedCount(group) }} / {{ group.permissions.length }}
            </span>
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <div class="role-permission-row">
            <div>
              <div class="text-subtitle-2 font-weight-bold text-primary">Todos</div>
              <div class="text-body-2 text-medium-emphasis">
                Selecciona o quita todos los permisos del submódulo
              </div>
            </div>
            <v-switch
              :model-value="isAllSelected(group)"
              color="primary"
              density="compact"
              hide-details
              @update:model-value="toggleAll(group, !!$event)"
            />
          </div>

          <div v-for="permission in group.permissions" :key="permission.id" class="role-permission-row">
            <div :class="{ 'role-permission-row__text--disabled': isDisabled(group, permission) }">
              <div class="text-subtitle-2 font-weight-bold">{{ permission.alias || permission.name }}</div>
              <div v-if="permission.description" class="text-body-2 text-medium-emphasis">
                {{ permission.description }}
              </div>
            </div>
            <v-switch
              :model-value="isSelected(permission)"
              :disabled="isDisabled(group, permission)"
              color="primary"
              density="compact"
              hide-details
              @update:model-value="togglePermission(group, permission, !!$event)"
            />
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </section>

  <p v-if="!sections.length" class="text-body-2 text-medium-emphasis">
    No hay submódulos que coincidan con la búsqueda.
  </p>
  <FieldErrorComponent :message="fieldErrors.permissionIds" />

  <ErrorComponent :error-fields="backendErrorFields" class="mt-6" />

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

<style scoped>
.role-permission-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
}

.role-permission-row + .role-permission-row {
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.role-permission-row__text--disabled {
  opacity: 0.5;
}
</style>
