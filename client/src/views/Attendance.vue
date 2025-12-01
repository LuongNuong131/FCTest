<script setup>
import { ref, onMounted, computed } from "vue";
import { useAttendanceStore } from "@/stores/attendanceStore";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { VERIFY_ICONS } from "@/data/defaultTraits"; // List 10 icons

const attendanceStore = useAttendanceStore();
const authStore = useAuthStore();
const toast = useToastStore();

const newSession = ref({
  date: new Date().toISOString().split("T")[0],
  note: "",
  secretIconId: "",
});
const showVerifyModal = ref(false);
const verifyOptions = ref([]); // 3 icons ngẫu nhiên
const targetSessionId = ref("");

// --- LOGIC ---

// Admin: Tạo buổi (Chọn Secret)
const handleCreateSession = async () => {
  if (!newSession.value.secretIconId)
    return toast.warning("Chọn mật khẩu icon đi!");
  await attendanceStore.createSession(newSession.value);
  toast.success("Đã mở cổng điểm danh với mật khẩu!");
};

// User: Bấm Báo Danh -> Hiện Modal Random
const openCheckInModal = (sessionId) => {
  // 1. Tìm Session hiện tại
  const session = attendanceStore.sessions.find((s) => s.id === sessionId);
  if (!session) return;

  // 2. Logic Random 3 icon (Phải chứa Secret nếu có, hoặc không thì user ko biết đâu mà lần)
  // Thực tế: Client không biết Secret là gì (security).
  // Giải pháp: Hiển thị 3 icon ngẫu nhiên từ list 10.
  // Admin phải hô: "Hôm nay chọn cái Còi nhé!".
  // Nếu user chọn sai -> Server check -> Block.

  // Shuffle 10 icons, lấy 3 cái hiển thị (Hoặc hiển thị cả 10 cho khó)
  // User yêu cầu: "random mỗi ngày... có khoản 10 icon" -> Hiển thị cả 10 cho user chọn.
  verifyOptions.value = [...VERIFY_ICONS].sort(() => 0.5 - Math.random());

  targetSessionId.value = sessionId;
  showVerifyModal.value = true;
};

// User: Chọn Icon -> Gửi về Server verify
const handleVerifySubmit = async (iconId) => {
  showVerifyModal.value = false;
  const success = await attendanceStore.selfCheckIn(
    targetSessionId.value,
    iconId
  );
  if (success) toast.success("Chuẩn men! Điểm danh thành công ✅");
  else toast.error("Sai mật khẩu! Bạn đã bị chặn 🚫");
};

// ... Các hàm cũ (isCheckedIn, handleCloseSession...) giữ nguyên logic
// Update store selfCheckIn nhận thêm iconId
onMounted(() => attendanceStore.fetchSessions());
</script>

<template>
  <div class="space-y-6 pb-24">
    <!-- Header Design Cũ -->
    <!-- ... -->

    <!-- Admin Form: Thêm chọn Secret Icon -->
    <div
      v-if="authStore.isAdmin"
      class="bg-slate-900/80 p-6 rounded-3xl border border-indigo-500/30"
    >
      <h3 class="text-xl font-bold text-white mb-4">👑 Tạo Buổi Tập (Admin)</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input v-model="newSession.date" type="date" class="input" />
        <input
          v-model="newSession.note"
          placeholder="Ghi chú..."
          class="input"
        />
      </div>

      <p class="text-sm font-bold text-yellow-400 mb-2">
        🔐 Chọn Mật Khẩu Hình Ảnh (Bắt buộc):
      </p>
      <div class="flex gap-2 overflow-x-auto pb-2">
        <div
          v-for="icon in VERIFY_ICONS"
          :key="icon.id"
          @click="newSession.secretIconId = icon.id"
          :class="[
            'p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center min-w-[80px]',
            newSession.secretIconId === icon.id
              ? 'bg-green-500/20 border-green-500'
              : 'bg-white/5 border-white/10',
          ]"
        >
          <span class="text-2xl">{{ icon.icon }}</span>
          <span class="text-[10px] text-white mt-1">{{ icon.label }}</span>
        </div>
      </div>

      <button @click="handleCreateSession" class="btn-primary w-full mt-4">
        ＋ MỞ CỔNG
      </button>
    </div>

    <!-- Session List -->
    <div
      v-for="session in attendanceStore.sessions"
      :key="session.id"
      class="bg-slate-800 rounded-3xl p-6 border border-white/5"
    >
      <!-- Info Session -->
      <div class="flex justify-between mb-4">
        <h4 class="text-2xl font-black text-white">
          {{ new Date(session.date).toLocaleDateString("vi-VN") }}
        </h4>
        <span class="text-green-400 font-bold">{{ session.status }}</span>
      </div>

      <!-- Button Checkin -->
      <button
        v-if="session.status === 'OPEN' && !isCheckedIn(session)"
        @click="openCheckInModal(session.id)"
        class="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all"
      >
        🙋‍♂️ BÁO DANH (VERIFY)
      </button>
      <!-- ... Hien thi danh sach da diem danh ... -->
    </div>

    <!-- Verify Modal -->
    <div
      v-if="showVerifyModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div
        class="bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-red-500/30 shadow-2xl animate-bounce-in"
      >
        <h3 class="text-2xl font-black text-white text-center mb-2">
          🛡️ ANTI-CHEAT SYSTEM
        </h3>
        <p class="text-center text-slate-400 mb-6 text-sm">
          Admin đã chọn hình nào? Chọn sai là
          <span class="text-red-500 font-bold">RA ĐẢO</span> nhé!
        </p>

        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="icon in verifyOptions"
            :key="icon.id"
            @click="handleVerifySubmit(icon.id)"
            class="p-4 bg-white/5 hover:bg-white/20 rounded-xl flex flex-col items-center gap-2 border border-white/10 active:scale-90 transition-all"
          >
            <span class="text-3xl">{{ icon.icon }}</span>
            <span class="text-xs font-bold text-slate-300">{{
              icon.label
            }}</span>
          </button>
        </div>

        <button
          @click="showVerifyModal = false"
          class="mt-6 w-full py-3 bg-slate-800 text-slate-400 rounded-xl font-bold"
        >
          Hủy bỏ
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input {
  @apply w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none;
}
.btn-primary {
  @apply py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-lg transition-all;
}
.animate-bounce-in {
  animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
</style>
