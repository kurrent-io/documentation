<template>
  <select>
    <option class="version" :value="v.version" v-for="v in props.version" :key="v.version" :selected="v.version === props.current">
      {{ v.version }}
    </option>
  </select>
  <hr/>
</template>

<script setup lang="ts">
import type {VersionDetail} from "../lib/versioning";

interface Props {
  version: VersionDetail[];
  current: string;
}

const props = defineProps<Props>();
console.log(props.version)
</script>

<style lang="css">
.version {
  margin: 1em 1em 1em 25px;
  padding: 0;
  font-weight: bold;
}

hr {
  margin-bottom: 0;
}
</style>