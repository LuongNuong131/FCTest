<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { usePlayerStore } from "@/stores/playerStore";
import { useToastStore } from "@/stores/toastStore";
import axiosClient from "@/api/axiosClient";
import { DEFAULT_TRAITS } from "@/data/defaultTraits";
import PlayerCard from "@/components/PlayerCard.vue";

const authStore = useAuthStore();
const playerStore = usePlayerStore();
const toast = useToastStore();

const loading = ref(false);
const playerData = ref({});
const customTraits = ref([]); // Từ DB
const activeTab = ref("info"); // info, traits, admin_traits

// Load data
onMounted(async () => {
  await playerStore.fetchPlayers();
  await fetchCustomTraits();

  const pid = authStore.user?.playerId;
  if (pid) {
    const p = playerStore.players.find((x) => x.id === pid);
    if (p) {
      playerData.value = JSON.parse(JSON.stringify(p)); // Deep copy
      // Init traits if null
      if (!playerData.value.traits) playerData.value.traits = [];
    }
  }
});

const fetchCustomTraits = async () => {
  try {
    const res = await axiosClient.get("/traits");
    customTraits.value = res.data.map((t) => ({
      ...t,
      image: t.image_url,
      source: "db",
    }));
  } catch (e) {
    console.error(e);
  }
};

const allTraits = computed(() => {
  return [...DEFAULT_TRAITS, ...customTraits.value];
});

// Trait Selection Logic
const toggleTrait = (trait) => {
  const currentTraits = playerData.value.traits || [];
  const exists = currentTraits.find((t) => t.id === trait.id);

  if (exists) {
    // Remove
    playerData.value.traits = currentTraits.filter((t) => t.id !== trait.id);
  } else {
    // Add Check
    if (trait.type === "gold") {
      const hasGold = currentTraits.some((t) => t.type === "gold");
      if (hasGold)
        return toast.warning("Chỉ được chọn 1 chỉ số Vàng thôi đại ca!");
    }
    playerData.value.traits.push(trait);
  }
};

const isTraitSelected = (id) =>
  playerData.value.traits?.some((t) => t.id === id);

// Save Profile
const handleUpdate = async () => {
  loading.value = true;
  try {
    await playerStore.updatePlayer(playerData.value.id, playerData.value);
    toast.success("Cập nhật hồ sơ & Chỉ số ẩn thành công!");
    // Update local user display name if changed
    if (authStore.user.displayName !== playerData.value.name) {
      authStore.user.displayName = playerData.value.name;
    }
  } catch (e) {
    toast.error(e.response?.data?.message || e.message);
  } finally {
    loading.value = false;
  }
};

