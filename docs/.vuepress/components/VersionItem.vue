<script setup lang="ts">
import type {VersionDetail} from "../lib/versioning";
import VersionText from "./VersionText.vue";

interface Props {
  version: VersionDetail;
  latest: string;
  isSelected: boolean;
  isDeprecated?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'select', version: VersionDetail): void;
}>();

const handleSelect = () => {
  emit('select', props.version);
};
</script>

<template>
  <button
    type="button"
    class="dropdown-item"
    :class="{'active': isSelected, 'deprecated': isDeprecated}"
    role="option"
    :aria-selected="isSelected"
    @click="handleSelect"
  >
    <svg
      class="check-icon"
      :class="{'visible': isSelected}"
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
    <VersionText class="version-text" :version="version" :latest="latest"/>
  </button>
</template>

<style scoped>
.check-icon {
  width: 16px;
  height: 16px;
  margin-right: 0.5rem;
  opacity: 0;
  flex-shrink: 0;
  transition: opacity 0.2s ease;
}

.check-icon.visible {
  opacity: 1;
}

.version-text {
  flex: 1;
}
</style>
