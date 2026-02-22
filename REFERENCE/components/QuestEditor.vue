<script setup lang="ts">
import { computed } from 'vue'
import type { Quest } from '@/lib/types'
import type { SystemMapData } from '@/lib/api'
import { createDefaultStep } from '@/lib/quest'
import StepEditor from './StepEditor.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CriterionEditor from './CriterionEditor.vue'
import { createDefaultCriterion } from '@/lib/quest'

const props = defineProps<{
  modelValue: Quest | null,
  systemMapData: SystemMapData | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Quest | null): void
}>()

const quest = computed({
  get: () => props.modelValue,
  set: (newValue) => {
    emit('update:modelValue', newValue)
  },
})

function addStep() {
  if (quest.value) {
    quest.value.steps.push(createDefaultStep())
  }
}

function deleteStep(index: number) {
  if (quest.value) {
    quest.value.steps.splice(index, 1)
  }
}
</script>

<template>
  <div v-if="quest" class="space-y-6">
    <div class="space-y-4 p-4 border rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="space-y-2">
          <Label for="quest-id">Quest ID</Label>
          <Input id="quest-id" v-model="quest.id" placeholder="e.g., great-adventure" />
        </div>
        <div class="space-y-2">
          <Label for="quest-name">Quest Name</Label>
          <Input id="quest-name" v-model="quest.name" placeholder="e.g., The Great MTR Adventure" />
        </div>
        <div class="space-y-2">
          <Label for="quest-points">Quest Points</Label>
          <Input id="quest-points" v-model.number="quest.questPoints" type="number" />
        </div>
        <div class="space-y-2">
          <Label for="quest-category">Category</Label>
          <Input id="quest-category" v-model="quest.category" placeholder="See wiki" />
        </div>
        <div class="space-y-2">
          <Label for="quest-tier">Tier</Label>
          <Input id="quest-tier" v-model="quest.tier" placeholder="See wiki" />
        </div>
        <div class="space-y-2 md:col-span-3">
          <Label for="quest-description">Description</Label>
          <Textarea id="quest-description" v-model="quest.description" placeholder="Enter quest description." />
        </div>
      </div>
    </div>

    <div>
      <div v-if="quest.defaultCriteria" class="space-y-4">
        <Label>Quest-Wide Failure Condition</Label>
        <CriterionEditor
          v-model="quest.defaultCriteria.failureCriteria"
          :system-map-data="systemMapData"
          :is-root="false"
          @delete="quest.defaultCriteria = undefined"
        />
      </div>
      <Button v-else variant="outline" @click="quest.defaultCriteria = { failureCriteria: createDefaultCriterion('TeleportDetectCriterion') }">
        Add Quest-Wide Failure Condition
      </Button>
    </div>

    <div class="space-y-4">
      <h2 class="text-xl font-bold">Quest Steps</h2>
      <div class="space-y-4">
        <StepEditor
          v-for="(_, index) in quest.steps"
          :key="index"
          v-model="quest.steps[index]"
          :system-map-data="systemMapData"
          @delete="deleteStep(index)"
        />
      </div>
      <Button variant="default" @click="addStep">Add Step</Button>
    </div>
  </div>
  <div v-else class="w-full h-full border-2 border-dashed border-border rounded-lg flex items-center justify-center">
    <p class="text-muted-foreground">
      No quest loaded. Create a new quest or import one from JSON.
    </p>
  </div>
</template>
