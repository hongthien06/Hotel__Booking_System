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

export const uploadFileApi = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axiosInstance.post(`${BASE_URL}/files/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export const uploadFromUrlApi = async (imageUrl) => {
  const response = await axiosInstance.post(`${BASE_URL}/files/upload-url`, null, {
    params: { url: imageUrl }
  })
  return response.data
}

