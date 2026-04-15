import axios from 'axios'

export const createVnpayPaymentUrl = async (data) => {
  const response = await axios.post('/api/v1/payments/vnpay_url', data)
  return response.data
}
