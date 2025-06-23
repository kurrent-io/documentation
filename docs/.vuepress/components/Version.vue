<template>
  <h4 class="version">{{ version ?? "unknown" }}</h4>
  <hr/>
</template>

<script setup lang="ts">
import {useClientData} from 'vuepress/client'
import {useThemeData} from "@vuepress/plugin-theme-data/client";
import {useSidebarItems} from "vuepress-theme-hope/composables/sidebar/useSidebarItems";
import {computed} from "vue";
import {useData} from "vuepress-theme-hope/composables/useData";

declare const __VERSIONS__: { latest: string, selected: string, all: string[] }

const {pageData} = useClientData();
// console.log(pageData);
const themeData = useThemeData();

const sidebar = useSidebarItems().value;

const versionInfos = computed(() => {
});

const d = useData();
console.log(__VERSIONS__)

const version = "25.0";
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