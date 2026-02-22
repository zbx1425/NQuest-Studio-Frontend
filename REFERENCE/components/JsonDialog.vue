<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  modelValue: string
  mode: 'import' | 'exportJson' | 'exportCommand'
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
}>()

const openState = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const textValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const title = computed(() => props.mode === 'import' ? 'Import Quest from JSON' : props.mode === 'exportJson' ? 'Export Quest to JSON' : 'Export Quest to Command')
const description = computed(() => props.mode === 'import' 
  ? 'Paste the JSON content of your quest below.' 
  : props.mode === 'exportJson' ? 'Copy the JSON content below.' : 'Copy the command below and use it in a COMMAND BLOCK.')
</script>

<template>
  <Dialog v-model:open="openState">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          {{ description }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="grid w-full gap-1.5">
        <Label for="json-area">Quest JSON</Label>
        <Textarea
          id="json-area"
          v-model="textValue"
          :read-only="mode === 'exportJson' || mode === 'exportCommand'"
          class="min-h-[300px] font-mono text-sm"
          placeholder='{ "id": "...", "name": "...", ... }'
        />
      </div>

      <DialogFooter>
        <Button v-if="mode === 'import'" type="submit" @click="$emit('confirm')">
          Import
        </Button>
        <Button v-else type="button" variant="secondary" @click="openState = false">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
