import axiosInstance from './axiosInstance'

export const createVnpayPaymentUrl = async (data) => {
  const response = await axiosInstance.post('/api/v1/payments/vnpay_url', data)
  return response.data
}
export const createMomoPaytUrl = async (data) => {
  const response = await axiosInstance.post('/api/v1/payments/momo/create', data)
  return response.data
}
