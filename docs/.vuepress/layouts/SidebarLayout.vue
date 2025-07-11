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

/**
 * Find which version of documentation the user is currently viewing based on the URL path
 */
const versionInfo = computed(() => {
  const pathSegments = route.path.split('/').filter(segment => segment !== '')

  if (pathSegments.length < 2)
    return null

  const basePath = pathSegments[0]

  if (!pageData.value.versions?.all)
    return null

  for (const versionInfo of pageData.value.versions.all) {
    if (versionInfo.basePath === basePath && versionInfo.versions) {
      for (const versionDetail of versionInfo.versions) {
        const versionPath = versionDetail.path
        if (route.path.includes(`/${basePath}/${versionPath}/`)) {
          return {
            versions: versionInfo.versions,
            current: versionDetail.version
          }
        }
      }
    }
  }

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