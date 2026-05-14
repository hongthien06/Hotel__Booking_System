import {
  Box, Button
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createPaymentUrl } from '~/shared/api/paymentApi'
import { useBookingContext } from '../../_id'
import Discount from './Discount/Discount'
import Brand from './Info/Brand'
import PaymentMethod from './Info/PaymentMethod'

const Info = () => {
  const [selectedMethod, setSelectedMethod] = useState('VNPAY')
  const { booking, voucherData } = useBookingContext() || {}
  const { t, i18n } = useTranslation()

  const handleNext = async () => {
    const bookingCode = booking?.bookingCode
    const amount = voucherData
      ? Number(voucherData.finalAmount)
      : Number(booking?.grandTotal || booking?.totalAmount || 0)

    const payload = {
      bookingCode,
      amount,
      gateway: selectedMethod,
      language: i18n.language || 'vi'
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
        sx={{ borderRadius: '12px', py: 1.5, fontWeight: 600, fontSize: 15, background: '#c02860ff', color: '#fff', boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>
        {t('payment.pay_now')}
      </Button>
    </Box>
  )
}

export default Info
