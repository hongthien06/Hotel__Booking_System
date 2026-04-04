import {
  Box,
  Divider,
  Typography
} from '@mui/material'
const InvoiceMain = ({ invoiceData }) => {
  return (
    <Box>
      <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
        Thông tin phòng
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
        {[
          { k: 'Tên phòng', v: invoiceData.room },
          { k: 'Địa chỉ', v: invoiceData.address },
          { k: 'Người thuê', v: invoiceData.tenant },
          { k: 'Số người ở', v: invoiceData.people },
          { k: 'Ngày nhận phòng', v: invoiceData.checkIn },
          { k: 'Ngày trả phòng', v: invoiceData.checkOut }
        ].map(({ k, v }) => (
          <Box key={k}>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.25 }}>{k}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{v}</Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 1.5 }} />
      <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
        Chi tiết thanh toán
      </Typography>

      <Box>
        {invoiceData.items.map(({ name, sub, amount }, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 1, borderTop: i > 0 ? '0.5px solid' : 'none', borderColor: 'divider' }}>
            <Box>
              <Typography fontSize={13}>{name}</Typography>
              <Typography variant="caption" color="text.secondary">{sub}</Typography>
            </Box>
            <Typography fontSize={13} fontWeight={500} color={amount < 0 ? '#993556' : 'text.primary'}>
              {amount < 0 ? '-' : ''}{2831327}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ borderTop: '1.5px solid', borderColor: 'divider', mt: 0.5, pt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Box>
          <Typography fontWeight={500} fontSize={13}>Tổng thanh toán</Typography>
          <Typography variant="caption" color="text.secondary">1 phòng · 1 tháng</Typography>
        </Box>
        <Typography sx={{ fontSize: 22, fontWeight: 500, color: '#D4537E' }}>{378382}</Typography>
      </Box>
    </Box>
  )
}

export default InvoiceMain