<script setup lang="ts">
import { computed } from 'vue'
import type { Step } from '@/lib/types'
import type { SystemMapData } from '@/lib/api'
import CriterionEditor from './CriterionEditor.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { createDefaultCriterion } from '@/lib/quest'

const props = defineProps<{
  modelValue: Step
  systemMapData: SystemMapData | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Step): void
  (e: 'delete'): void
}>()

const step = computed({
  get: () => props.modelValue,
  set: (newValue) => {
    emit('update:modelValue', newValue)
  },
})

function addFailureCriterion() {
  step.value.failureCriteria = createDefaultCriterion('InBoundsCriterion')
}

function deleteFailureCriterion() {
  step.value.failureCriteria = undefined
}
</script>

<template>
  <Card class="relative">
    <CardContent class="space-y-4">
      <div class="space-y-4">
        <CriterionEditor
          v-model="step.criteria"
          :system-map-data="systemMapData"
          :is-root="false"
          @delete="emit('delete')"
        />
      </div>

      <div>
        <div v-if="step.failureCriteria" class="pt-4 space-y-4">
          <Label>Step-Wide Failure Condition</Label>
          <CriterionEditor
            v-model="step.failureCriteria"
            :system-map-data="systemMapData"
            :is-root="false"
            @delete="deleteFailureCriterion"
          />
        </div>
        <div v-else>
          <Button variant="outline" @click="addFailureCriterion">
            Add Step-Wide Failure Condition
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
