<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@/components/ui/input'
import type { Vec3d } from '@/lib/types'

const props = defineProps<{
  modelValue: Vec3d
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Vec3d): void
}>()

const value = computed({
  get: () => props.modelValue,
  set: (newValue) => {
    emit('update:modelValue', newValue)
  },
})
</script>

<template>
  <div class="grid grid-cols-3 gap-2">
    <Input v-model.number="value.x" type="number" placeholder="X" />
    <Input v-model.number="value.y" type="number" placeholder="Y" />
    <Input v-model.number="value.z" type="number" placeholder="Z" />
  </div>
</template>
