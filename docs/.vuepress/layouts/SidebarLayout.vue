<script setup lang="ts">
import { computed } from 'vue'
import { usePageData, useRoute } from 'vuepress/client'
import { Layout } from 'vuepress-theme-hope/client'
import VersionDropdown from '../components/VersionDropdown.vue'
import type { VersionDetail } from '../lib/versioning'

interface ExtendedPageData extends Record<string, unknown> {
  versions?: {
    all: {
      id: string
      basePath: string
      versions: VersionDetail[]
    }[]
  }
}

const pageData = usePageData<ExtendedPageData>()
const route = useRoute()

const version = computed(() => {
  const pathSegments = route.path.split('/').filter(segment => segment !== '')

  if (pathSegments.length < 2)
    return null

  const [basePath, versionPath] = pathSegments
  const versionSegment = versionPath?.startsWith('v') ? versionPath : null

  if (!versionSegment || !pageData.value.versions?.all)
    return null

  const versionInfo = pageData.value.versions.all.find(info => info.basePath === basePath && info.versions?.some(v => v.path === versionSegment))

  if (!versionInfo?.versions)
    return null

  return {
    version: versionInfo.versions,
    current: versionSegment
  }
})
</script>

<template>
  <Layout>
    <template v-if="version" #sidebarTop>
      <VersionDropdown :version="version.version" :current="version.current" />
    </template>
  </Layout>
</template>