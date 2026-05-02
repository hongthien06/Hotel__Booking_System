import LocationOnIcon from '@mui/icons-material/LocationOn'
import StarIcon from '@mui/icons-material/Star'
import {
  Box,
  Chip,
  Skeleton,
  Stack,
  Typography
} from '@mui/material'
import { useBookingContext } from '../../_id'

const amenities = ['Điều hòa', 'Nội thất đầy đủ', 'Wifi miễn phí', 'Bảo vệ 24/7']

const InfomationRental = () => {
  const { room, booking } = useBookingContext() || {}

  // booking = BookingDTO from backend, room = room object from BookingPage
  const roomNumber = booking?.roomNumber || room?.roomNumber || '—'
  const roomType = booking?.roomTypeName || room?.roomTypeName || 'Standard'
  const province = room?.province || 'Việt Nam'
  const bedType = room?.bedType || ''
  const image = room?.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900'

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

      {/* ── Ảnh phòng ── */}
      <Box sx={{ position: 'relative', height: 260, bgcolor: 'grey.200' }}>
        {hasData ? (
          <Box
            component="img"
            src={image}
            alt="Ảnh phòng"
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Skeleton variant="rectangular" width="100%" height={260} />
        )}
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        {/* Tên + Địa chỉ */}
        <Box>
          {hasData ? (
            <>
              <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                <Chip label={roomType} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                {bedType && <Chip label={bedType} size="small" variant="outlined" sx={{ fontWeight: 600 }} />}
              </Stack>
              <Typography variant="h6" fontWeight={700}>Phòng {roomNumber}</Typography>

              <Stack direction="row" alignItems="center" justifyContent="space-between" mt={0.5}>
                <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary">
                  <LocationOnIcon fontSize="small" />
                  <Typography variant="body2">{province}</Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <StarIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                  <Typography variant="body2" fontWeight={600}>5.0</Typography>
                  <Typography variant="body2" color="text.secondary">· Khách sạn</Typography>
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
            <Chip key={a} label={a} size="small" variant="outlined" color="primary" sx={{ fontWeight: '600', padding: '6px 8px' }} />
          ))}
        </Box>

      </Box>
    </Box>
  )
}

export default InfomationRental