<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  mdiAccountGroupOutline,
  mdiCalendarEdit,
  mdiCalendarPlus,
  mdiCancel,
  mdiCheckCircle,
  mdiLayersOutline,
  mdiMagnify,
  mdiShieldKeyOutline,
} from '@mdi/js'
import { useRolePermissions } from '@/composables/useRolePermissions'
import type { Role, RolePermissionOption } from '@/models'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const props = withDefaults(
  defineProps<{
    role: Role | null
    permissionCatalog?: RolePermissionOption[]
    loading?: boolean
    hasUpdatePermission?: boolean
    hasActivePermission?: boolean
  }>(),
  {
    permissionCatalog: () => [],
    hasUpdatePermission: true,
    hasActivePermission: true,
  },
)

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  edit: [role: Role]
  toggleActive: [role: Role]
}>()

const catalog = computed(() => props.permissionCatalog)
const selectedPermissionIds = ref<number[]>([])
watch(
  () => props.role,
  (role) => {
    selectedPermissionIds.value = role?.permissions.map((permission) => permission.id) ?? []
  },
  { immediate: true },
)

const openSubModuleId = ref<number>()

const {
  subModuleSearch,
  sections,
  totalAvailable,
  totalSelected,
  isSelected,
  selectedCount,
} = useRolePermissions(catalog, selectedPermissionIds)

const tiles = computed(() => {
  const r = props.role
  if (!r) return []
  return [
    { key: 'createdAt', icon: mdiCalendarPlus, color: 'success', label: 'Creado', value: r.createdAt, caption: `Por ${r.createdBy}` },
    { key: 'updatedAt', icon: mdiCalendarEdit, color: 'info', label: 'Actualizado', value: r.updatedAt, caption: `Por ${r.updatedBy}` },
    { key: 'totalUsers', icon: mdiAccountGroupOutline, color: 'info', label: 'Usuarios', value: String(r.totalUsers) },
    { key: 'subModules', icon: mdiLayersOutline, color: 'primary', label: 'Submódulos', value: String(r.subModules.length) },
  ]
})
</script>

<template>
  <DetailDrawer v-model:open="open" entity="rol" width="clamp(380px, 45vw, 560px)">
    <template #badge>
      <v-chip v-if="role" size="small" variant="tonal" :color="role.status.color" class="mt-1">
        {{ role.status.label }}
      </v-chip>
    </template>

    <template v-if="role" #menu>
      <ActionsMenu
        :record="role"
        :has-update-permission="hasUpdatePermission"
        :has-active-permission="hasActivePermission"
        :show-view="false"
        @edit="emit('edit', role)"
        @toggle="emit('toggleActive', role)"
      />
    </template>

    <div v-if="loading && !role" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="role" class="pa-2">
      <div class="d-flex align-center ga-2 mb-2">
        <v-icon :icon="mdiShieldKeyOutline" color="primary" size="28" />
        <span class="text-h6 font-weight-bold">{{ role.name }}</span>
      </div>

      <div class="role-detail-description d-flex justify-space-between ga-4 text-body-2 pb-3 mb-4">
        <span class="text-medium-emphasis">Descripción</span>
        <span class="text-right">{{ role.description ?? 'Sin descripción' }}</span>
      </div>

      <v-row dense>
        <v-col v-for="tile in tiles" :key="tile.key" cols="6">
          <v-sheet border rounded class="px-3 py-2 h-100">
            <div class="d-flex align-center ga-2 text-body-2 text-medium-emphasis">
              <v-icon :icon="tile.icon" :color="tile.color" size="20" />
              {{ tile.label }}
            </div>
            <div class="text-subtitle-2 font-weight-bold mt-1">{{ tile.value }}</div>
            <div v-if="tile.caption" class="text-caption text-medium-emphasis">{{ tile.caption }}</div>
          </v-sheet>
        </v-col>
      </v-row>

      <div class="d-flex align-start justify-space-between ga-4 mt-6 mb-3">
        <div>
          <h3 class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold">
            <v-icon :icon="mdiShieldKeyOutline" size="20" />
            Permisos
          </h3>
          <p class="text-body-2 text-medium-emphasis mt-1">
            Revisa los <strong>permisos activados</strong> en cada submódulo.
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
        class="mb-4"
      />

      <section v-for="section in sections" :key="section.title" class="mb-4">
        <h4 class="d-flex align-center ga-2 text-subtitle-2 font-weight-bold mb-2">
          <v-icon :icon="section.icon" size="20" />
          {{ section.title }}
        </h4>

        <v-sheet
          v-for="permission in section.scopePermissions"
          :key="permission.id"
          border
          rounded
          class="border-warning role-detail-row px-4 py-3 mb-3"
        >
          <span :class="{ 'text-medium-emphasis': !isSelected(permission) }">
            {{ permission.alias || permission.name }}
          </span>
          <v-icon
            :icon="isSelected(permission) ? mdiCheckCircle : mdiCancel"
            :color="isSelected(permission) ? 'success' : 'error'"
            size="20"
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
              <div v-for="permission in group.permissions" :key="permission.id" class="role-detail-row">
                <span class="text-body-2" :class="{ 'text-medium-emphasis': !isSelected(permission) }">
                  {{ permission.alias || permission.name }}
                </span>
                <v-icon
                  :icon="isSelected(permission) ? mdiCheckCircle : mdiCancel"
                  :color="isSelected(permission) ? 'success' : 'error'"
                  size="20"
                />
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </section>

      <p v-if="!sections.length" class="text-body-2 text-medium-emphasis">
        No hay submódulos que coincidan con la búsqueda.
      </p>
    </div>
  </DetailDrawer>
</template>

<style scoped>
.role-detail-description {
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.role-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
}

.role-detail-row + .role-detail-row {
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
