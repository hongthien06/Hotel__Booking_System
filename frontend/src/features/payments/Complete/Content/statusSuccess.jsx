
import CheckIcon from '@mui/icons-material/Check'
import DownloadIcon from '@mui/icons-material/Download'
import { Box, Button, Stack, Typography } from '@mui/material'

const StatusSuccess = () => {
  return (
    <Box sx={{
      width: { xs: '100%', sm: 280 },
      flexShrink: 0,
      borderRight: { xs: 'none', sm: '0.5px solid' },
      borderBottom: { xs: '0.5px solid', sm: 'none' },
      borderColor: 'divider',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: 2.5, md: 4 },
      gap: 2
    }}>
      <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#57ff5760', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: '#1ace23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckIcon sx={{ color: 'white', fontSize: 26 }} />
        </Box>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography fontWeight={500} fontSize={16} lineHeight={1.4}>Đặt phòng thành công!</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mt={0.75} lineHeight={1.6}>
          Hóa đơn đã được gửi về email của bạn. Chủ nhà sẽ xác nhận trong vòng 24 giờ.
        </Typography>
      </Box>

      <Box sx={{ width: '100%', bgcolor: '#57ff5760', borderRadius: '8px', p: 1.5, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 12, fontWeight: '500', color: '#124c09', mb: 0.25 }}>Mã đặt phòng</Typography>
        <Typography sx={{ fontSize: 15, fontWeight: '600', color: '#124c09', letterSpacing: 1 }}>RN-2025-08401</Typography>
      </Box>

      <Stack spacing={1} width="100%" mt={0.5}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<DownloadIcon />}
          sx={{ bgcolor: '#c91832', '&:hover': { boxShadow: 'none' }, borderRadius: '10px', textTransform: 'none', fontWeight: 500, boxShadow: 'none' }}
        >
          Tải hóa đơn PDF
        </Button>
        <Button
          variant="outlined"
          fullWidth
          sx={{ borderRadius: '10px', textTransform: 'none', color: 'text.secondary', borderColor: 'divider', '&:hover': { bgcolor: 'grey.50' } }}
        >
          Xem phòng của tôi
        </Button>
      </Stack>
    </Box>
  )
}

export default StatusSuccess
