import {
  Box, Button
} from '@mui/material'
import { createPaymentUrl } from '~/shared/api/paymentApi'
import Discount from './Discount/Discount'
import Brand from './Info/Brand'
import PaymentMethod from './Info/PaymentMethod'
import { useState } from 'react'

const Info = () => {
  const [selectedMethod, setSelectedMethod] = useState('vnpay')
  const handleNext = async () => {

    const payloadTest = {
      'bookingId': 7,
      'amount': 850000,
      'gateway': selectedMethod
    }
    const { paymnent_url } = await createPaymentUrl(payloadTest)
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