import axiosInstance from './axiosInstance'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const API_URL = `${BASE_URL}/chatbot`;

export const createConversationApi = async (data) => {
  const response = await axiosInstance.post(`${API_URL}/conversations`, data)
  return response.data
}

export const getConversationsByUserApi = async (userId) => {
  const response = await axiosInstance.get(`${API_URL}/conversations/user/${userId}`)
  return response.data
}

export const sendMessageApi = async (data) => {
  const response = await axiosInstance.post(`${API_URL}/send`, data)
  return response.data
}

export const getMessagesApi = async (conversationId) => {
  const response = await axiosInstance.get(`${API_URL}/conversations/${conversationId}/messages`)
  return response.data
}

export const closeConversationApi = async (conversationId) => {
  const response = await axiosInstance.put(`${API_URL}/conversations/${conversationId}/close`)
  return response.data
}
