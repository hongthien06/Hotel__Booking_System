import axios from 'axios'

const API_URL = '/api/v1/users'

export const getMyProfileApi = async () => {
  const response = await axios.get(`${API_URL}/me`)
  return response.data
}

export const updateMyProfileApi = async (profileData) => {
  const response = await axios.put(`${API_URL}/me`, profileData)
  return response.data
}
