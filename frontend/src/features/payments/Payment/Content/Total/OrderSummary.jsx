import {
  Box,
  Stack,
  Typography, Collapse
} from '@mui/material'

const OrderSummary = () => (
  <Box sx={{ border: '0.5px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden' }}>
    {[
      { label: 'Mã đơn', value: '#RN2025084' },
      { label: 'Tiền thuê', value: '4.500.000 đ' },
      { label: 'Tiền cọc', value: '9.000.000 đ' },
      { label: 'Phí dịch vụ (2%)', value: '200.000 đ' }
    ].map(({ label, value }) => (
      <Stack key={label} direction="row" justifyContent="space-between" sx={{ px: 2, py: 1.25, borderBottom: '0.5px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="caption" fontWeight={500}>{value}</Typography>
      </Stack>
    ))}

    <Collapse in={true}>
      <Stack direction="row" justifyContent="space-between"
        sx={{ px: 2, py: 1.25, borderBottom: '0.5px solid', borderColor: 'divider', bgcolor: '#fdf2f8' }}>
        <Typography variant="caption" sx={{ color: '#be185d' }}>Khuyến mãi</Typography>
        <Typography variant="caption" fontWeight={500} sx={{ color: '#be185d' }}>200 000 đ</Typography>
      </Stack>
    </Collapse>

    <Box sx={{ bgcolor: 'grey.50', px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">Tổng thanh toán</Typography>
        <Typography variant="caption" color="text.secondary">1 phòng · 1 tháng</Typography>
      </Box>
      <Typography variant="h6" fontWeight={700} sx={{ color: '#ec4899' }}>13.700.000 đ</Typography>
    </Box>

  </Box>
)

export default OrderSummary