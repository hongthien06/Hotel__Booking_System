import { Box, Chip, Stack, Typography } from '@mui/material'
import { EmojiEvents, Celebration, Groups, Event } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '~/shared/utils/formatters'
import { useBookingContext } from '../../_id'

const fmtVND = (n) => formatCurrency(n)

const DiscountBadge = ({ icon, label, value, color, bgColor, borderColor }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    px: 1.5, py: 1,
    bgcolor: bgColor || '#fdf2f8',
    border: `1px dashed ${borderColor || '#f9a8d4'}`,
    borderRadius: '10px',
    mb: 0.75
  }}>
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box sx={{
        width: 24, height: 24, borderRadius: '50%',
        bgcolor: color || '#ec4899',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: color || '#be185d' }}>
        {label}
      </Typography>
    </Stack>
    {value && (
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: color || '#be185d' }}>
        -{fmtVND(value)}
      </Typography>
    )}
  </Box>
)

const MembershipDiscount = () => {
  const { t } = useTranslation()
  const { booking } = useBookingContext() || {}

  const membershipDiscountAmt = Number(booking?.membershipDiscountAmt || 0)
  const groupDiscountAmt = Number(booking?.groupDiscountAmt || 0)
  const holidayMultiplier = Number(booking?.holidayMultiplier || 1)
  const isFirstBooking = booking?.isFirstBookingDiscount
  const membershipPct = Number(booking?.membershipDiscountPct || 0)
  const groupPct = Number(booking?.groupDiscountPct || 0)
  const holidayName = booking?.holidayPeriodName
  const guestCount = booking?.guestCount || 1

  const hasAnyDiscount = membershipDiscountAmt > 0 || groupDiscountAmt > 0
  const isHoliday = holidayMultiplier > 1

  if (!hasAnyDiscount && !isHoliday) return null

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={0.75} mb={1}>
        <EmojiEvents sx={{ fontSize: 14, color: '#ec4899' }} />
        <Typography variant="body2" fontWeight={500}>{t('membership.discount_applied')}</Typography>
      </Stack>

      {/* Holiday price notice */}
      {isHoliday && (
        <DiscountBadge
          icon={<Event sx={{ fontSize: 12, color: 'white' }} />}
          label={`${t('membership.holiday_price')}: ×${holidayMultiplier}${holidayName ? ` (${holidayName})` : ''}`}
          color="#f59e0b"
          bgColor="#fffbeb"
          borderColor="#fde68a"
        />
      )}

      {/* Membership discount */}
      {membershipDiscountAmt > 0 && (
        <DiscountBadge
          icon={<EmojiEvents sx={{ fontSize: 12, color: 'white' }} />}
          label={isFirstBooking
            ? `${t('membership.first_booking_discount')} (-${membershipPct}%)`
            : `${t('membership.tier_discount')} (-${membershipPct}%)`}
          value={membershipDiscountAmt}
          color="#be185d"
          bgColor="#fdf2f8"
          borderColor="#f9a8d4"
        />
      )}

      {/* Group discount */}
      {groupDiscountAmt > 0 && (
        <DiscountBadge
          icon={<Groups sx={{ fontSize: 12, color: 'white' }} />}
          label={`${t('membership.group_discount')} ${guestCount} ${t('membership.guests')} (-${groupPct}%)`}
          value={groupDiscountAmt}
          color="#16a34a"
          bgColor="#f0fdf4"
          borderColor="#bbf7d0"
        />
      )}
    </Box>
  )
}

export default MembershipDiscount
