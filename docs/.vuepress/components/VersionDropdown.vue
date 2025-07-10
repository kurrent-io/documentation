<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { useRouter } from 'vuepress/client'
import type { VersionDetail } from '../lib/versioning'

interface Props {
  version: VersionDetail[]
  current: string
}

interface Emits {
  versionChanged: [version: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const router = useRouter()
const selectedVersion = toRef(props, 'current')
const isOpen = ref(false)

const latestVersion = computed(() => props.version[0]?.version)

watch(() => props.current, (newCurrent) => {
  selectedVersion.value = newCurrent
})

const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value
}

const closeDropdown = (): void => {
  isOpen.value = false
}

const handleVersionSelect = (version: string): void => {
  const versionDetails = props.version.find(v => v.version === version)

  if (versionDetails) {
    router.replace(`/server/${versionDetails.path}/${versionDetails.startPage}`)
  }

  emit('versionChanged', version)
  closeDropdown()
}

const handleClickOutside = (event: Event): void => {
  const target = event.target as HTMLElement
  const dropdown = document.querySelector('.version-dropdown')
  
  if (dropdown && !dropdown.contains(target))
    closeDropdown()
}

if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>

<template>
  <div class="version-dropdown">
    <button
      type="button"
      class="version-trigger"
      aria-label="Select documentation version"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="toggleDropdown"
    >
      <span class="selected-version">{{ selectedVersion }} <span v-if="selectedVersion === latestVersion">(latest)</span></span>
      <svg 
        class="dropdown-arrow" 
        :class="{ 'rotate-180': isOpen }"
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M4 6L8 10L12 6" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div 
      v-if="isOpen"
      class="dropdown-menu"
      role="listbox"
      aria-label="Version options"
    >
      <button
        v-for="v in version"
        :key="v.version"
        type="button"
        class="dropdown-item"
        :class="{ 'active': v.version === selectedVersion }"
        role="option"
        :aria-selected="v.version === selectedVersion"
        @click="handleVersionSelect(v.version)"
      >
        <svg 
          class="check-icon"
          :class="{ 'visible': v.version === selectedVersion }"
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M13.5 4.5L6 12L2.5 8.5" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          />
        </svg>
        <span class="version-text">
          {{ v.version }}<span v-if="v.version === latestVersion"> (latest)</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style lang="css" scoped>
.version-dropdown {
  position: relative;
  margin-top: 1rem;
  margin-right: 0.5rem;
  margin-left: 0.5rem;
}

.version-trigger {
  width: 100%;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  border: 1px solid var(--dropdown-trigger-border-color);
  border-radius: 0.375rem;
  background-color: transparent;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}

.version-trigger:hover {
  outline: 2px solid rgba(78, 87, 90, 0.2);
  outline-offset: 1px;
}

.version-trigger:focus {
  outline: 2px solid rgba(78, 87, 90, 0.2);
  outline-offset: 1px;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.selected-version {
  flex: 1;
}

.dropdown-arrow {
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.dropdown-arrow.rotate-180 {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 0.3rem;
  border: none;
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-height: 250px;
  overflow-y: auto;
}

.dropdown-menu::-webkit-scrollbar {
  width: 8px;
  background-color: #202127;
}
.dropdown-menu::-webkit-scrollbar-track {
  background-color: #202127;
}
.dropdown-menu::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 4px;
}
.dropdown-menu {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.4) #202127;
}

.dropdown-item {
  width: 100%;
  padding: 0.5rem;
  font-weight: normal;
  color: var(--dropdown-item-color);
  background-color: var(--dropdown-item-bg);
  border: none;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  padding-left: 1rem;
  padding-right: 1rem;
  font-size: 16px;
}

.dropdown-item:hover {
  background-color: var(--dropdown-item-bg-hover)
}

.dropdown-item.active {
  font-weight: bold;
}

.check-icon {
  width: 16px;
  height: 16px;
  margin-right: 0.5rem;
  opacity: 0;
  flex-shrink: 0;
}

.check-icon.visible {
  opacity: 1;
}

.version-text {
  flex: 1;
}
</style>