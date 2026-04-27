import {
  Box,
  Typography
} from '@mui/material'

const InvoiceFooter = () => {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, pt: 1.5, borderTop: '0.5px solid', borderColor: 'divider', lineHeight: 1.6, display: 'block' }}>
        Giao dịch được mã hóa và bảo mật.{' '}
        Mọi thắc mắc vui lòng liên hệ{' '}
        <Box component="span" sx={{ color: '#D4537E' }}>support@rentnow.vn</Box>
      </Typography>
    </Box>
  )
}

export default InvoiceFooter