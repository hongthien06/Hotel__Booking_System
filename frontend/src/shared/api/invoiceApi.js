import axiosInstance from './axiosInstance'

export const getInvoiceByBookingIdAPI = async (bookingId) => {
  const response = await axiosInstance.get(`/api/v1/invoices/booking/${bookingId}`)
  return response.data
}

export const downloadInvoicePdfApi = async (invoiceId) => {
  const response = await axiosInstance.get(`/api/v1/invoices/${invoiceId}/pdf`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'invoice.pdf')
  document.body.appendChild(link)
  link.click()
  link.remove()
}
