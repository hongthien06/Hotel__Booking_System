import LocationOnIcon from '@mui/icons-material/LocationOn'
import StarIcon from '@mui/icons-material/Star'
import {
  Box,
  Chip,
  Skeleton,
  Stack,
  Typography
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useBookingContext } from '../../_id'
import { getBookingRooms } from '../../utils/bookingTotals'

const InfomationRental = () => {
  const { t } = useTranslation()
  const { room, booking } = useBookingContext() || {}
  const rooms = getBookingRooms(booking, room)

  const amenities = [
    t('payment.amenity_ac'),
    t('payment.amenity_furniture'),
    t('payment.amenity_wifi'),
    t('payment.amenity_security')
  ]

  const primaryRoom = rooms[0] || {}
  const roomNumber = rooms.length > 1 ? `${rooms.length} ${t('booking_page.room').toLowerCase()}` : (primaryRoom.roomNumber || '—')
  const roomType = rooms.length > 1 ? 'Multi-room' : (primaryRoom.roomTypeName || room?.roomTypeName || 'Standard')
  const province = room?.province || 'Việt Nam'
  const bedType = room?.bedType || ''
  const image = room?.image || 'https://th.bing.com/th/id/R.c408cfc76663c46d63280d6a54759ed8?rik=rQg9LEDEfRjGDw&riu=http%3a%2f%2fafrodistributors.co.zw%2fimg%2froom-1.jpg&ehk=sO%2bOAUr6Mx4DY%2feIMHXeTjrY%2fr4t3UXN3%2b70RHgv3%2fE%3d&risl=&pid=ImgRaw&r=0'

  const hasData = !!(room || booking)

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

      <Box sx={{ position: 'relative', height: 260, bgcolor: 'grey.200' }}>
        {hasData ? (
          <Box
            component="img"
            src={image}
            alt="room"
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Skeleton variant="rectangular" width="100%" height={260} />
        )}
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        <Box>
          {hasData ? (
            <>
              <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                <Chip label={roomType} size="small" color="primary.dark" variant="outlined" sx={{ fontWeight: 700 }} />
                {bedType && <Chip label={bedType} size="small" variant="outlined" sx={{ fontWeight: 600 }} />}
              </Stack>
              <Typography variant="h6" fontWeight={700}>{t('payment.room')} {roomNumber}</Typography>
              <Stack spacing={1.25} mt={1.5}>
                {rooms.map((item, index) => (
                  <Box key={item.roomId || index} sx={{ p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#fafafa' }}>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {t('payment.room')} {item.roomNumber} · {item.roomTypeName || 'Standard'}
                    </Typography>
                    {item.hotelName && (
                      <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
                        {item.hotelName}
                      </Typography>
                    )}
                    {item.hotelAddress && (
                      <Stack direction="row" spacing={0.5} alignItems="flex-start" mt={0.5}>
                        <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary', mt: '2px' }} />
                        <Typography variant="caption" color="text.secondary">
                          {item.hotelAddress}
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                ))}
              </Stack>

              <Stack direction="row" alignItems="center" justifyContent="space-between" mt={0.5}>
                <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary">
                  <LocationOnIcon fontSize="small" />
                  <Typography variant="body2">{province}</Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <StarIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                  <Typography variant="body2" fontWeight={600}>5.0</Typography>
                  <Typography variant="body2" color="text.secondary">· {t('payment.hotel')}</Typography>
                </Stack>
              </Stack>
            </>
          ) : (
            <>
              <Skeleton width="60%" height={28} />
              <Skeleton width="80%" height={20} sx={{ mt: 0.5 }} />
            </>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {amenities.map((a) => (
            <Chip key={a} label={a} size="small" variant="outlined" sx={{ fontWeight: '600', padding: '6px 8px', color: '#c02860ff' }} />
          ))}
        </Box>

      </Box>
    </Box>
  )
}

export default InfomationRental
