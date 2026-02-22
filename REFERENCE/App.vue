<script setup lang="ts">
import { ref } from 'vue'
import { Toaster, toast } from 'vue-sonner'
import 'vue-sonner/style.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { fetchSystemMapData, type SystemMapData } from '@/lib/api'
import { createDefaultQuest } from '@/lib/quest'
import type { Quest } from '@/lib/types'
import QuestEditor from '@/components/QuestEditor.vue'
import JsonDialog from '@/components/JsonDialog.vue'

const systemMapApiBaseUrl = ref('https://letsplay.minecrafttransitrailway.com/system-map')

const systemMapData = ref<SystemMapData | null>(null)
const isLoading = ref(false)
const apiError = ref<string | null>(null)

const activeQuest = ref<Quest | null>(null)

const isImportDialogOpen = ref(false)
const isExportDialogOpen = ref(false)
const exportMode = ref<'exportJson' | 'exportCommand'>('exportJson')
const jsonText = ref('')
const authToken = ref('')

async function handleFetchData() {
  isLoading.value = true
  apiError.value = null
  try {
    const data = await fetchSystemMapData(systemMapApiBaseUrl.value)
    systemMapData.value = data
    toast.success('System Map Data Fetched', {
      description: `Loaded ${data.stationNames.length} stations and ${data.routeNames.length} routes.`,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.'
    apiError.value = errorMessage
    toast.error('Failed to Fetch Data', {
      description: errorMessage,
    })
  } finally {
    isLoading.value = false
  }
}

function handleNewQuest() {
  activeQuest.value = createDefaultQuest()
}

function handleOpenImport() {
  jsonText.value = ''
  isImportDialogOpen.value = true
}

function handleConfirmImport() {
  try {
    const parsed = JSON.parse(jsonText.value)
    // TODO: Add schema validation
    activeQuest.value = parsed
    isImportDialogOpen.value = false
    toast.success('Quest Imported Successfully')
  } catch (error) {
    toast.error('Invalid JSON Format', {
      description: 'Please check the console for more details.',
    })
    console.error(error)
  }
}

function handleOpenExport(mode: 'exportJson' | 'exportCommand') {
  if (!activeQuest.value) {
    toast.warning('No Active Quest', {
      description: 'There is no active quest to export.',
    })
    return
  }
  if (mode === 'exportCommand' && !authToken.value) {
    toast.warning('No Signature Token', {
      description: 'Please enter a signature token to export the quest as a command.',
    })
    return
  }
  jsonText.value = JSON.stringify(activeQuest.value, null)
  exportMode.value = mode
  if (mode === 'exportCommand') {
    jsonText.value = `/nquest quests set ${authToken.value} ${jsonText.value}`
  }
  isExportDialogOpen.value = true
}
</script>

<template>
  <Toaster />
  <div class="container 2xl:max-w-[80rem] mx-auto flex h-screen bg-background text-foreground">
    <!-- Sidebar -->
    <aside class="w-80 border-r p-4 flex flex-col space-y-4">
      <h1 class="text-2xl font-bold">NQuest Editor</h1>
      
      <Separator />

      <div>
        <h2 class="text-lg font-semibold mb-2">Data Management</h2>
        <div class="grid grid-cols-1 gap-2">
          <Button variant="outline" @click="handleNewQuest">New Quest</Button>
          <Button variant="outline" @click="handleOpenImport">Import from JSON</Button>
          <Button variant="outline" @click="handleOpenExport('exportJson')">Export to JSON</Button>
        </div>
        <Separator class="my-4" />
        <div class="space-y-2">
          <Input id="auth-token" v-model="authToken" placeholder="Enter signature token" />
          <Button class="w-full" variant="outline" @click="handleOpenExport('exportCommand')">Export Command</Button>
        </div>
      </div>
      
      <Separator />

      <div>
        <h2 class="text-lg font-semibold mb-2">System Map API</h2>
        <div class="space-y-2">
          <Input v-model="systemMapApiBaseUrl" placeholder="Enter System Map API Base URL" />
          <Button class="w-full" :disabled="isLoading" @click="handleFetchData">
            {{ isLoading ? 'Fetching...' : 'Fetch Station & Route Data' }}
          </Button>
          <p v-if="apiError" class="text-sm text-destructive">{{ apiError }}</p>
          <div v-else-if="systemMapData" class="text-sm text-muted-foreground">
            <p>Loaded {{ systemMapData.stationNames.length }} stations.</p>
            <p>Loaded {{ systemMapData.routeNames.length }} routes.</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-4 overflow-auto">
      <QuestEditor
        v-model="activeQuest"
        :system-map-data="systemMapData"
      />
    </main>

    <JsonDialog
      v-model="jsonText"
      v-model:open="isImportDialogOpen"
      mode="import"
      @confirm="handleConfirmImport"
    />
    <JsonDialog
      v-model="jsonText"
      v-model:open="isExportDialogOpen"
      :mode="exportMode"
    />
  </div>
</template>
