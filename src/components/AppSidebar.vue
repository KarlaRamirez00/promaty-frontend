<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebarRail } from '@/composables/useSidebarRail'
import { usePermissions } from '@/composables/usePermissions'
import { mainMenu, adminMenu, type MenuItem } from '@/data/menu'
import PromatyLogo from '@/components/PromatyLogo.vue'

const { rail, open, mobile } = useSidebarRail()
const route = useRoute()
const { hasModulePermission } = usePermissions()

const isRail = computed(() => !mobile.value && rail.value)

const opened = ref(['RRHH', 'Mantenedores'])

// Un ítem sin module/permission siempre se muestra (grupos contenedores, o módulos aún sin RBAC
// real como Solicitudes) — ver data/menu/menu.types.ts.
function isVisible(item: MenuItem): boolean {
  if (!item.module || !item.permission) return true
  return hasModulePermission(item.module, item.permission)
}

function visibleSubmenu(item: MenuItem): MenuItem[] {
  return (item.submenu ?? []).filter(isVisible)
}

const visibleMainMenu = computed(() => mainMenu.filter(isVisible))
const visibleAdminMenu = computed(() => adminMenu.filter(isVisible))

function isActive(item: MenuItem) {
  return !!item.to && route.path === item.to
}

function expandFromRail() {
  rail.value = false
}

function selectItem() {
  if (mobile.value) open.value = false
}
</script>

<template>
  <v-navigation-drawer
    v-model="open"
    :rail="!mobile && rail"
    :permanent="!mobile"
    :temporary="mobile"
    width="260"
    rail-width="72"
  >
    <div class="d-flex align-center py-4" :class="isRail ? 'justify-center' : 'px-4'">
      <PromatyLogo :icon-only="isRail" />
    </div>

    <v-list v-if="isRail" density="compact" nav>
      <template v-for="item in visibleMainMenu" :key="item.title">
        <v-menu v-if="item.submenu" open-on-hover :open-on-click="false" location="end">
          <template #activator="{ props }">
            <v-list-item v-bind="props" :prepend-icon="item.icon" @click="expandFromRail" />
          </template>

          <v-list density="compact" nav min-width="220">
            <v-list-item
              v-for="sub in visibleSubmenu(item)"
              :key="sub.title"
              :to="sub.to"
              :prepend-icon="sub.icon"
              :title="sub.title"
              :active="isActive(sub)"
              :color="isActive(sub) ? 'primary' : undefined"
              @click="selectItem"
            />
          </v-list>
        </v-menu>

        <v-list-item
          v-else
          :to="item.to"
          :prepend-icon="item.icon"
          :active="isActive(item)"
          :color="isActive(item) ? 'primary' : undefined"
          @click="selectItem"
        />
      </template>

      <template v-for="item in visibleAdminMenu" :key="item.title">
        <v-menu v-if="item.submenu" open-on-hover :open-on-click="false" location="end">
          <template #activator="{ props }">
            <v-list-item v-bind="props" :prepend-icon="item.icon" @click="expandFromRail" />
          </template>

          <v-list density="compact" nav min-width="220">
            <v-list-item
              v-for="sub in visibleSubmenu(item)"
              :key="sub.title"
              :to="sub.to"
              :prepend-icon="sub.icon"
              :title="sub.title"
              :active="isActive(sub)"
              :color="isActive(sub) ? 'primary' : undefined"
              @click="selectItem"
            />
          </v-list>
        </v-menu>

        <v-list-item
          v-else
          :to="item.to"
          :prepend-icon="item.icon"
          :active="isActive(item)"
          :color="isActive(item) ? 'primary' : undefined"
          @click="selectItem"
        />
      </template>
    </v-list>

    <v-list v-else v-model:opened="opened" density="compact" nav>
      <template v-for="item in visibleMainMenu" :key="item.title">
        <v-list-group v-if="item.submenu" :value="item.title">
          <template #activator="{ props }">
            <v-list-item v-bind="props" :prepend-icon="item.icon" :title="item.title" />
          </template>

          <v-list-item
            v-for="sub in visibleSubmenu(item)"
            :key="sub.title"
            :to="sub.to"
            :prepend-icon="sub.icon"
            :title="sub.title"
            :active="isActive(sub)"
            :variant="isActive(sub) ? 'flat' : 'text'"
            :color="isActive(sub) ? 'primary' : undefined"
            @click="selectItem"
          />
        </v-list-group>

        <v-list-item
          v-else
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :active="isActive(item)"
          :variant="isActive(item) ? 'flat' : 'text'"
          :color="isActive(item) ? 'primary' : undefined"
          @click="selectItem"
        />
      </template>

      <template v-for="item in visibleAdminMenu" :key="item.title">
        <v-list-group v-if="item.submenu" :value="item.title">
          <template #activator="{ props }">
            <v-list-item v-bind="props" :prepend-icon="item.icon" :title="item.title" />
          </template>

          <v-list-item
            v-for="sub in visibleSubmenu(item)"
            :key="sub.title"
            :to="sub.to"
            :prepend-icon="sub.icon"
            :title="sub.title"
            :active="isActive(sub)"
            :variant="isActive(sub) ? 'flat' : 'text'"
            :color="isActive(sub) ? 'primary' : undefined"
            @click="selectItem"
          />
        </v-list-group>

        <v-list-item
          v-else
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :active="isActive(item)"
          :variant="isActive(item) ? 'flat' : 'text'"
          :color="isActive(item) ? 'primary' : undefined"
          @click="selectItem"
        />
      </template>
    </v-list>
  </v-navigation-drawer>
</template>
