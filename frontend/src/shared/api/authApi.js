import axios from 'axios'
import axiosInstance from './axiosInstance'
import { createPaymentUrl } from './paymentApi'

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

export const registerInitApi = async (fullName, email, phone, password, language) => {
  const response = await axios.post(`${API_URL}/register/init`, {
    fullName,
    email,
    phone,
    password,
    language
  })
  return response.data
}

export const registerVerifyApi = async (email, otpCode) => {
  const response = await axios.post(`${API_URL}/register/verify`, {
    email,
    otpCode
  })
  return response.data
}

export const forgotPasswordApi = async (email, language) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email, language })
  return response.data
}

export const resetPasswordApi = async (token, newPassword, language) => {
  const response = await axios.post(`${API_URL}/reset-password`, { token, newPassword, language })
  return response.data
}

export const changePasswordApi = async (oldPassword, newPassword) => {
  const response = await axiosInstance.post(`${API_URL}/change-password`, { oldPassword, newPassword })
  return response.data
}

export { createPaymentUrl }
