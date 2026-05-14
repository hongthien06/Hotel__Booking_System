import {
  Box,
  Stack,
  Typography
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useBookingContext } from '../../../_id'

const formatVND = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)

const OrderSummary = () => {
  const { t } = useTranslation()
  const { booking, room, form, voucherData } = useBookingContext() || {}

  const bookingCode = booking?.bookingCode || '—'
  const nights = booking?.totalNights ?? (form
    ? Math.max(1, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000))
    : 1)
  const numAdults = booking?.numAdults ?? form?.numAdults ?? 2
  const numChildren = booking?.numChildren ?? form?.numChildren ?? 0
  const pricePerNight = Number(booking?.roomPriceSnapshot || room?.pricePerNight || room?.priceDay || 0)
  const roomTotal = Number(booking?.totalAmount || pricePerNight * nights)
  const serviceTotal = Number(booking?.serviceTotal || 0)
  const taxFee = Math.max(0, Number(booking?.grandTotal || roomTotal) - roomTotal - serviceTotal)
  const roomTypeName = booking?.roomTypeName || room?.roomTypeName || 'Standard'
  const roomNumber = booking?.roomNumber || room?.roomNumber || ''

  const originalTotal = Number(booking?.grandTotal || roomTotal)
  const discountAmount = voucherData ? Number(voucherData.discountAmount) : 0
  const finalTotal = voucherData ? Number(voucherData.finalAmount) : originalTotal

  const nightUnit = t('payment.night_unit')
  const guestUnit = t('payment.guest_unit')

  const rows = [
    { label: t('payment.booking_code'), value: bookingCode },
    {
      label: `${t('payment.room_fee')} (${nights} ${nightUnit})`,
      value: formatVND(roomTotal),
      sub: `${roomTypeName}${roomNumber ? ` – ${t('payment.room')} ` + roomNumber : ''} · ${formatVND(pricePerNight)}/${nightUnit}`
    },
    {
      label: t('payment.guests_label'),
      value: `${numAdults} ${t('payment.adults_label')}${numChildren > 0 ? `, ${numChildren} ${t('payment.children_label')}` : ''}`
    },
    ...(serviceTotal > 0 ? [{ label: t('payment.extra_services'), value: formatVND(serviceTotal) }] : []),
    ...(taxFee > 0 ? [{ label: t('payment.tax_and_fees'), value: formatVND(taxFee) }] : []),
  ]

  return (
    <Box sx={{ border: '0.5px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden' }}>
      {rows.map(({ label, value, sub }) => (
        <Stack key={label} direction="row" justifyContent="space-between" alignItems="flex-start"
          sx={{ px: 2, py: 1.25, borderBottom: '0.5px solid', borderColor: 'divider' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            {sub && <Typography variant="caption" color="text.disabled" display="block">{sub}</Typography>}
          </Box>
          <Typography variant="caption" fontWeight={500} sx={{ flexShrink: 0, ml: 1 }}>{value}</Typography>
        </Stack>
      ))}

      {discountAmount > 0 && (
        <Stack direction="row" justifyContent="space-between" alignItems="center"
          sx={{ px: 2, py: 1.25, borderBottom: '0.5px solid', borderColor: 'divider', bgcolor: '#fdf2f8' }}>
          <Typography variant="caption" color="#be185d" fontWeight={500}>
            {t('payment.discount')} ({voucherData?.voucherCode})
          </Typography>
          <Typography variant="caption" fontWeight={700} color="#be185d">
            − {formatVND(discountAmount)}
          </Typography>
        </Stack>
      )}

      <Box sx={{ bgcolor: 'grey.50', px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">{t('payment.total_payment')}</Typography>
          <Typography variant="caption" color="text.secondary">{nights} {nightUnit} · {Number(numAdults) + Number(numChildren)} {guestUnit}</Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          {discountAmount > 0 && (
            <Typography variant="caption" color="text.disabled" sx={{ textDecoration: 'line-through', display: 'block' }}>
              {formatVND(originalTotal)}
            </Typography>
          )}
          <Typography variant="h6" fontWeight={700} sx={{ color: '#ec4899' }}>{formatVND(finalTotal)}</Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default OrderSummary
