<script setup lang="ts">
import type {VersionDetail} from "../lib/versioning";
import VersionItem from "./VersionItem.vue";

interface Props {
  versions: VersionDetail[];
  title: string;
  latest: string;
  isDeprecated?: boolean;
  marginTop?: string;
  isSelected: (version: VersionDetail) => boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'select', version: VersionDetail): void;
}>();

const handleVersionSelect = (version: VersionDetail): void => {
  emit('select', version);
};
</script>

<template>
  <template v-if="versions.length > 0">
    <div class="dropdown-separator" :style="marginTop ? { marginTop } : {}">{{ title }}</div>
    <VersionItem
        v-for="v in versions"
        :key="v.version"
        :version="v"
        :latest="latest"
        :is-selected="isSelected(v)"
        :is-deprecated="isDeprecated"
        @select="handleVersionSelect"
    />
  </template>
</template>

<style lang="scss" scoped>
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
}
</style>
