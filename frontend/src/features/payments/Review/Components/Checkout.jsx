import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import { Alert, Box, Button, Collapse, Divider, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useBookingContext } from '../../_id'

const InfoRow = ({ label, value, bold, valueColor, sub }) => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
      <Typography variant="body2" fontWeight={bold ? 700 : 400} color={bold ? 'text.primary' : 'text.secondary'}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={bold ? 700 : 400} color={valueColor || (bold ? 'text.primary' : 'text.secondary')}>
        {value}
      </Typography>
    </Box>
    {sub && (
      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: -0.5, mb: 0.5 }}>
        {sub}
      </Typography>
    )}
  </Box>
)

const formatVND = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)

const Checkout = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [openPrice, setOpenPrice] = useState(true)
  const { room, booking, form } = useBookingContext() || {}

  const nights = booking?.totalNights ?? (form
    ? Math.max(1, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000))
    : 1)
  const numAdults = booking?.numAdults ?? form?.numAdults ?? 2
  const numChildren = booking?.numChildren ?? form?.numChildren ?? 0
  const totalPeople = Number(numAdults) + Number(numChildren)

  const pricePerNight = Number(booking?.roomPriceSnapshot || room?.pricePerNight || room?.priceDay || 0)
  const roomTotal = Number(booking?.totalAmount || pricePerNight * nights)
  const grandTotal = Number(booking?.grandTotal || roomTotal * 1.1)
  const taxFee = Math.round(grandTotal - roomTotal)

  const roomTypeName = booking?.roomTypeName || room?.roomTypeName || 'Standard'
  const roomNumber = booking?.roomNumber || room?.roomNumber || ''

  const nightUnit = t('payment.night_unit')
  const guestUnit = t('payment.guest_unit')

  const handleNext = () => {
    navigate('/payment?step=2', {
      state: { booking, room, form },
    })
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      borderRadius: '12px',
      bgcolor: 'background.paper',
      boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
      overflow: 'hidden'
    }}>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Alert
          icon={<InfoOutlinedIcon fontSize="small" />}
          severity="info"
          sx={{ borderRadius: '8px', fontSize: 13, alignItems: 'flex-start' }}
        >
          {t('payment.tax_info')}
        </Alert>
        <Box>
          <Stack
            direction="row" alignItems="center" justifyContent="space-between"
            onClick={() => setOpenPrice(p => !p)}
            sx={{ cursor: 'pointer', userSelect: 'none', mb: openPrice ? 1.5 : 0 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocalOfferIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" fontWeight={700}>{t('payment.price_details')}</Typography>
            </Stack>
            {openPrice ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </Stack>

          <Collapse in={openPrice}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <InfoRow
                label={t('payment.room_price')}
                value={formatVND(roomTotal)}
                sub={`(${nights} ${nightUnit}) ${roomTypeName}${roomNumber ? ` – ${t('payment.room')} ` + roomNumber : ''} × ${formatVND(pricePerNight)}/${nightUnit}`}
              />
              <InfoRow
                label={t('payment.num_guests')}
                value={`${numAdults} ${t('payment.adults_label')}${numChildren > 0 ? `, ${numChildren} ${t('payment.children_label')}` : ''}`}
              />
              {taxFee > 0 && (
                <InfoRow label={t('payment.tax_fee')} value={formatVND(taxFee)} />
              )}
            </Box>
            <Box sx={{
              mt: 1,
              bgcolor: '#ff2fee11',
              borderRadius: '8px',
              px: 2, py: 1.5,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <Box>
                <Typography variant="body2" fontWeight={700}>{t('payment.total')}</Typography>
                <Typography variant="caption" color="text.secondary">{nights} {nightUnit}, {totalPeople} {guestUnit}</Typography>
              </Box>
              <Typography variant="h6" fontWeight={800} color="error.main">
                {formatVND(grandTotal)}
              </Typography>
            </Box>
          </Collapse>
        </Box>

        <Divider />
        <Box>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleNext}
            sx={{
              borderRadius: '50px',
              py: 1.5,
              fontWeight: 700,
              fontSize: 16,
              color: 'white',
              textTransform: 'none',
              bgcolor: 'primary.dark',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 2px 16px rgba(0,0,0,0.08)'
              }
            }}
          >
            {t('payment.continue_btn')}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>
            {t('payment.terms_agree')}{' '}
            <Box component="span" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>{t('payment.terms_link')}</Box>
            {' '}{t('payment.and')}{' '}
            <Box component="span" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>{t('payment.privacy_link')}</Box>.
          </Typography>
        </Box>

      </Box>
    </Box>
  )
}

export default Checkout
