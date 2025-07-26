<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vuepress/client";
import type {VersionDetail} from "../lib/versioning";
import VersionText from "./VersionText.vue";
import VersionSection from "./VersionSection.vue";

interface Props {
  versions: VersionDetail[];
  current: VersionDetail;
}

const props = defineProps<Props>();

const router = useRouter();
const route = useRoute();
const selectedVersion = ref(props.current);
const isOpen = ref(false);

const latestVersion = computed(() => props.versions[0]?.version);
const currentVersions = computed(() => props.versions.filter(v => !v.deprecated && !v.hide));
const deprecatedVersions = computed(() => props.versions.filter(v => v.deprecated && !v.hide));

watch(() => props.current, (newCurrent) => selectedVersion.value = newCurrent);

const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value;
}

const closeDropdown = (): void => {
  isOpen.value = false;
}

const handleVersionSelect = (version: VersionDetail): void => {
  const segments = route.path.split('/').filter(seg => seg);
  const versionIndex = segments.findIndex(seg => seg === props.current.path);
  const base = versionIndex > 0 ? segments.slice(0, versionIndex).join('/') : segments[0] || '';

  router.replace(`/${base}/${version.path}/${version.startPage}`);

  closeDropdown();
}

const handleClickOutside = (event: Event): void => {
  const target = event.target as HTMLElement;
  const dropdown = document.querySelector('.version-dropdown');

  if (dropdown && !dropdown.contains(target)) {
    closeDropdown();
  }
}

const isSelected = (version: VersionDetail): boolean => {
  return version.version === selectedVersion.value.version;
}

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
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
      <VersionText class="selected-version" :version="selectedVersion" :latest="latestVersion"/>
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
      <VersionSection
          :versions="currentVersions"
          title="Current"
          :latest="latestVersion"
          :is-selected="isSelected"
          @select="handleVersionSelect"
      />

      <!-- Deprecated versions -->
      <VersionSection
          :versions="deprecatedVersions"
          title="Deprecated"
          :margin-top="'8px'"
          :latest="latestVersion"
          :is-selected="isSelected"
          :is-deprecated="true"
          @select="handleVersionSelect"
      />
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
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
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

    // Styles for dropdown-separator and dropdown-item are now in VersionSection.vue
  }
}
</style>