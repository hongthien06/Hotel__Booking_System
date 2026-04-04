import LocationOnIcon from '@mui/icons-material/LocationOn'
import StarIcon from '@mui/icons-material/Star'
import {
  Box,
  Chip,
  Stack,
  Typography
} from '@mui/material'

const amenities = ['Điều hòa', 'Nội thất đầy đủ', 'Wifi miễn phí', 'Bảo vệ 24/7']

const InfomationRental = () => {
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
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900"
          alt="Ảnh phòng"
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        {/* Tên + Địa chỉ */}
        <Box>
          <Typography variant="h6" fontWeight={700}>Phòng Studio Cao Cấp Q1</Typography>

          {/* Địa chỉ + Đánh giá cùng hàng */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mt={0.5}>
            <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary">
              <LocationOnIcon fontSize="small" />
              <Typography variant="body2">123 Nguyễn Huệ, Quận 1, TP.HCM</Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <StarIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
              <Typography variant="body2" fontWeight={600}>4.8</Typography>
              <Typography variant="body2" color="text.secondary">· 32 đánh giá</Typography>
            </Stack>
          </Stack>
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