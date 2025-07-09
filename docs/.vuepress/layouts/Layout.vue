<script setup lang="ts">
import {computed} from "vue";
import {usePageData} from 'vuepress/client';
import {useRoute} from "vuepress/client";
import {Layout} from "vuepress-theme-hope/client";
import Version from "../components/Version.vue";

const pageData = usePageData();
const route = useRoute();

const version = computed(() => {
  const pathSegments = route.path.split("/");
  const versionSegment = pathSegments.find(segment => segment.startsWith("v"));
  const versionInfo = pageData.value.versions?.all.find(info => {
    return info.basePath === pathSegments[1] && (info.id === pathSegments[2] || pathSegments[2] === versionSegment);
  });
  return versionInfo && {version: versionInfo.versions, current: versionSegment};
});
</script>

<template>
  <Layout>
    <template v-if="version" #sidebarTop>
      <Version :version="version.version" :current="version.current"/>
    </template>
  </Layout>
</template>