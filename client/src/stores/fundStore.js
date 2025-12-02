import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axiosClient from "@/api/axiosClient"; // Đã sửa đường dẫn

export const useFundStore = defineStore("fund", () => {
  const funds = ref([]);
  const loading = ref(false);

  const fetchFunds = async () => {
    loading.value = true;
    try {
      const res = await axiosClient.get("/funds");
      funds.value = res.data;
    } catch (err) {
      console.error("Lỗi tải quỹ:", err);
    } finally {
      loading.value = false;
    }
  };

  const createFund = async (fundData) => {
    try {
      await axiosClient.post("/funds", fundData);
      await fetchFunds();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const deleteFund = async (id) => {
    try {
      await axiosClient.delete(`/funds/${id}`);
      funds.value = funds.value.filter((f) => f.id !== id);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const totalBalance = computed(() => {
    return funds.value.reduce((total, item) => total + Number(item.amount), 0);
  });

  const formattedBalance = computed(() => {
    const val = totalBalance.value;
    if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
    if (val >= 1000) return (val / 1000).toFixed(0) + "k";
    return val.toLocaleString("vi-VN");
  });

  return {
    funds,
    loading,
    fetchFunds,
    createFund,
    deleteFund,
    totalBalance,
    formattedBalance,
  };
});
