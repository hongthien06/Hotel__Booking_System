import {
  Box, Button
} from '@mui/material'
import { useState } from 'react'
import { createPaymentUrl } from '~/shared/api/paymentApi'
import { useBookingContext } from '../../_id'
import Discount from './Discount/Discount'
import Brand from './Info/Brand'
import PaymentMethod from './Info/PaymentMethod'

const Info = () => {
  const [selectedMethod, setSelectedMethod] = useState('VNPAY')
  const { booking, voucherData } = useBookingContext() || {}

  const handleNext = async () => {
    const bookingCode = booking?.bookingCode
    // Nếu đã áp voucher thì dùng finalAmount, không thì dùng grandTotal gốc
    const amount = voucherData
      ? Number(voucherData.finalAmount)
      : Number(booking?.grandTotal || booking?.totalAmount || 0)

    const payload = {
      bookingCode,
      amount,
      gateway: selectedMethod
    }
    const { paymnent_url } = await createPaymentUrl(payload)
    window.location.href = paymnent_url
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Brand />
      <PaymentMethod selectedMethod={selectedMethod} setSelectedMethod={setSelectedMethod} />
      <Discount />
      <Button fullWidth variant='contained' size='large' onClick={handleNext}
        sx={{ borderRadius: '12px', py: 1.5, fontWeight: 600, fontSize: 15, textTransform: 'none', background: 'linear-gradient(90deg,#f472b6,#ec4899)', boxShadow: 'none', '&:hover': { boxShadow: 'none', opacity: 0.9 } }}>
        Thanh toán ngay
      </Button>
    </Box>
  )
}

export default Info
