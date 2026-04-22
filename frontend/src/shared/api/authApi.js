import axios from 'axios'
import { createVnpayPaymentUrl, createMomoPaytUrl } from './index'

// API base URL configuration
const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'
const API_URL = `${BASE_URL}/auth`
export const loginApi = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password })
  return response.data
}

export const registerApi = async (fullName, email, phone, password) => {
  const response = await axios.post(`${API_URL}/register`, {
    fullName,
    email,
    phone,
    password
  })
  return response.data
}

export const forgotPasswordApi = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email })
  return response.data
}

export const resetPasswordApi = async (token, newPassword) => {
  const response = await axios.post(`${API_URL}/reset-password`, { token, newPassword })
  return response.data
}

export { createVnpayPaymentUrl, createMomoPaytUrl }
