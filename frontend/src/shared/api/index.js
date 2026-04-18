import axios from 'axios'

export const createVnpayPaymentUrl = async (data) => {
  const response = await axios.post('/api/v1/payments/vnpay_url', data)
  return response.data
}
export const createMomoPaytUrl = async (data) => {
  const response = await axios.post('/api/v1/payments/momo/create', data)
  return response.data
}
