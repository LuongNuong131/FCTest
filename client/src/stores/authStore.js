import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axiosClient from "@/api/axiosClient"; // Fix

export const useAuthStore = defineStore("auth", () => {
  const router = useRouter();
  const user = ref(JSON.parse(localStorage.getItem("user")) || null);
  const token = ref(localStorage.getItem("token") || null);
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  const login = async (username, password) => {
    try {
      const res = await axiosClient.post("/auth/login", { username, password });
      if (res.data.success) {
        user.value = res.data.user;
        token.value = res.data.token;
        localStorage.setItem("user", JSON.stringify(user.value));
        localStorage.setItem("token", token.value);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Lỗi" };
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.clear();
    router.push("/login");
  };

  return { user, token, isAuthenticated, isAdmin, login, logout };
});
