import axiosInstance from './axiosInstance'

export const createPaymentUrl = async (data) => {
  const response = await axiosInstance.post('/api/v1/payments/create', data)
  return response.data
}

