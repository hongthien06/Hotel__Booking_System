import {
  Box,
  Divider,
  Typography
} from '@mui/material'
import { useTranslation } from 'react-i18next'

const formatVND = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)

const InvoiceMain = ({ invoiceData }) => {
  const { t } = useTranslation()

  const roomInfoFields = [
    { k: t('payment.room_name'), v: invoiceData?.items?.[0]?.description || 'Standard' },
    { k: t('payment.address_label'), v: invoiceData?.address },
    { k: t('payment.num_guests_info'), v: invoiceData?.numGuests },
    { k: t('payment.checkin_date'), v: invoiceData?.checkInDate },
    { k: t('payment.checkout_date'), v: invoiceData?.checkOutDate }
  ]

  return (
    <Box>
      <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
        {t('payment.room_info')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
        {roomInfoFields.map(({ k, v }) => (
          <Box key={k}>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.25 }}>{k}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{v}</Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 1.5 }} />
      <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
        {t('payment.payment_details')}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 2, borderTop: '0.5px solid', borderColor: 'divider', width: '100%' }}>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            <Typography fontSize={13}>{t('payment.rental_fee')}</Typography>
            <Typography variant="caption" color="text.secondary">
              {invoiceData?.items?.length} {t('payment.room').toLowerCase()} · {invoiceData?.totalNight} {t('payment.night_unit')}
            </Typography>
          </Box>
          <Typography fontSize={13} fontWeight={500}>
            {formatVND(invoiceData?.subtotal)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            <Typography fontSize={13}>{t('payment.deposit')}</Typography>
            <Typography variant="caption" color="text.secondary">{t('payment.deposit_sub')}</Typography>
          </Box>
          <Typography fontSize={13} fontWeight={500}>0</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            <Typography fontSize={13}>{t('payment.tax_label')}</Typography>
            <Typography variant="caption" color="text.secondary">{invoiceData?.taxRate}%</Typography>
          </Box>
          <Typography fontSize={13} fontWeight={500}>
            {formatVND(invoiceData?.taxAmount)}
          </Typography>
        </Box>

        {invoiceData?.discountAmount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Box>
              <Typography fontSize={13} color="success.main">{t('payment.promotion')}</Typography>
              <Typography variant="caption" color="text.secondary">
                {invoiceData?.voucherCode ? `${t('payment.promo_code_info')}: ${invoiceData.voucherCode}` : t('payment.discount')}
              </Typography>
            </Box>
            <Typography fontSize={13} fontWeight={500} color="success.main">
              -{formatVND(invoiceData?.discountAmount)}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ borderTop: '1.5px solid', borderColor: 'divider', mt: 0.5, pt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Box>
          <Typography fontWeight={500} fontSize={13}>{t('payment.total_amount')}</Typography>
          <Typography variant="caption" color="text.secondary">
            {invoiceData?.items?.length} {t('payment.room').toLowerCase()} · {invoiceData?.totalNight} {t('payment.night_unit')}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 22, fontWeight: 500, color: '#D4537E' }}>
          {formatVND(invoiceData?.totalAmount)}
        </Typography>
      </Box>
    </Box>
  )
}

export default InvoiceMain
