import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    return await api.get('/admin/dashboard');
  },

  getUsers: async (params = {}) => {
    return await api.get('/admin/users', { params });
  },

  getUserById: async (id) => {
    return await api.get(`/admin/users/${id}`);
  },

  createUser: async (userData) => {
    return await api.post('/admin/users', userData);
  },

  getStores: async (params = {}) => {
    return await api.get('/admin/stores', { params });
  },

  createStore: async (storeData) => {
    return await api.post('/admin/stores', storeData);
  },

  getEligibleOwners: async () => {
    return await api.get('/admin/eligible-owners');
  },
};
