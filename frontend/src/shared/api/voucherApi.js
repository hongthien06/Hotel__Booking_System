import axiosInstance from './axiosInstance'

const BASE = import.meta.env.VITE_API_URL || '/api/v1'

export const applyVoucherApi = (bookingId, voucherCode) =>
  axiosInstance.post(`${BASE}/vouchers/apply`, { bookingId, voucherCode }).then(r => r.data)

export const removeVoucherApi = (bookingId) =>
  axiosInstance.delete(`${BASE}/vouchers/booking/${bookingId}/remove`)

export const getActiveVouchersApi = () =>
  axiosInstance.get(`${BASE}/vouchers/active`).then(r => r.data)
