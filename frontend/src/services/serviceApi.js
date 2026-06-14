import axios from 'axios';

const API_URL = 'http://localhost:5001/api/services';

export const serviceApi = {
  getAllServices: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  },

  getSuggestedCode: async (category) => {
    const res = await axios.get(`${API_URL}/suggested-code?groupType=${encodeURIComponent(category)}`);
    return res.data;
  },

  createService: async (data) => {
    const res = await axios.post(API_URL, data);
    return res.data;
  },

  updateService: async (id, data) => {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
  },

  deleteService: async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  },

  restoreService: async (id) => {
    const res = await axios.patch(`${API_URL}/${id}/restore`);
    return res.data;
  }
};
