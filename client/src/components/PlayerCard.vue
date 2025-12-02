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

// Lấy 3 Traits xịn nhất (Gold trước)
const displayTraits = computed(() => {
  if (!props.player?.traits) return [];
  return [...props.player.traits]
    .sort((a, b) => (a.type === "gold" ? -1 : 1))
    .slice(0, 3);
});
</script>

<template>
  <div
    class="relative w-[320px] h-[480px] group select-none perspective-1000 mx-auto"
  >
    <div
      class="absolute inset-0 rounded-t-[3rem] rounded-b-[2rem] overflow-hidden transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2 z-0 shadow-[0_0_30px_rgba(255,215,0,0.4)] group-hover:shadow-[0_0_50px_rgba(255,215,0,0.8)]"
    >
      <div
        class="absolute inset-0 bg-gradient-to-b from-[#fefcea] via-[#f1da97] to-[#bfa369]"
      ></div>

      <div
        class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
      ></div>

      <div
        class="absolute inset-[6px] border-[2px] border-[#9c824a] rounded-t-[2.5rem] rounded-b-[1.5rem] opacity-70"
      ></div>
      <div
        class="absolute inset-[10px] border border-[#fff] opacity-30 rounded-t-[2.4rem] rounded-b-[1.4rem]"
      ></div>
    </div>

    <div class="relative z-10 w-full h-full text-[#3d3118]">
      <div class="absolute top-10 left-8 flex flex-col items-center z-20">
        <div
          class="text-6xl font-[900] tracking-tighter leading-none text-[#3d3118] drop-shadow-sm"
        >
          {{ overallRating }}
        </div>
        <div class="text-xl font-bold uppercase tracking-wide mt-1">
          {{ player.position?.substring(0, 3) || "CAM" }}
        </div>
        <div
          class="mt-2 w-8 h-6 border border-black/10 shadow-sm bg-red-600 flex items-center justify-center"
        >
          <span class="text-yellow-400 text-xs">★</span>
        </div>
      </div>

      <div
        class="absolute top-6 right-[-10px] w-[230px] h-[230px] transition-transform duration-500 group-hover:scale-110 group-hover:translate-x-1 z-10"
      >
        <img
          :src="player.imageUrl || 'https://placehold.co/200x200?text=No+Img'"
          class="w-full h-full object-cover object-top drop-shadow-[10px_10px_15px_rgba(0,0,0,0.4)] mask-fade-bottom"
        />
      </div>

      <div class="absolute top-[52%] w-full text-center px-4 z-20">
        <h2
          class="text-2xl font-[900] uppercase tracking-tighter text-[#2a2212] drop-shadow-sm truncate py-1"
        >
          {{ player.name }}
        </h2>
        <div class="w-2/3 h-[2px] bg-[#9c824a]/60 mx-auto mt-1 mb-2"></div>
      </div>

      <div class="absolute bottom-[20%] w-full px-8 z-20">
        <div
          class="grid grid-cols-2 gap-x-8 gap-y-1 text-base font-bold text-[#2a2212]"
        >
          <div class="flex justify-between border-b border-[#9c824a]/20">
            <span>{{ player.pac || 50 }}</span>
            <span class="opacity-70 font-normal">PAC</span>
          </div>
          <div class="flex justify-between border-b border-[#9c824a]/20">
            <span>{{ player.dri || 50 }}</span>
            <span class="opacity-70 font-normal">DRI</span>
          </div>
          <div class="flex justify-between border-b border-[#9c824a]/20">
            <span>{{ player.sho || 50 }}</span>
            <span class="opacity-70 font-normal">SHO</span>
          </div>
          <div class="flex justify-between border-b border-[#9c824a]/20">
            <span>{{ player.def || 50 }}</span>
            <span class="opacity-70 font-normal">DEF</span>
          </div>
          <div class="flex justify-between border-b border-[#9c824a]/20">
            <span>{{ player.pas || 50 }}</span>
            <span class="opacity-70 font-normal">PAS</span>
          </div>
          <div class="flex justify-between border-b border-[#9c824a]/20">
            <span>{{ player.phy || 50 }}</span>
            <span class="opacity-70 font-normal">PHY</span>
          </div>
        </div>
      </div>

      <div class="absolute bottom-6 w-full flex justify-center gap-3 px-4 z-20">
        <div
          v-for="trait in displayTraits"
          :key="trait.id"
          class="relative group/trait"
        >
          <div
            :class="[
              'w-9 h-9 rounded-full flex items-center justify-center border shadow-md transition-all hover:scale-125 bg-white',
              trait.type === 'gold'
                ? 'border-yellow-600 ring-2 ring-yellow-400'
                : 'border-slate-400',
            ]"
          >
            <img :src="trait.image" class="w-6 h-6 object-contain" />
          </div>
          <div
            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/trait:opacity-100 pointer-events-none z-30 shadow-lg"
          >
            {{ trait.name }}
          </div>
        </div>

        <div
          v-if="displayTraits.length === 0"
          class="text-xs text-[#9c824a] italic opacity-70"
        >
          Chưa có chỉ số ẩn
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.mask-fade-bottom {
  -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
}
</style>
