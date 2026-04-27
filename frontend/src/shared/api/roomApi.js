import axiosInstance from './axiosInstance';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const API_URL = `${BASE_URL}/rooms`;

export const getRoomsApi = async () => {
  const response = await axiosInstance.get(API_URL);
  return response.data;
};

export const getAvailableRoomsApi = async (checkIn, checkOut, province) => {
  const params = { checkIn, checkOut };
  if (province && province.trim()) params.province = province.trim();
  const response = await axiosInstance.get(`${API_URL}/available`, { params });
  return response.data;
};

export const getRoomByIdApi = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/${id}`);
  return response.data;
};
