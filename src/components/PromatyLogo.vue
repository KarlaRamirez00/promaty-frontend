<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = withDefaults(defineProps<{
  iconOnly?: boolean
}>(), {
  iconOnly: false,
})

const peaksRef = ref<SVGSVGElement | null>(null)
const proRef = ref<HTMLSpanElement | null>(null)
const matyRef = ref<HTMLSpanElement | null>(null)

function matchWidth() {
  if (props.iconOnly || !peaksRef.value || !proRef.value || !matyRef.value) return
  peaksRef.value.style.marginLeft = `${proRef.value.offsetWidth - 1}px`
  peaksRef.value.style.width = `${matyRef.value.offsetWidth}px`
}

onMounted(() => {
  matchWidth()
  window.addEventListener('resize', matchWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', matchWidth)
})
</script>

<template>
  <div class="promaty-logo" :class="{ 'icon-only': iconOnly }">
    <svg
      v-if="iconOnly"
      class="peaks"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Promaty"
    >
      <path d="M0,66 L50,34 L100,66 Z" fill="#DC2626" />
    </svg>
    <svg
      v-else
      ref="peaksRef"
      class="peaks"
      viewBox="0 0 373 83"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Promaty"
    >
      <path d="M112,83 L242.5,0 L373,83 Z" fill="#DC2626" />
      <path d="M0,83 L130,18 L260,83 Z" class="peaks-secondary" />
    </svg>

    <div v-if="!iconOnly" class="word">
      <span ref="proRef" class="pro">PRO</span><span ref="matyRef" class="maty">MATY</span>
    </div>
  </div>
</template>

<style scoped>
.promaty-logo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.promaty-logo.icon-only {
  display: block;
}

.peaks {
  width: 100px;
  height: auto;
  display: block;
}

.icon-only .peaks {
  width: 1.5rem;
  height: 1.5rem;
}

.peaks-secondary {
  fill: #393d42;
}

.v-theme--dark .peaks-secondary {
  fill: #9CA3AF;
}

.word {
  margin-top: 3px;
  font-family: 'Arial Black', Arial, sans-serif;
  font-weight: 900;
  font-size: 28px;
  letter-spacing: 1px;
  color: #393d42;
  line-height: 1;
}

.v-theme--dark .word {
  color: #9CA3AF;
}

.word .pro {
  color: #DC2626;
}
</style>
