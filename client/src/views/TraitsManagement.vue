<template>
  <div class="min-h-screen bg-gray-900 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-white">Quản Lý Chỉ Số Ẩn</h1>
        <button @click="showCreateModal = true" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
          + Tạo Chỉ Số Ẩn Mới
        </button>
      </div>

      <div class="bg-gray-800 rounded-xl shadow-2xl p-8">
        <h2 class="text-xl font-semibold text-white mb-4">Chỉ Số Ẩn Mặc Định</h2>
        <p class="text-gray-400 mb-6">Các chỉ số ẩn mặc định được lưu trữ cục bộ và không thể chỉnh sửa.</p>

        <div class="mb-8">
          <h3 class="text-lg font-medium text-amber-400 mb-3">Chỉ Số Ẩn Vàng</h3>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div v-for="trait in DEFAULT_TRAITS.golden" :key="trait.id" class="bg-gray-700 rounded-lg p-4 text-center">
              <div class="aspect-square bg-gray-800 rounded-lg mb-2 flex items-center justify-center">
                <span class="text-3xl">⭐</span>
              </div>
              <p class="text-white text-sm">{{ trait.name }}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-medium text-blue-400 mb-3">Chỉ Số Ẩn Thường</h3>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div v-for="trait in DEFAULT_TRAITS.normal" :key="trait.id" class="bg-gray-700 rounded-lg p-4 text-center">
              <div class="aspect-square bg-gray-800 rounded-lg mb-2 flex items-center justify-center">
                <span class="text-3xl">✨</span>
              </div>
              <p class="text-white text-sm">{{ trait.name }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gray-800 rounded-xl shadow-2xl p-8 mt-8">
        <h2 class="text-xl font-semibold text-white mb-4">Chỉ Số Ẩn Tùy Chỉnh</h2>

        <div v-if="traitStore.customTraits.length === 0" class="text-center py-12 text-gray-400">
          Chưa có chỉ số ẩn tùy chỉnh nào. Hãy tạo mới!
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="trait in traitStore.customTraits" :key="trait.id" class="bg-gray-700 rounded-lg p-4 text-center relative group">
            <div class="aspect-square bg-gray-800 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
              <img v-if="trait.image_url" :src="trait.image_url" :alt="trait.name" class="w-full h-full object-cover" />
              <span v-else class="text-3xl">{{ trait.description === 'golden' ? '⭐' : '✨' }}</span>
            </div>
            <p class="text-white text-sm truncate">{{ trait.name }}</p>
            <span class="text-xs" :class="trait.description === 'golden' ? 'text-amber-400' : 'text-blue-400'">
              {{ trait.description === 'golden' ? 'Vàng' : 'Thường' }}
            </span>

            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-2">
              <button @click="editTrait(trait)" class="p-1 bg-yellow-600 rounded hover:bg-yellow-500">
                <span class="text-xs">✏️</span>
              </button>
              <button @click="deleteTrait(trait.id)" class="p-1 bg-red-600 rounded hover:bg-red-500">
                <span class="text-xs">🗑️</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Modal v-if="showCreateModal" @close="showCreateModal = false">
      <div class="bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <h2 class="text-2xl font-bold text-white mb-6">{{ editingTrait ? 'Chỉnh Sửa' : 'Tạo' }} Chỉ Số Ẩn</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">ID (Unique)</label>
            <input v-model="traitForm.id" :disabled="!!editingTrait" type="text" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" placeholder="e.g., custom_trait_1" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Tên</label>
            <input v-model="traitForm.name" type="text" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., Super Speed" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Loại</label>
            <select v-model="traitForm.description" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="golden">Vàng</option>
              <option value="normal">Thường</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">URL Hình Ảnh</label>
            <input v-model="traitForm.image_url" type="text" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-4">
          <button @click="showCreateModal = false" class="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
            Hủy
          </button>
          <button @click="handleSubmit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
            {{ editingTrait ? 'Cập nhật' : 'Tạo' }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTraitStore } from '../stores/traitStore';
import { useToastStore } from '../stores/toastStore';
import { DEFAULT_TRAITS } from '../data/defaultTraits';
import Modal from '../components/Modal.vue';

const traitStore = useTraitStore();
const toastStore = useToastStore();

const showCreateModal = ref(false);
const editingTrait = ref(null);
const traitForm = ref({
  id: '',
  name: '',
  image_url: '',
  description: 'normal'
});

onMounted(() => {
  traitStore.fetchCustomTraits();
});

const editTrait = (trait) => {
  editingTrait.value = trait;
  traitForm.value = { ...trait };
  showCreateModal.value = true;
};

const resetForm = () => {
  traitForm.value = {
    id: '',
    name: '',
    image_url: '',
    description: 'normal'
  };
  editingTrait.value = null;
};

const handleSubmit = async () => {
  try {
    if (editingTrait.value) {
      await traitStore.updateCustomTrait(editingTrait.value.id, traitForm.value);
      toastStore.success('Cập nhật chỉ số ẩn thành công!');
    } else {
      await traitStore.createCustomTrait(traitForm.value);
      toastStore.success('Tạo chỉ số ẩn thành công!');
    }
    showCreateModal.value = false;
    resetForm();
  } catch (error) {
    toastStore.error('Có lỗi xảy ra!');
    console.error(error);
  }
};

const deleteTrait = async (id) => {
  if (confirm('Bạn có chắc muốn xóa chỉ số ẩn này?')) {
    try {
      await traitStore.deleteCustomTrait(id);
      toastStore.success('Xóa thành công!');
    } catch (error) {
      toastStore.error('Không thể xóa!');
      console.error(error);
    }
  }
};
</script>
