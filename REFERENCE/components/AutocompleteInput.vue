<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ComboboxRoot,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxViewport,
} from 'reka-ui'
import { ChevronsUpDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  modelValue: string
  items: string[]
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const searchTerm = ref('')

// Performance: Only filter and show a small subset of items.
const filteredItems = computed(() => {
  const lowerCaseSearch = searchTerm.value.toLowerCase()
  if (!lowerCaseSearch)
    return props.items.slice(0, 10)

  return [searchTerm.value].concat(props.items
    .filter(item => item.toLowerCase().includes(lowerCaseSearch) && item !== searchTerm.value)
    .slice(0, 10))
})
</script>

<template>
  <ComboboxRoot
    :model-value="props.modelValue"
    @update:model-value="(value: any) => emit('update:modelValue', value ?? '')"
    class="w-full"
  >
    <div class="relative w-full">
      <ComboboxInput
        :class="cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', 'pr-10')"
        :placeholder="props.placeholder || 'Select item...'"
        @update:model-value="(value: any) => searchTerm = value"
      />
      <ComboboxTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
          class="absolute top-1/2 right-1 -translate-y-1/2"
        >
          <ChevronsUpDown class="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </ComboboxTrigger>
    </div>
    <ComboboxContent
      :class="cn('absolute z-50 w-[20rem] mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2')"
      side="bottom"
      :align="'start'"
      :side-offset="5"
    >
      <ComboboxViewport class="p-1">
        <ComboboxEmpty class="py-1.5 text-center text-sm text-muted-foreground">
          No results found.
        </ComboboxEmpty>
        <ComboboxGroup>
          <ComboboxItem
            v-for="item in filteredItems"
            :key="item"
            :value="item"
            :class="cn('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50')"
          >
            {{ item }}
          </ComboboxItem>
        </ComboboxGroup>
      </ComboboxViewport>
    </ComboboxContent>
  </ComboboxRoot>
</template>
