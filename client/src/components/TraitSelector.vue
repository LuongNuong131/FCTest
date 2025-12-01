<template>
  <div class="trait-selector">
    <h3 class="text-xl font-semibold mb-4">Chỉ Số Ẩn</h3>

    <div class="mb-6">
      <h4 class="text-lg font-medium mb-3 text-amber-400 flex items-center gap-2">
        <span>⭐</span>
        <span>Chỉ Số Ẩn Vàng (Chọn tối đa 1)</span>
      </h4>
      <div class="grid grid-cols-3 md:grid-cols-5 gap-3">
        <div
          v-for="trait in goldenTraits"
          :key="trait.id"
          @click="toggleGoldenTrait(trait)"
          :class="[
            'trait-item cursor-pointer rounded-lg p-3 border-2 transition-all',
            isGoldenSelected(trait.id)
              ? 'border-amber-400 bg-amber-400/20 scale-105'
              : 'border-gray-600 bg-gray-700 hover:border-amber-300'
          ]"
        >
          <div class="aspect-square bg-gray-800 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
            <img
              v-if="trait.image"
              :src="trait.image"
              :alt="trait.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-3xl">⭐</span>
          </div>
          <p class="text-xs text-center truncate">{{ trait.name }}</p>
        </div>
      </div>
    </div>

    <div>
      <h4 class="text-lg font-medium mb-3 text-blue-400 flex items-center gap-2">
        <span>✨</span>
        <span>Chỉ Số Ẩn Thường (Chọn thoải mái)</span>
      </h4>
      <div class="grid grid-cols-3 md:grid-cols-5 gap-3">
        <div
          v-for="trait in normalTraits"
          :key="trait.id"
          @click="toggleNormalTrait(trait)"
          :class="[
            'trait-item cursor-pointer rounded-lg p-3 border-2 transition-all',
            isNormalSelected(trait.id)
              ? 'border-blue-400 bg-blue-400/20 scale-105'
              : 'border-gray-600 bg-gray-700 hover:border-blue-300'
          ]"
        >
          <div class="aspect-square bg-gray-800 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
            <img
              v-if="trait.image"
              :src="trait.image"
              :alt="trait.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-3xl">✨</span>
          </div>
          <p class="text-xs text-center truncate">{{ trait.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { DEFAULT_TRAITS } from '../data/defaultTraits';
import { useTraitStore } from '../stores/traitStore';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ golden: null, normal: [] })
  }
});

const emit = defineEmits(['update:modelValue']);

const traitStore = useTraitStore();

const goldenTraits = computed(() => {
  const defaultGolden = DEFAULT_TRAITS.golden;
  const customGolden = traitStore.customTraits
    .filter(t => t.description === 'golden')
    .map(t => ({ ...t, type: 'golden', image: t.image_url }));
  return [...defaultGolden, ...customGolden];
});

const normalTraits = computed(() => {
  const defaultNormal = DEFAULT_TRAITS.normal;
  const customNormal = traitStore.customTraits
    .filter(t => t.description !== 'golden')
    .map(t => ({ ...t, type: 'normal', image: t.image_url }));
  return [...defaultNormal, ...customNormal];
});

const isGoldenSelected = (traitId) => {
  return props.modelValue?.golden?.id === traitId;
};

const isNormalSelected = (traitId) => {
  return props.modelValue?.normal?.some(t => t.id === traitId) || false;
};

const toggleGoldenTrait = (trait) => {
  const currentGolden = props.modelValue?.golden;
  const newGolden = currentGolden?.id === trait.id ? null : trait;

  emit('update:modelValue', {
    ...props.modelValue,
    golden: newGolden
  });
};

const toggleNormalTrait = (trait) => {
  const currentNormal = props.modelValue?.normal || [];
  const isSelected = currentNormal.some(t => t.id === trait.id);

  const newNormal = isSelected
    ? currentNormal.filter(t => t.id !== trait.id)
    : [...currentNormal, trait];

  emit('update:modelValue', {
    ...props.modelValue,
    normal: newNormal
  });
};
</script>

<style scoped>
.trait-item {
  transition: all 0.2s ease;
}

.trait-item:hover {
  transform: translateY(-2px);
}
</style>
