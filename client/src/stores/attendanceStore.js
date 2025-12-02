import { defineStore } from "pinia";
import { ref } from "vue";
import axiosClient from "@/api/axiosClient"; // Đã sửa đường dẫn
import { usePlayerStore } from "./playerStore";

export const useAttendanceStore = defineStore("attendance", () => {
  const sessions = ref([]);
  const loading = ref(false);

  const fetchSessions = async () => {
    loading.value = true;
    try {
      const response = await axiosClient.get("/sessions");
      sessions.value = response.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
    } catch (err) {
      console.error("Lỗi tải sessions:", err);
    } finally {
      loading.value = false;
    }
  };

  const createSession = async (data) => {
    loading.value = true;
    try {
      await axiosClient.post("/sessions", data);
      await fetchSessions();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const selfCheckIn = async (sessionId, selectedIconId) => {
    try {
      await axiosClient.post("/sessions/check-in", {
        sessionId,
        selectedIconId,
      });
      await fetchSessions();
      const playerStore = usePlayerStore();
      await playerStore.fetchPlayers();
      return { success: true };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.response?.data?.message || "Lỗi điểm danh không xác định!",
      };
    }
  };

  const adminCheckIn = async (sessionId, playerId) => {
    try {
      await axiosClient.post("/sessions/admin/checkin", {
        sessionId,
        playerId,
      });
      await fetchSessions();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const adminRemoveCheckIn = async (sessionId, playerId) => {
    try {
      await axiosClient.post("/sessions/admin/remove", { sessionId, playerId });
      await fetchSessions();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await axiosClient.delete(`/sessions/${sessionId}`);
      sessions.value = sessions.value.filter((s) => s.id !== sessionId);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const toggleStatus = async (sessionId, currentStatus) => {
    const newStatus = currentStatus === "OPEN" ? "CLOSED" : "OPEN";
    try {
      await axiosClient.put(`/sessions/${sessionId}/status`, {
        status: newStatus,
      });
      await fetchSessions();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const closeSession = async (sessionId) => {
    return toggleStatus(sessionId, "OPEN");
  };

  return {
    sessions,
    loading,
    fetchSessions,
    createSession,
    selfCheckIn,
    adminCheckIn,
    adminRemoveCheckIn,
    deleteSession,
    toggleStatus,
    closeSession,
  };
});
