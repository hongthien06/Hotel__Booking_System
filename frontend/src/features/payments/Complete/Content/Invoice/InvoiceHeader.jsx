import {
  Box,
  Chip,
  Stack,
  Typography
} from '@mui/material'

const InvoiceHeader = ({ invoiceData }) => {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
        <Box>
          <Typography fontWeight={500} fontSize={15}>Hóa đơn thuê phòng</Typography>
          <Typography variant="caption" color="text.secondary">
            Ngày lập: {invoiceData.date} · #{invoiceData.invNo}
          </Typography>
        </Box>
        <Chip label="Đã thanh toán" size="small" sx={{ bgcolor: '#62ff5d68', color: '#36730a', border: '0.5px solid #C0DD97', fontWeight: 500, fontSize: 11 }} />
      </Stack>
    </Box>
  )
}

export default InvoiceHeader