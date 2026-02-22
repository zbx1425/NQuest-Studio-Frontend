<script setup lang="ts">
import { computed, watch } from 'vue'
import type { Criterion } from '@/lib/types'
import type { SystemMapData } from '@/lib/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Vec3dInput from './Vec3dInput.vue'
import AutocompleteInput from './AutocompleteInput.vue'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { createDefaultCriterion } from '@/lib/quest'
import { Input } from '@/components/ui/input'
import { Switch } from './ui/switch'
import { v4 as uuidv4 } from 'uuid'

defineOptions({
  name: 'CriterionEditor',
})

const props = defineProps<{
  modelValue: Criterion
  systemMapData: SystemMapData | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Criterion): void
  (e: 'delete'): void
}>()

const criterion = computed({
  get: () => props.modelValue,
  set: (newValue) => {
    emit('update:modelValue', newValue)
  },
})

watch(criterion, (newCriterion) => {
  if (!props.systemMapData) return

  const type = newCriterion.type
  if (type === 'VisitStationCriterion' || type === 'RideToStationCriterion' || type === 'RideLineToStationCriterion') {
    const stationName = newCriterion.stationName
    if (stationName && props.systemMapData.stationNameToId[stationName]) {
      const stationId = props.systemMapData.stationNameToId[stationName]
      if (stationId !== undefined && stationName !== stationId) { // Prevent infinite loop if name is already ID
        newCriterion.stationName = stationId
        // toast.info('Station name resolved', {
        //   description: `"${stationName}" was automatically converted to ID "${stationId}". This is for that future renames won't break existing quests.`,
        // })
      }
    }
  }
}, { deep: true })

const stationItems = computed(() => props.systemMapData?.stationNamesAndIds ?? [])
const routeItems = computed(() => props.systemMapData?.routeNames ?? [])

const criterionTypes: Criterion['type'][] = [
  'RideLineCriterion',
  'VisitStationCriterion',
  'RideToStationCriterion',
  'RideLineToStationCriterion',
  'ManualTriggerCriterion',
  'InBoundsCriterion',
  'OverSpeedCriterion',
  'TeleportDetectCriterion',
  'ConstantCriterion',
  'Descriptor',
  'AndCriterion',
  'OrCriterion',
  'NotCriterion',
  'LatchingCriterion',
  'RisingEdgeAndConditionCriterion',
]

function handleTypeChange(newType: Criterion['type'] | null) {
  if (newType && newType !== criterion.value.type) {
    criterion.value = createDefaultCriterion(newType)
  }
}

function addCriterion(list: Criterion[]) {
  list.push(createDefaultCriterion('InBoundsCriterion'))
}

function deleteCriterion(list: Criterion[], index: number) {
  list.splice(index, 1)
}

const componentId = uuidv4()
</script>