// Admin Create Trait
const newTrait = reactive({
  name: "",
  type: "normal",
  image_url: "",
  description: "",
});
const handleCreateTrait = async () => {
  try {
    await axiosClient.post("/traits", newTrait);
    toast.success("Đã tạo chỉ số mới!");
    await fetchCustomTraits();
    newTrait.name = "";
    newTrait.image_url = "";
    newTrait.description = "";
  } catch (e) {
    toast.error("Lỗi tạo trait");
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto pb-20 space-y-8">
    <!-- Top Section: Card Preview & Info -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Left: Preview Card -->
      <div class="flex justify-center md:justify-start">
        <PlayerCard :player="playerData" />
      </div>

      <!-- Right: Tabs & Forms -->
      <div
        class="md:col-span-2 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
      >
        <!-- Tabs -->
        <div
          class="flex gap-2 mb-6 border-b border-white/10 pb-2 overflow-x-auto"
        >
          <button
            @click="activeTab = 'info'"
            :class="[
              'px-4 py-2 rounded-lg font-bold transition-all',
              activeTab === 'info'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-white/5',
            ]"
          >
            📝 Thông Tin
          </button>
          <button
            @click="activeTab = 'traits'"
            :class="[
              'px-4 py-2 rounded-lg font-bold transition-all',
              activeTab === 'traits'
                ? 'bg-yellow-600 text-white'
                : 'text-slate-400 hover:bg-white/5',
            ]"
          >
            ✨ Chỉ Số Ẩn
          </button>
          <button
            v-if="authStore.isAdmin"
            @click="activeTab = 'admin_traits'"
            :class="[
              'px-4 py-2 rounded-lg font-bold transition-all',
              activeTab === 'admin_traits'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:bg-white/5',
            ]"
          >
            🛡️ Tạo Trait
          </button>
        </div>

        <!-- Tab 1: Info -->
        <div v-if="activeTab === 'info'" class="space-y-4 animate-fade-in">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Họ Tên</label>
              <input v-model="playerData.name" class="input" />
            </div>
            <div>
              <label class="label">Số Áo</label>
              <input
                v-model="playerData.jerseyNumber"
                type="number"
                class="input"
              />
            </div>
            <div>
              <label class="label">Vị Trí</label>
              <select v-model="playerData.position" class="input">
                <option value="Forward">Tiền đạo</option>
                <option value="Midfielder">Tiền vệ</option>
                <option value="Defender">Hậu vệ</option>
                <option value="Goalkeeper">Thủ môn</option>
              </select>
            </div>
            <div>
              <label class="label">Avatar URL</label>
              <input
                v-model="playerData.imageUrl"
                class="input"
                placeholder="Link ảnh..."
              />
            </div>
          </div>

          <h3
            class="text-green-400 font-bold mt-4 pt-4 border-t border-white/10"
          >
            Chỉ Số In-Game
          </h3>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="stat in ['pac', 'sho', 'pas', 'dri', 'def', 'phy']"
              :key="stat"
            >
              <label class="label uppercase">{{ stat }}</label>
              <input
                v-model="playerData[stat]"
                type="number"
                class="input text-center font-mono font-bold text-yellow-400"
                min="1"
                max="99"
              />
            </div>
          </div>
        </div>

        <!-- Tab 2: Traits Selector -->
        <div v-if="activeTab === 'traits'" class="animate-fade-in">
          <p class="text-sm text-slate-400 mb-4">
            Chọn tối đa
            <span class="text-yellow-400 font-bold">1 Trait Vàng</span>. Trait
            thường thoải mái.
          </p>

          <div
            class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2"
          >
            <div
              v-for="trait in allTraits"
              :key="trait.id"
              @click="toggleTrait(trait)"
              :class="[
                'p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2 relative group hover:scale-105',
                isTraitSelected(trait.id)
                  ? trait.type === 'gold'
                    ? 'bg-yellow-500/20 border-yellow-500'
                    : 'bg-blue-500/20 border-blue-500'
                  : 'bg-white/5 border-transparent hover:bg-white/10',
              ]"
            >
              <div
                v-if="isTraitSelected(trait.id)"
                class="absolute top-2 right-2 text-green-400"
              >
                ✔
              </div>

              <img :src="trait.image" class="w-10 h-10 object-contain" />
              <div>
                <p
                  :class="[
                    'font-bold text-xs',
                    trait.type === 'gold'
                      ? 'text-yellow-400'
                      : 'text-slate-200',
                  ]"
                >
                  {{ trait.name }}
                </p>
                <p class="text-[10px] text-slate-500 leading-tight mt-1">
                  {{ trait.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: Admin Create -->
        <div
          v-if="activeTab === 'admin_traits'"
          class="animate-fade-in space-y-4"
        >
          <h3 class="text-purple-400 font-bold">
            Tạo Chỉ Số Ẩn Mới (Vĩnh viễn)
          </h3>
          <input
            v-model="newTrait.name"
            placeholder="Tên Trait (VD: Thánh Lặn)"
            class="input"
          />
          <input
            v-model="newTrait.image_url"
            placeholder="Link Icon (PNG/JPG)"
            class="input"
          />
          <input
            v-model="newTrait.description"
            placeholder="Mô tả..."
            class="input"
          />
          <select v-model="newTrait.type" class="input">
            <option value="normal">Thường (Bạc)</option>
            <option value="gold">Vàng (Hiếm)</option>
          </select>
          <button
            @click="handleCreateTrait"
            class="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white shadow-lg"
          >
            + Tạo Vào Database
          </button>
        </div>

        <!-- Footer Save Button -->
        <div class="mt-6 pt-6 border-t border-white/10 flex justify-end">
          <button
            @click="handleUpdate"
            :disabled="loading"
            class="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2"
          >
            <span v-if="loading" class="animate-spin">⏳</span>
            LƯU THAY ĐỔI
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.label {
  @apply block text-xs font-bold text-slate-500 mb-1 uppercase;
}
.input {
  @apply w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 outline-none transition-all;
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
