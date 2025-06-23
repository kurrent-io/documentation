<script setup lang="ts">
import type {VersionDetail} from "../lib/versioning";
import {computed} from "vue";

const props = defineProps<{ version: VersionDetail, latest: string, class: string }>();

const text = computed(() => {
  if (props.version.lts) {
    return ` (LTS)`;
  }
  return props.version.version === props.latest ? ' (latest)' : '';
});
</script>

<template>
    <span :class="props.class">
      {{ version.version + text }}
    </span>
</template>