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
          { k: 'Số người ở', v: invoiceData.numGuests },
          { k: 'Ngày nhận phòng', v: invoiceData.checkInDate },
          { k: 'Ngày trả phòng', v: invoiceData.checkOutDate }
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

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          py: 2,
          borderTop: '0.5px solid',
          borderColor: 'divider',
          width: '100%'
        }}
      >

        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            <Typography fontSize={13}>Tiền thuê</Typography>
            <Typography variant="caption" color="text.secondary">
              {invoiceData?.items?.length} phòng · {invoiceData?.totalNight} đêm
            </Typography>
          </Box>
          <Typography fontSize={13} fontWeight={500}>
            {invoiceData?.subtotal}
          </Typography>
        </Box>


        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            <Typography fontSize={13}>Tiền cọc</Typography>
            <Typography variant="caption" color="text.secondary">
              Hoàn trả khi checkout
            </Typography>
          </Box>
          <Typography fontSize={13} fontWeight={500}>
            0
          </Typography>
        </Box>


        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            <Typography fontSize={13}>Tiền thuế</Typography>
            <Typography variant="caption" color="text.secondary">
              {invoiceData?.taxRate}%
            </Typography>
          </Box>
          <Typography fontSize={13} fontWeight={500}>
            {invoiceData?.taxAmount}
          </Typography>
        </Box>


        {invoiceData?.discountAmount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Box>
              <Typography fontSize={13}>Khuyến mãi</Typography>
              <Typography variant="caption" color="text.secondary">
                Bạn được giảm
              </Typography>
            </Box>
            <Typography fontSize={13} fontWeight={500} color="success.main">
              -{invoiceData?.discountAmount}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ borderTop: '1.5px solid', borderColor: 'divider', mt: 0.5, pt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Box>
          <Typography fontWeight={500} fontSize={13}>Tổng thanh toán</Typography>
          <Typography variant="caption" color="text.secondary">${invoiceData?.items?.length} phòng · ${invoiceData.totalNight} đêm</Typography>
        </Box>
        <Typography sx={{ fontSize: 22, fontWeight: 500, color: '#D4537E' }}>${invoiceData.totalAmount}</Typography>
      </Box>
    </Box >
  )
}

export default InvoiceMain