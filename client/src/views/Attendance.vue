<script setup>
import { ref, onMounted } from "vue";
import { useAttendanceStore } from "@/stores/attendanceStore";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { VERIFY_ICONS } from "@/data/defaultTraits";
import AttendanceDetailModal from "@/components/AttendanceDetailModal.vue";

const attendanceStore = useAttendanceStore();
const authStore = useAuthStore();
const toast = useToastStore();

const newSession = ref({
  date: new Date().toISOString().split("T")[0],
  note: "",
  secretIconId: "",
});
const showVerifyModal = ref(false);
const verifyOptions = ref([]);
const targetSessionId = ref("");
const showDetailModal = ref(false);
const selectedSession = ref(null);

onMounted(() => attendanceStore.fetchSessions());

const handleCreateSession = async () => {
  if (!newSession.value.secretIconId)
    return toast.warning("Vui lòng chọn Icon mật khẩu!");
  await attendanceStore.createSession(newSession.value);
  toast.success("Đã tạo buổi tập mới!");
};

const openCheckInModal = (sessionId) => {
  verifyOptions.value = [...VERIFY_ICONS].sort(() => 0.5 - Math.random());
  targetSessionId.value = sessionId;
  showVerifyModal.value = true;
};

const handleVerifySubmit = async (iconId) => {
  showVerifyModal.value = false;
  const success = await attendanceStore.selfCheckIn(
    targetSessionId.value,
    iconId
  );
  if (success) toast.success("Điểm danh thành công! ✅");
  else toast.error("Thất bại! Có thể bạn chọn sai Icon hoặc đã bị chặn. 🚫");
};

// FIX LỖI Ở ĐÂY: Kiểm tra kỹ user trước khi check
const isMyCheckIn = (session) => {
  if (!authStore.user || !authStore.user.playerId) return false;
  return (
    session.attendees &&
    session.attendees.some((p) => p.id === authStore.user.playerId)
  );
};

const viewDetail = (session) => {
  if (authStore.isAdmin) {
    selectedSession.value = session;
    showDetailModal.value = true;
  } else {
    toast.info(`Tổng số người tham gia: ${session.attendeeCount || 0}`);
  }
};
</script>

<template>
  <div class="space-y-8 pb-24 px-4 max-w-5xl mx-auto">
    <h1
      class="text-4xl font-black text-white text-center mb-8 drop-shadow-glow"
    >
      📅 LỊCH TRÌNH
    </h1>

    <div
      v-if="authStore.isAdmin"
      class="bg-slate-900/90 p-6 rounded-3xl border border-yellow-500/30 shadow-xl"
    >
      <h3 class="text-xl font-bold text-yellow-400 mb-4">👑 Tạo Buổi Tập</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input v-model="newSession.date" type="date" class="input" />
        <input
          v-model="newSession.note"
          placeholder="Ghi chú (VD: Sân Cầu Suối...)"
          class="input"
        />
      </div>
      <div class="mb-4">
        <p class="text-sm font-bold text-slate-300 mb-2">🔐 Mật Khẩu Icon:</p>
        <div class="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          <div
            v-for="icon in VERIFY_ICONS"
            :key="icon.id"
            @click="newSession.secretIconId = icon.id"
            :class="[
              'p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center min-w-[70px]',
              newSession.secretIconId === icon.id
                ? 'bg-green-500/20 border-green-500 scale-110'
                : 'bg-slate-800 border-slate-700',
            ]"
          >
            <span class="text-2xl">{{ icon.icon }}</span>
          </div>
        </div>
      </div>
      <button @click="handleCreateSession" class="btn-primary w-full py-3">
        MỞ CỔNG CHECK-IN
      </button>
    </div>

    <div class="space-y-4">
      <div v-if="attendanceStore.loading" class="text-center text-slate-500">
        Đang tải...
      </div>
      <div
        v-for="session in attendanceStore.sessions"
        :key="session.id"
        class="bg-slate-800 rounded-2xl p-6 border border-white/5 relative overflow-hidden"
      >
        <div
          class="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10"
        >
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h4 class="text-2xl font-black text-white font-mono">
                {{ new Date(session.date).toLocaleDateString("vi-VN") }}
              </h4>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-bold',
                  session.status === 'OPEN'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-600/20 text-slate-400',
                ]"
              >
                {{ session.status === "OPEN" ? "ĐANG MỞ" : "ĐÃ ĐÓNG" }}
              </span>
            </div>
            <p class="text-slate-400">{{ session.note }}</p>
          </div>

          <div class="flex items-center gap-4 w-full md:w-auto">
            <div class="text-right mr-4">
              <p class="text-xs text-slate-500 uppercase font-bold">Tham gia</p>
              <p class="text-xl font-black text-white">
                {{ session.attendeeCount || 0 }}
              </p>
            </div>

            <button
              v-if="
                session.status === 'OPEN' &&
                !authStore.isAdmin &&
                !isMyCheckIn(session)
              "
              @click="openCheckInModal(session.id)"
              class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/40 active:scale-95 transition-all"
            >
              🙋‍♂️ BÁO DANH
            </button>

            <div
              v-if="isMyCheckIn(session) && !authStore.isAdmin"
              class="px-4 py-2 bg-green-900/30 text-green-400 rounded-xl font-bold border border-green-500/30 flex items-center gap-2"
            >
              <span>✅</span> Đã điểm danh
            </div>

            <button
              v-if="authStore.isAdmin"
              @click="viewDetail(session)"
              class="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold"
            >
              📋 Danh Sách
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showVerifyModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
    >
      <div
        class="bg-slate-900 rounded-3xl p-6 w-full max-w-sm border border-red-500/30 shadow-2xl animate-bounce-in"
      >
        <h3 class="text-xl font-black text-white text-center mb-2">
          🛡️ BẢO MẬT
        </h3>
        <p class="text-center text-slate-400 mb-6 text-sm">
          Chọn đúng Icon Admin yêu cầu:
        </p>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="icon in verifyOptions"
            :key="icon.id"
            @click="handleVerifySubmit(icon.id)"
            class="p-4 bg-white/5 hover:bg-white/20 rounded-xl flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          >
            <span class="text-3xl">{{ icon.icon }}</span>
          </button>
        </div>
        <button
          @click="showVerifyModal = false"
          class="mt-6 w-full py-3 bg-slate-800 text-slate-400 rounded-xl font-bold"
        >
          Hủy
        </button>
      </div>
    </div>

    <AttendanceDetailModal
      :show="showDetailModal"
      :session="selectedSession"
      @close="
        showDetailModal = false;
        attendanceStore.fetchSessions();
      "
    />
  </div>
</template>

<style scoped>
.input {
  @apply w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-yellow-500 transition-colors;
}
.btn-primary {
  @apply bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black rounded-xl shadow-lg hover:shadow-yellow-500/30 transition-all active:scale-95;
}
.animate-bounce-in {
  animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes bounceIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}
</style>
