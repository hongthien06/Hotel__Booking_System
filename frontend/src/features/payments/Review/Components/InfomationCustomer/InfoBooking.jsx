import KingBedOutlinedIcon from '@mui/icons-material/KingBedOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import { Divider, Stack, Typography } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import { Box } from '@mui/system'
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined'
import { useTranslation } from 'react-i18next'
import { useBookingContext } from '../../../_id'

import { formatDate as formatDateShared } from '~/shared/utils/formatters'

const InfoBooking = () => {
  const { t } = useTranslation()
  const { form, booking } = useBookingContext() || {}

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return formatDateShared(dateStr)
  }

  const checkIn = booking?.checkInDate || form?.checkIn || ''
  const checkOut = booking?.checkOutDate || form?.checkOut || ''
  const nights = booking?.totalNights ?? (form ? Math.max(1, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000)) : 0)
  const numAdults = booking?.numAdults ?? form?.numAdults ?? 2
  const numChildren = booking?.numChildren ?? form?.numChildren ?? 0
  const specialRequest = booking?.specialRequest || form?.specialRequest || ''
  const totalPeople = Number(numAdults) + Number(numChildren)

  const roomOptions = [
    t('payment.room_option_connecting'),
    t('payment.room_option_upper'),
    t('payment.room_option_balcony'),
    t('payment.room_option_projector'),
    t('payment.room_option_pool_table'),
    t('payment.room_option_bed_type')
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: '550' }}>
          <KingBedOutlinedIcon />{t('payment.booking_info')}
        </Typography>
        <Typography variant='b4' sx={{ color: '#606060' }}>{t('payment.booking_info_sub')}</Typography>
      </Box>
      <Box sx={{
        padding: 3,
        backgroundColor: '#ff2fee11',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 3, sm: 4 }}
          alignItems="center"
          justifyContent="center"
          sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, width: '100%' }}
        >

          <Stack direction="row" spacing={4}>
            <Box>
              <Typography sx={{ textAlign: 'center', color: 'primary.main', fontWeight: '600', fontSize: '0.9rem', borderBottom: '2px solid #f19fb9', pb: 0.5 }}>
                Checkin
              </Typography>
              <Typography sx={{ textAlign: 'center', color: '#3f3f3f', fontWeight: '700', fontSize: { xs: '1rem', sm: '1.125rem' }, mt: 1.5 }}>
                {formatDate(checkIn)}
              </Typography>
              <Typography sx={{ textAlign: 'center', color: '#5e5e5e', fontWeight: '500', fontSize: '0.8rem' }}>
                {t('payment.checkin_from')}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ textAlign: 'center', color: 'primary.main', fontWeight: '600', fontSize: '0.9rem', borderBottom: '2px solid #f19fb9', pb: 0.5 }}>
                Checkout
              </Typography>
              <Typography sx={{ textAlign: 'center', color: '#3f3f3f', fontWeight: '700', fontSize: { xs: '1rem', sm: '1.125rem' }, mt: 1.5 }}>
                {formatDate(checkOut)}
              </Typography>
              <Typography sx={{ textAlign: 'center', color: '#5e5e5e', fontWeight: '500', fontSize: '0.8rem' }}>
                {t('payment.checkout_before')}
              </Typography>
            </Box>
          </Stack>
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
          <Stack direction="row" spacing={4}>
            <Box>
              <Typography sx={{ textAlign: 'center', color: 'primary.main', fontWeight: '600', fontSize: '0.9rem', borderBottom: '2px solid #f19fb9', pb: 0.5 }}>
                {t('payment.nights_label')}
              </Typography>
              <Typography sx={{ textAlign: 'center', color: '#3f3f3f', fontWeight: '700', fontSize: '1.25rem', mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                {nights}<DarkModeOutlinedIcon />
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ textAlign: 'center', color: 'primary.main', fontWeight: '600', fontSize: '0.9rem', borderBottom: '2px solid #f19fb9', pb: 0.5 }}>
                {t('payment.people_label')}
              </Typography>
              <Typography sx={{ textAlign: 'center', color: '#3f3f3f', fontWeight: '700', fontSize: '1.25rem', mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                {totalPeople}<PeopleOutlineOutlinedIcon />
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>

      {specialRequest && (
        <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2, border: '1px dashed #f19fb9' }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>{t('payment.special_request_label')}</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>{specialRequest}</Typography>
        </Box>
      )}

      <Box sx={{ marginTop: 1 }}>
        <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: '550' }}>
          <VerifiedOutlinedIcon />{t('payment.special_requests_title')}
        </Typography>
        <Typography variant='b4' sx={{ color: '#606060' }}>{t('payment.special_requests_sub')}</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', mt: 1 }}>
        {roomOptions.map((option, index) => (
          <FormControlLabel
            key={index}
            control={<Checkbox size="small" sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }} />}
            label={<Typography sx={{ color: '#501157', fontWeight: '600', fontSize: '0.875rem' }}>{option}</Typography>}
          />
        ))}
      </Box>
    </Box>
  )
}

export default InfoBooking
