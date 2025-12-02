<script setup>
import { ref, reactive, onMounted } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import { useRouter, useRoute } from "vue-router";
import { useToastStore } from "@/stores/toastStore";
import axiosClient from "@/api/axiosClient";
import { DEFAULT_TRAITS } from "@/data/defaultTraits";

const props = defineProps({ isEditing: Boolean });
const playerStore = usePlayerStore();
const router = useRouter();
const route = useRoute();
const toast = useToastStore();
const customTraits = ref([]);

const formData = reactive({
  name: "",
  phone: "",
  dob: "",
  height_cm: 0,
  weight_kg: 0,
  position: "Midfielder",
  jerseyNumber: 0,
  imageUrl: "",
  dominantFoot: "Right",
  pac: 60,
  sho: 60,
  pas: 60,
  dri: 60,
  def: 60,
  phy: 60,
  traits: [],
});

onMounted(async () => {
  try {
    const res = await axiosClient.get("/traits");
    customTraits.value = res.data;
  } catch (e) {}

  if (props.isEditing) {
    try {
      const p = await playerStore.getPlayerById(route.params.id);
      Object.assign(formData, {
        ...p,
        dob: p.dob ? p.dob.split("T")[0] : "",
        traits:
          typeof p.traits_json === "string"
            ? JSON.parse(p.traits_json)
            : p.traits_json || [],
      });
    } catch (e) {}
  }
});

const toggleTrait = (trait, level) => {
  const idx = formData.traits.findIndex((t) => t.id === trait.id);
  // Logic: Nếu chọn Gold -> Xóa Gold cũ. Nếu chọn lại -> Bỏ chọn.
  if (level === "gold") {
    const oldGold = formData.traits.findIndex((t) => t.level === "gold");
    if (oldGold > -1) formData.traits.splice(oldGold, 1);
  }
  if (idx > -1) formData.traits.splice(idx, 1);
  formData.traits.push({
    id: trait.id,
    name: trait.name,
    image: trait.image || trait.image_url,
    level,
  });
};

const isSelected = (id, level) =>
  formData.traits.some((t) => t.id === id && t.level === level);

const submit = async () => {
  try {
    if (props.isEditing)
      await playerStore.updatePlayer(route.params.id, formData);
    else await playerStore.createPlayer(formData);
    toast.success("OK");
    router.push("/players");
  } catch (e) {
    toast.error("Error");
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 bg-slate-900 rounded-3xl mt-10">
    <h2 class="text-2xl font-bold text-white mb-6">
      {{ isEditing ? "Sửa" : "Tạo" }} Cầu Thủ
    </h2>
    <form @submit.prevent="submit" class="space-y-6">
      <div class="grid grid-cols-2 gap-4">
        <input
          v-model="formData.name"
          placeholder="Tên"
          class="bg-slate-800 p-3 rounded text-white"
          required
        />
        <input
          v-model="formData.jerseyNumber"
          type="number"
          placeholder="Số áo"
          class="bg-slate-800 p-3 rounded text-white"
        />
        <input
          v-model="formData.imageUrl"
          placeholder="Link Ảnh"
          class="bg-slate-800 p-3 rounded text-white col-span-2"
        />
      </div>

      <div class="grid grid-cols-6 gap-2">
        <div v-for="s in ['pac', 'sho', 'pas', 'dri', 'def', 'phy']" :key="s">
          <label class="text-white text-xs uppercase">{{ s }}</label>
          <input
            v-model.number="formData[s]"
            type="number"
            class="w-full bg-slate-800 p-2 rounded text-white text-center"
          />
        </div>
      </div>

      <div class="bg-slate-800 p-4 rounded">
        <h3 class="text-white font-bold mb-2">PlayStyles</h3>
        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="t in [...DEFAULT_TRAITS, ...customTraits]"
            :key="t.id"
            class="bg-slate-900 p-2 rounded flex flex-col items-center"
          >
            <img :src="t.image || t.image_url" class="w-8 h-8" />
            <div class="flex gap-1 mt-1">
              <button
                type="button"
                @click="toggleTrait(t, 'silver')"
                :class="
                  isSelected(t.id, 'silver')
                    ? 'bg-slate-300 text-black'
                    : 'bg-slate-700 text-white'
                "
                class="text-[10px] px-2 rounded"
              >
                Bạc
              </button>
              <button
                type="button"
                @click="toggleTrait(t, 'gold')"
                :class="
                  isSelected(t.id, 'gold')
                    ? 'bg-yellow-500 text-black'
                    : 'bg-slate-700 text-white'
                "
                class="text-[10px] px-2 rounded"
              >
                Vàng
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        class="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-500"
      >
        LƯU THÔNG TIN
      </button>
    </form>
  </div>
</template>
