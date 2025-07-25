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

const pageData = usePageData<ExtendedPageData>();

console.log(pageData.value.versions)
const route = useRoute()

/**
 * Find which version of documentation the user is currently viewing based on the URL path
 */
const versionInfo = computed(() => {
  const pathSegments = route.path.split('/').filter(segment => segment !== '')

  if (pathSegments.length < 2)
    return null

  if (!pageData.value.versions?.all)
    return null

  for (const versionInfo of pageData.value.versions.all) {
    const basePath = versionInfo.basePath
    
    if (route.path.startsWith(`/${basePath}/`) && versionInfo.versions) {
      for (const versionDetail of versionInfo.versions) {
        const versionPath = versionDetail.path
        const fullVersionPath = `/${basePath}/${versionPath}/`
        
        if (route.path.startsWith(fullVersionPath)) {
          return {
            versions: versionInfo.versions,
            current: versionDetail
          }
        }
      }
    }
  }

  console.log("No matching version found")
  return null
})
</script>

<template>
  <Layout>
    <template v-if="versionInfo" #sidebarTop>
      <VersionDropdown :versions="versionInfo.versions" :current="versionInfo.current" />
    </template>
  </Layout>
</template>
