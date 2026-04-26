import axiosInstance from './axiosInstance'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const API_URL = `${BASE_URL}/admin/users`;

export const getAllUsersApi = async () => {
  const response = await axiosInstance.get(API_URL)
  return response.data
}

export const updateUserRolesApi = async (userId, roles) => {
  const response = await axiosInstance.put(`${API_URL}/${userId}/roles`, roles)
  return response.data
}
