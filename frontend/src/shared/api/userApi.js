import axiosInstance from './axiosInstance'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const API_URL = `${BASE_URL}/users`;

export const getMyProfileApi = async () => {
  const response = await axiosInstance.get(`${API_URL}/me`)
  return response.data
}

export const updateMyProfileApi = async (profileData) => {
  const response = await axiosInstance.put(`${API_URL}/me`, profileData)
  return response.data
}
