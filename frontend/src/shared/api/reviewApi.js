import axiosInstance from './axiosInstance'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'
const API_URL = `${BASE_URL}/reviews`

// ── Public endpoints ──
export const getApprovedReviews = async (page = 0, size = 10) => {
  const response = await axios.get(`${API_URL}/approved`, { params: { page, size } })
  return response.data
}

export const getReviewStats = async () => {
  const response = await axios.get(`${API_URL}/approved/stats`)
  return response.data
}

// ── Authenticated endpoints ──
export const createReview = async (data) => {
  const response = await axiosInstance.post(API_URL, data)
  return response.data
}

export const getMyReviews = async (page = 0, size = 10) => {
  const response = await axiosInstance.get(`${API_URL}/my`, { params: { page, size } })
  return response.data
}

// ── Admin endpoints ──
export const getAllReviews = async (page = 0, size = 10) => {
  const response = await axiosInstance.get(API_URL, { params: { page, size } })
  return response.data
}

export const approveReview = async (id) => {
  const response = await axiosInstance.put(`${API_URL}/${id}/approve`)
  return response.data
}

export const replyReview = async (id, adminReply) => {
  const response = await axiosInstance.put(`${API_URL}/${id}/reply`, { adminReply })
  return response.data
}

export const deleteReview = async (id) => {
  const response = await axiosInstance.delete(`${API_URL}/${id}`)
  return response.data
}

export const checkReviewExists = async (bookingId) => {
  const response = await axiosInstance.get(`${API_URL}/check/${bookingId}`)
  return response.data
}
