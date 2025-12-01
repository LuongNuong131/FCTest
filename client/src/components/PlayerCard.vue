<script setup>
import { computed } from "vue";

const props = defineProps({
  player: Object,
});

const overallRating = computed(() => {
  const stats = props.player;
  const pac = stats.pac || 50,
    sho = stats.sho || 50,
    pas = stats.pas || 50,
    dri = stats.dri || 50,
    def = stats.def || 50,
    phy = stats.phy || 50;

  const sum = pac + sho + pas + dri + def + phy;
  const avg = Math.round(sum / 6);
  return avg > 90 ? "99" : avg > 70 ? avg : "70-";
});

const footName = computed(() => {
  switch (props.player.dominantFoot) {
    case "Right":
      return "Chân Phải";
    case "Left":
      return "Chân Trái";
    case "Both":
      return "Hai chân";
    default:
      return "Chưa rõ";
  }
});

const cardGradient = computed(() => {
  const rating = parseInt(overallRating.value);
  if (rating >= 90) return 'from-amber-500 via-yellow-400 to-amber-500';
  if (rating >= 85) return 'from-purple-500 via-pink-500 to-purple-500';
  if (rating >= 80) return 'from-blue-500 via-cyan-400 to-blue-500';
  if (rating >= 75) return 'from-emerald-500 via-green-400 to-emerald-500';
  return 'from-gray-600 via-gray-500 to-gray-600';
});

const traits = computed(() => props.player.traits || { golden: null, normal: [] });
</script>

<template>
  <div
    class="relative w-72 h-[36rem] rounded-3xl shadow-2xl shadow-black/50 transform hover:scale-105 transition-all duration-500 cursor-pointer select-none font-sans text-white overflow-hidden"
  >
    <div :class="['absolute inset-0 bg-gradient-to-br opacity-90', cardGradient]"></div>

    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

    <div class="relative z-10">
      <div class="absolute top-0 left-0 right-0 p-5 flex justify-between items-start">
        <div class="flex flex-col items-center">
          <div class="text-5xl font-black text-white leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {{ overallRating }}
          </div>
          <div class="text-sm font-bold text-white/90 uppercase mt-1 drop-shadow-md">
            {{ player.position.substring(0, 3) }}
          </div>
        </div>

        <div v-if="traits.golden" class="flex flex-col gap-1">
          <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg shadow-lg flex items-center justify-center border-2 border-amber-300">
            <img v-if="traits.golden.image" :src="traits.golden.image" :alt="traits.golden.name" class="w-10 h-10 object-contain" />
            <span v-else class="text-2xl">⭐</span>
          </div>
        </div>
      </div>

      <div class="absolute top-20 left-1/2 transform -translate-x-1/2 w-44 h-44 mt-2">
        <div class="relative w-full h-full">
          <div class="absolute inset-0 bg-gradient-to-b from-white/20 to-black/30 rounded-full"></div>
          <img
            :src="player.imageUrl || 'https://placehold.co/150'"
            class="relative w-full h-full object-cover object-top rounded-full border-4 border-white/30 shadow-2xl"
          />
        </div>
      </div>

      <div class="absolute top-[17.5rem] w-full text-center px-6">
        <h2 class="text-2xl font-black text-white uppercase tracking-wider drop-shadow-lg truncate">
          {{ player.name }}
        </h2>
        <div class="text-xs text-white/80 mt-1 font-semibold drop-shadow-md">{{ footName }}</div>
      </div>

      <div v-if="traits.normal && traits.normal.length > 0" class="absolute top-[21rem] w-full px-6">
        <div class="flex justify-center gap-2 flex-wrap">
          <div
            v-for="trait in traits.normal.slice(0, 4)"
            :key="trait.id"
            class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md flex items-center justify-center border-2 border-blue-300/50"
          >
            <img v-if="trait.image" :src="trait.image" :alt="trait.name" class="w-8 h-8 object-contain" />
            <span v-else class="text-lg">✨</span>
          </div>
        </div>
      </div>

      <div class="absolute bottom-6 w-full px-8 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div class="stat-row">
          <span class="text-white/80 font-semibold">PAC</span>
          <span class="stat-value">{{ player.pac || 50 }}</span>
        </div>
        <div class="stat-row">
          <span class="text-white/80 font-semibold">DRI</span>
          <span class="stat-value">{{ player.dri || 50 }}</span>
        </div>

        <div class="stat-row">
          <span class="text-white/80 font-semibold">SHO</span>
          <span class="stat-value">{{ player.sho || 50 }}</span>
        </div>
        <div class="stat-row">
          <span class="text-white/80 font-semibold">DEF</span>
          <span class="stat-value">{{ player.def || 50 }}</span>
        </div>

        <div class="stat-row">
          <span class="text-white/80 font-semibold">PAS</span>
          <span class="stat-value">{{ player.pas || 50 }}</span>
        </div>
        <div class="stat-row">
          <span class="text-white/80 font-semibold">PHY</span>
          <span class="stat-value">{{ player.phy || 50 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-row {
  @apply flex justify-between items-center;
}
.stat-value {
  @apply text-xl font-black text-white drop-shadow-md;
}
</style>
