import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import { Alert, Box, Button, Chip, Collapse, Divider, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '~/shared/utils/formatters'
import { useBookingContext } from '../../_id'
import { getBookingTotals } from '../../utils/bookingTotals'

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

const formatVND = (n) => formatCurrency(n)

const Checkout = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [openPrice, setOpenPrice] = useState(true)
  const { room, booking, form } = useBookingContext() || {}
  const totals = getBookingTotals(booking, room)

  const nights = booking?.totalNights ?? (form
    ? Math.max(1, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000))
    : 1)
  const numAdults = booking?.numAdults ?? form?.numAdults ?? 2
  const numChildren = booking?.numChildren ?? form?.numChildren ?? 0
  const totalPeople = Number(numAdults) + Number(numChildren)

  const roomTotal = totals.roomTotal
  const taxFee = totals.taxFee
  const grandTotal = totals.originalTotal

  // Membership / group / holiday discount fields
  const holidayMultiplier = Number(booking?.holidayMultiplier || 1)
  const holidayName = booking?.holidayPeriodName
  const membershipDiscountAmt = Number(booking?.membershipDiscountAmt || 0)
  const membershipDiscountPct = Number(booking?.membershipDiscountPct || 0)
  const groupDiscountAmt = Number(booking?.groupDiscountAmt || 0)
  const groupDiscountPct = Number(booking?.groupDiscountPct || 0)
  const isFirstBooking = booking?.isFirstBookingDiscount
  const totalDiscount = Number(booking?.discountAmount || membershipDiscountAmt + groupDiscountAmt)
  const finalAmount = Math.max(0, grandTotal - totalDiscount)

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
                sub={`${totals.rooms.length} ${t('payment.room').toLowerCase()} · (${nights} ${nightUnit})`}
              />
              {totals.rooms.map(item => (
                <InfoRow
                  key={item.roomId}
                  label={`${t('payment.room')} ${item.roomNumber}`}
                  value={formatVND(item.subtotal)}
                  sub={`${item.roomTypeName || 'Standard'} · ${item.hotelName || ''}${item.hotelAddress ? ` · ${item.hotelAddress}` : ''} · ${formatVND(item.roomPriceSnapshot)}/${nightUnit}`}
                />
              ))}

              {/* Holiday multiplier badge */}
              {holidayMultiplier > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography variant="body2" color="#b45309">🎉 {t('membership.holiday_price')}</Typography>
                    {holidayName && (
                      <Chip label={holidayName} size="small" sx={{ bgcolor: '#fef3c7', color: '#b45309', fontSize: 10, height: 18 }} />
                    )}
                  </Stack>
                  <Chip label={`×${holidayMultiplier}`} size="small" sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700 }} />
                </Box>
              )}

              <InfoRow
                label={t('payment.num_guests')}
                value={`${numAdults} ${t('payment.adults_label')}${numChildren > 0 ? `, ${numChildren} ${t('payment.children_label')}` : ''}`}
              />

              {taxFee > 0 && (
                <InfoRow label={t('payment.tax_fee')} value={formatVND(taxFee)} />
              )}

              {/* Membership discount row */}
              {membershipDiscountAmt > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
                  <Typography variant="body2" color="#be185d">
                    {isFirstBooking
                      ? `${t('membership.first_booking_discount')} (-${membershipDiscountPct}%)`
                      : ` ${t('membership.tier_discount')} (-${membershipDiscountPct}%)`}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#be185d">
                    -{formatVND(membershipDiscountAmt)}
                  </Typography>
                </Box>
              )}

              {/* Group discount row */}
              {groupDiscountAmt > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
                  <Typography variant="body2" color="#16a34a">
                    👥 {t('membership.group_discount')} (-{groupDiscountPct}%)
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#16a34a">
                    -{formatVND(groupDiscountAmt)}
                  </Typography>
                </Box>
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
              <Box sx={{ textAlign: 'right' }}>
                {totalDiscount > 0 && (
                  <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.disabled', display: 'block' }}>
                    {formatVND(grandTotal)}
                  </Typography>
                )}
                <Typography variant="h6" fontWeight={800} color="error.main">
                  {formatVND(totalDiscount > 0 ? finalAmount : grandTotal)}
                </Typography>
              </Box>
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
