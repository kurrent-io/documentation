<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Client {
  id: string
  name: string
  icon: string
  path: string
}

const router = useRouter()

const clients: Client[] = [
  {
    id: 'dotnet-client',
    name: '.NET',
    icon: 'dotnet',
    path: '/clients/dotnet/latest'
  },
  {
    id: 'java-client',
    name: 'Java',
    icon: 'java',
    path: '/clients/java/latest'
  },
  {
    id: 'node-client',
    name: 'Node.js',
    icon: 'nodejs',
    path: '/clients/node/latest'
  },
  {
    id: 'python-client',
    name: 'Python',
    icon: 'python',
    path: '/clients/python/latest'
  },
  {
    id: 'golang-client',
    name: 'Go',
    icon: 'go',
    path: '/clients/golang/latest'
  },
  {
    id: 'rust-client',
    name: 'Rust',
    icon: 'rust',
    path: '/clients/rust/latest'
  }
]

const navigate = (client: Client): void => {
  router.push(client.path)
}
</script>

<template>
  <div class="clients-grid">
    <div class="grid">
      <div
        v-for="client in clients"
        :key="client.id"
        class="client-card"
        @click="navigate(client)"
      >
        <div class="client-icon">
          <img 
            :src="`https://skillicons.dev/icons?i=${client.icon}`" 
            :alt="client.name"
            class="skill-icon"
          />
        </div>
        <p>{{ client.name }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.clients-grid {
  padding: 2rem 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
}

.client-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  p {
    margin: 0;
    color: var(--vp-c-text-2);
    font-size: 0.95rem;
    line-height: 1.5;
    text-align: center;
  }
}

.client-icon {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.skill-icon {
  width: 48px;
  height: 48px;
  pointer-events: none;
}

.dark .client-card {
  background: var(--vp-c-bg-alt);
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    padding: 0 0.5rem;
  }
  
  .client-card {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
