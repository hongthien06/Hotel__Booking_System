import axiosInstance from './axiosInstance';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const API_URL = `${BASE_URL}/dashboard`;

export const getDashboardStats = async () => {
  const response = await axiosInstance.get(`${API_URL}/stats`);
  return response.data;
};

export const getDashboardCharts = async (days = 7) => {
  const response = await axiosInstance.get(`${API_URL}/charts`, { params: { days } });
  return response.data;
};

