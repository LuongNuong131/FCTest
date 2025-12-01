<template>
  <div class="min-h-screen bg-gray-900 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="mb-6">
        <button @click="router.back()" class="text-gray-400 hover:text-white flex items-center gap-2">
          <span>←</span>
          <span>Quay lại</span>
        </button>
      </div>

      <div class="bg-gray-800 rounded-xl shadow-2xl p-8">
        <h1 class="text-3xl font-bold text-white mb-8">Chỉnh Sửa Hồ Sơ Cầu Thủ</h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 class="text-xl font-semibold text-white mb-4">Thông Tin Cơ Bản</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Tên</label>
                <input v-model="form.name" type="text" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Số Điện Thoại</label>
                <input v-model="form.phone" type="text" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Ngày Sinh</label>
                <input v-model="form.dob" type="date" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Chiều Cao (cm)</label>
                  <input v-model.number="form.height_cm" type="number" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Cân Nặng (kg)</label>
                  <input v-model.number="form.weight_kg" type="number" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Vị Trí</label>
                <select v-model="form.position" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Forward">Forward</option>
                  <option value="Midfielder">Midfielder</option>
                  <option value="Defender">Defender</option>
                  <option value="Goalkeeper">Goalkeeper</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Số Áo</label>
                <input v-model.number="form.jerseyNumber" type="number" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Chân Thuận</label>
                <select v-model="form.dominantFoot" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Right">Chân Phải</option>
                  <option value="Left">Chân Trái</option>
                  <option value="Both">Hai Chân</option>
                </select>
              </div>
            </div>

            <h2 class="text-xl font-semibold text-white mb-4 mt-8">Chỉ Số Kỹ Năng</h2>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">PAC (Tốc độ)</label>
                <input v-model.number="form.pac" type="number" min="1" max="99" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">SHO (Sút)</label>
                <input v-model.number="form.sho" type="number" min="1" max="99" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">PAS (Chuyền)</label>
                <input v-model.number="form.pas" type="number" min="1" max="99" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">DRI (Rê bóng)</label>
                <input v-model.number="form.dri" type="number" min="1" max="99" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">DEF (Phòng ngự)</label>
                <input v-model.number="form.def" type="number" min="1" max="99" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">PHY (Thể lực)</label>
                <input v-model.number="form.phy" type="number" min="1" max="99" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>

          <div>
            <TraitSelector v-model="form.traits" />

            <div class="mt-8">
              <h2 class="text-xl font-semibold text-white mb-4">Xem Trước</h2>
              <div class="flex justify-center">
                <PlayerCard :player="previewPlayer" />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-end gap-4">
          <button @click="router.back()" class="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
            Hủy
          </button>
          <button @click="handleSave" :disabled="saving" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition disabled:opacity-50">
            {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/playerStore';
import { useTraitStore } from '../stores/traitStore';
import { useToastStore } from '../stores/toastStore';
import PlayerCard from '../components/PlayerCard.vue';
import TraitSelector from '../components/TraitSelector.vue';

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();
const traitStore = useTraitStore();
const toastStore = useToastStore();

const saving = ref(false);
const form = ref({
  name: '',
  phone: '',
  dob: '',
  height_cm: 170,
  weight_kg: 65,
  position: 'Forward',
  jerseyNumber: 0,
  dominantFoot: 'Right',
  imageUrl: '',
  pac: 50,
  sho: 50,
  pas: 50,
  dri: 50,
  def: 50,
  phy: 50,
  traits: { golden: null, normal: [] }
});

const previewPlayer = computed(() => ({
  ...form.value,
  id: route.params.id
}));

onMounted(async () => {
  await traitStore.fetchCustomTraits();

  const playerId = route.params.id;
  const player = playerStore.players.find(p => p.id == playerId);

  if (player) {
    form.value = {
      ...player,
      traits: player.traits || { golden: null, normal: [] }
    };
  } else {
    await playerStore.fetchPlayers();
    const updatedPlayer = playerStore.players.find(p => p.id == playerId);
    if (updatedPlayer) {
      form.value = {
        ...updatedPlayer,
        traits: updatedPlayer.traits || { golden: null, normal: [] }
      };
    }
  }
});

const handleSave = async () => {
  saving.value = true;
  try {
    await playerStore.updatePlayer(route.params.id, form.value);
    toastStore.success('Cập nhật hồ sơ thành công!');
    router.push(`/players/${route.params.id}`);
  } catch (error) {
    toastStore.error('Lỗi khi cập nhật hồ sơ');
    console.error(error);
  } finally {
    saving.value = false;
  }
};
</script>
