import { defineStore } from 'pinia';
import axiosClient from '../api/axiosClient';

export const useTraitStore = defineStore('trait', {
  state: () => ({
    customTraits: [],
    loading: false
  }),

  actions: {
    async fetchCustomTraits() {
      this.loading = true;
      try {
        const response = await axiosClient.get('/traits');
        this.customTraits = response.data;
      } catch (error) {
        console.error('Failed to fetch custom traits:', error);
      } finally {
        this.loading = false;
      }
    },

    async createCustomTrait(traitData) {
      try {
        await axiosClient.post('/traits', traitData);
        await this.fetchCustomTraits();
      } catch (error) {
        console.error('Failed to create custom trait:', error);
        throw error;
      }
    },

    async updateCustomTrait(id, traitData) {
      try {
        await axiosClient.put(`/traits/${id}`, traitData);
        await this.fetchCustomTraits();
      } catch (error) {
        console.error('Failed to update custom trait:', error);
        throw error;
      }
    },

    async deleteCustomTrait(id) {
      try {
        await axiosClient.delete(`/traits/${id}`);
        await this.fetchCustomTraits();
      } catch (error) {
        console.error('Failed to delete custom trait:', error);
        throw error;
      }
    }
  }
});
