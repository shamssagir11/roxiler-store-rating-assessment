import api from './api';

export const storeService = {
  getAllStores: async (params = {}) => {
    return await api.get('/stores', { params });
  },

  getStoreById: async (id) => {
    return await api.get(`/stores/${id}`);
  },
};

export const ratingService = {
  submitRating: async (storeId, rating) => {
    return await api.post('/ratings', { storeId, rating });
  },

  getMyRatings: async () => {
    return await api.get('/ratings/my');
  },
};

export const ownerService = {
  getDashboard: async () => {
    return await api.get('/owner/dashboard');
  },

  getRatings: async (params = {}) => {
    return await api.get('/owner/ratings', { params });
  },
};
