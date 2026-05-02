import axiosInstance from './axiosInstance'

export const createPaymentUrl = async (data) => {
  const response = await axiosInstance.post('/api/v1/payments/create', data)
  return response.data
}

export const processVNPayReturnApi = async (queryString) => {
  const response = await axiosInstance.get(`/api/v1/payments/vnpay_ipn${queryString}`)
  return response.data
}