<template>
  <Card class="relative">
    <div class="absolute top-4 right-4">
      <Button variant="ghost" size="icon" @click="$emit('delete')">
        <Trash2 class="h-4 w-4 text-red-500" />
      </Button>
    </div>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Select :model-value="criterion.type" @update:model-value="(value) => handleTypeChange(value as Criterion['type'])">
          <SelectTrigger>
            <SelectValue placeholder="Select a condition type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="type in criterionTypes" :key="type" :value="type">
              {{ type.replace('Criterion', '') }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div v-if="criterion.type === 'InBoundsCriterion'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label>Minimum Coordinates</Label>
          <Vec3dInput v-model="criterion.min" />
        </div>
        <div class="space-y-2">
          <Label>Maximum Coordinates</Label>
          <Vec3dInput v-model="criterion.max" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <Label>Description</Label>
          <Input v-model="criterion.description" />
        </div>
      </div>

      <div v-if="criterion.type === 'OverSpeedCriterion'" class="space-y-2">
        <Label>Max Speed (m/s)</Label>
        <Input v-model.number="criterion.maxSpeedMps" type="number" />
      </div>

      <div v-if="criterion.type === 'TeleportDetectCriterion'" class="space-y-2">
        <p class="text-sm text-muted-foreground">This criterion is triggered whenever a player moved more than 166 meters in the last second (~ 600km/h).</p>
      </div>
      
      <div v-if="criterion.type === 'Descriptor'" class="space-y-2">
        <Label>Base Condition</Label>
        <CriterionEditor
          v-model="criterion.base"
          :system-map-data="systemMapData"
          :is-root="false"
        />
        <div class="space-y-2">
          <Label>Description (Overwrites Base Condition Description)</Label>
          <Input v-model="criterion.description" />
        </div>
      </div>

      <div v-if="criterion.type === 'RideLineCriterion'" class="space-y-2">
        <div class="space-y-2">
          <Label>Line Name</Label>
          <AutocompleteInput v-model="criterion.lineName" :items="routeItems" placeholder="Select a route" />
        </div>
      </div>
      
      <div v-if="criterion.type === 'VisitStationCriterion'" class="space-y-2">
        <div class="space-y-2">
          <Label>Station Name</Label>
          <AutocompleteInput v-model="criterion.stationName" :items="stationItems" placeholder="Select a station" />
        </div>
      </div>
      
      <div v-if="criterion.type === 'RideToStationCriterion'" class="space-y-2">
        <div class="space-y-2">
          <Label>Station Name</Label>
          <AutocompleteInput v-model="criterion.stationName" :items="stationItems" placeholder="Select a station" />
        </div>
      </div>

      <div v-if="criterion.type === 'RideLineToStationCriterion'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label>Line Name</Label>
          <AutocompleteInput v-model="criterion.lineName" :items="routeItems" placeholder="Select a route" />
        </div>
        <div class="space-y-2">
          <Label>Station Name</Label>
          <AutocompleteInput v-model="criterion.stationName" :items="stationItems" placeholder="Select a station" />
        </div>
      </div>

      <div v-if="criterion.type === 'ManualTriggerCriterion'" class="space-y-2">
        <p>ID: <code>{{ criterion.id }}</code></p>
        <div class="space-y-2">
          <Label>Description</Label>
          <Input v-model="criterion.description" placeholder="Describe how to manually trigger this step." />
        </div>
      </div>

      <div v-if="criterion.type === 'ConstantCriterion'" class="space-y-2">
        <div class="flex items-center space-x-2">
          <Switch :id="`constant-value-${componentId}`" v-model="criterion.value" />
          <label
            :for="`constant-value-${componentId}`"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Value
          </label>
        </div>
        <div class="space-y-2">
          <Label>Description</Label>
          <Input v-model="criterion.description" />
        </div>
      </div>

      <div v-if="criterion.type === 'AndCriterion' || criterion.type === 'OrCriterion'" class="space-y-4">
        <h3 class="text-md font-semibold">Conditions</h3>
        <div class="space-y-4">
          <CriterionEditor
            v-for="(_, index) in criterion.criteria"
            :key="index"
            v-model="criterion.criteria[index]"
            :system-map-data="systemMapData"
            :is-root="false"
            @delete="deleteCriterion(criterion.criteria, index)"
          />
        </div>
        <Button variant="default" @click="addCriterion(criterion.criteria)">
          Add Condition
        </Button>
      </div>

      
      <div v-if="criterion.type === 'NotCriterion'" class="space-y-2">
        <Label>Base Condition</Label>
        <CriterionEditor
          v-model="criterion.base"
          :system-map-data="systemMapData"
          :is-root="false"
        />
        <div class="space-y-2">
          <Label>Description (Overwrites Base Condition Description)</Label>
          <Input v-model="criterion.description" />
        </div>
      </div>

      <div v-if="criterion.type === 'LatchingCriterion'" class="space-y-2">
        <Label>Base Condition</Label>
        <CriterionEditor
          v-model="criterion.base"
          :system-map-data="systemMapData"
          :is-root="false"
        />
      </div>

      <div v-if="criterion.type === 'RisingEdgeAndConditionCriterion'" class="space-y-4">
        <div class="space-y-2">
          <Label>Trigger Condition</Label>
          <CriterionEditor
            v-model="criterion.triggerCriteria"
            :system-map-data="systemMapData"
            :is-root="false"
          />
        </div>
        <div class="space-y-2">
          <Label>Condition</Label>
          <CriterionEditor
            v-model="criterion.conditionCriteria"
            :system-map-data="systemMapData"
            :is-root="false"
          />
        </div>
      </div>
    </CardContent>
  </Card>
</template>
