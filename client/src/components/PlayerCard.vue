<script setup>
import { computed } from "vue";

const props = defineProps({
  player: Object,
});

// Tính OVR
const overallRating = computed(() => {
  const s = props.player;
  if (!s) return 50;
  const avg = Math.round(
    ((s.pac || 50) +
      (s.sho || 50) +
      (s.pas || 50) +
      (s.dri || 50) +
      (s.def || 50) +
      (s.phy || 50)) /
      6
  );
  return avg > 99 ? 99 : avg;
});

// Tìm Gold Trait để hiển thị nổi bật
const goldTrait = computed(() => {
  return props.player.traits?.find((t) => t.type === "gold");
});
</script>

<template>
  <div class="relative w-64 h-96 group select-none perspective-1000">
    <!-- Card Inner -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[1.5rem] border-[3px] border-slate-600 shadow-2xl overflow-hidden transition-all duration-500 transform group-hover:scale-105 group-hover:-rotate-1 group-hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]"
    >
      <!-- Background Effect -->
      <div
        class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"
      ></div>

      <!-- Top Info -->
      <div class="absolute top-4 left-4 z-20">
        <div
          class="text-4xl font-black text-yellow-400 drop-shadow-md font-mono"
        >
          {{ overallRating }}
        </div>
        <div class="text-lg font-bold text-slate-300 uppercase tracking-wider">
          {{ player.position?.substring(0, 3) }}
        </div>

        <!-- Team Logo (Optional) -->
        <div
          class="mt-2 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
        >
          <span class="text-xs">FC</span>
        </div>
      </div>

      <!-- Player Image -->
      <div
        class="absolute top-10 right-[-10px] w-48 h-48 z-10 transition-transform duration-500 group-hover:scale-110"
      >
        <img
          :src="player.imageUrl || 'https://placehold.co/200x200?text=No+Img'"
          class="w-full h-full object-cover object-top drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] mask-image-gradient"
        />
      </div>

      <!-- Player Name -->
      <div class="absolute top-[60%] w-full text-center z-20">
        <h2
          class="text-xl font-black text-white uppercase tracking-tighter truncate px-2 drop-shadow-lg"
        >
          {{ player.name }}
        </h2>
        <div
          class="h-0.5 w-1/2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mt-1"
        ></div>
      </div>

      <!-- Stats Grid -->
      <div class="absolute bottom-4 w-full px-4 z-20">
        <div
          class="grid grid-cols-2 gap-x-2 gap-y-1 text-xs font-bold text-slate-300"
        >
          <div class="flex justify-between">
            <span class="text-yellow-500">PAC</span>
            <span>{{ player.pac || 50 }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-yellow-500">DRI</span>
            <span>{{ player.dri || 50 }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-yellow-500">SHO</span>
            <span>{{ player.sho || 50 }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-yellow-500">DEF</span>
            <span>{{ player.def || 50 }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-yellow-500">PAS</span>
            <span>{{ player.pas || 50 }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-yellow-500">PHY</span>
            <span>{{ player.phy || 50 }}</span>
          </div>
        </div>
      </div>

      <!-- Gold Trait Badge -->
      <div
        v-if="goldTrait"
        class="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-30"
        :title="goldTrait.name"
      >
        <img :src="goldTrait.image" class="w-6 h-6 object-contain" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.mask-image-gradient {
  -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
}
</style>
