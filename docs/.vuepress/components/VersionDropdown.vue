<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vuepress/client'
import type { VersionDetail } from '../lib/versioning'

interface Props {
  versions: VersionDetail[]
  current: string
}

const props = defineProps<Props>()

const router = useRouter()
const route = useRoute()
const selectedVersion = ref(props.current)
const isOpen = ref(false)

const latestVersion = computed(() => props.versions[0]?.version)
const currentVersions = computed(() => props.versions.filter(v => !v.deprecated))
const deprecatedVersions = computed(() => props.versions.filter(v => v.deprecated))

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
  const versionDetails = props.versions.find(v => v.version === version)

  if (versionDetails) {
    const base = route.path.split('/').filter(seg => seg)[0]
    router.replace(`/${base}/${versionDetails.path}/${versionDetails.startPage}`)
  }

  closeDropdown()
}

const handleClickOutside = (event: Event): void => {
  const target = event.target as HTMLElement
  const dropdown = document.querySelector('.version-dropdown')
  
  if (dropdown && !dropdown.contains(target))
    closeDropdown()
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
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
      <span class="selected-version">
        {{ selectedVersion }}
        <span v-if="selectedVersion === latestVersion">(latest)</span>
      </span>
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
      <!-- Current versions -->
      <template v-if="currentVersions.length > 0">
        <div class="dropdown-separator">Current</div>
        <button
          v-for="v in currentVersions"
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
            {{ v.version }}
            <span v-if="v.version === latestVersion"> (latest)</span>
          </span>
        </button>
      </template>

      <!-- Deprecated versions -->
      <template v-if="deprecatedVersions.length > 0">
        <div class="dropdown-separator" style="margin-top: 8px;">Deprecated</div>
        <button
          v-for="v in deprecatedVersions"
          :key="v.version"
          type="button"
          class="dropdown-item deprecated"
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
            {{ v.version }}
            <span v-if="v.version === latestVersion"> (latest)</span>
          </span>
        </button>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.version-dropdown {
  position: relative;
  margin: 1rem 0.5rem 0;

  .version-trigger {
    width: 100%;
    padding: 0.5rem 1rem;
    border: 1px solid var(--vp-c-border);
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
    transition: all 0.2s ease;

    &:hover,
    &:focus {
      outline: 2px solid rgba(78, 87, 90, 0.2);
      outline-offset: 1px;
    }

    &:focus {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .selected-version {
      flex: 1;
    }

    .dropdown-arrow {
      flex-shrink: 0;
      margin-left: 0.5rem;
      transition: transform 0.2s ease;

      &.rotate-180 {
        transform: rotate(180deg);
      }
    }
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 50;
    margin-top: 0.3rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 0.5rem;
    box-shadow: 
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    max-height: 250px;
    overflow-y: auto;
    background-color: var(--vp-c-bg-elv);

    // Webkit scrollbar styles
    &::-webkit-scrollbar {
      width: 8px;
      background-color: var(--vp-c-bg-elv);
    }

    &::-webkit-scrollbar-track {
      background-color: var(--vp-c-bg-elv);
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.4);
      border-radius: 4px;
    }

    // Firefox scrollbar
    scrollbar-width: thin;
    scrollbar-color: rgb(161, 161, 161) var(--vp-c-bg-elv);

    .dropdown-separator {
      padding: 0.5rem 1rem;
      font-size: 12px;
      font-weight: bold;
      color: var(--vp-c-text-mute);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background-color: var(--vp-c-bg-elv);
    }

    .dropdown-item {
      width: 100%;
      padding: 0.5rem 1rem;
      font-size: 16px;
      font-weight: normal;
      background-color: var(--vp-c-bg-elv);
      border: none;
      cursor: pointer;
      text-align: left;
      display: flex;
      align-items: center;
      transition: all 0.2s ease;

      &:hover {
        background-color: var(--dropdown-item-bg-hover);
      }

      &.active {
        font-weight: bold;
        color: var(--dropdown-item-color);
      }

      &.deprecated .version-text {
        color: var(--dropdown-deprecated-text-color);
      }

      .check-icon {
        width: 16px;
        height: 16px;
        margin-right: 0.5rem;
        opacity: 0;
        flex-shrink: 0;
        transition: opacity 0.2s ease;

        &.visible {
          opacity: 1;
        }
      }

      .version-text {
        flex: 1;
      }
    }
  }
}
</style>