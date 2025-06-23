<script setup lang="ts">
import { Layout } from "vuepress-theme-hope/client";
import Version from "../components/Version.vue";
</script>

<template>
  <Layout>
    <template #sidebarTop>
      <Version />
    </template>
  </Layout>
</template>