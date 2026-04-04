import {
  Box
} from '@mui/material'
import Invoice from './Content/Invoice'
import StatusSuccess from './Content/statusSuccess'

const Complete = () => {
  const invoiceData = {
    code: 'RN-2025-08401',
    invNo: 'INV-2025-08401',
    date: '04/04/2025',
    room: 'Studio Cao Cấp Q1',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    tenant: 'Nguyễn Văn A',
    people: '2 người',
    checkIn: '01/08/2025',
    checkOut: '01/09/2025',
    items: [
      { name: 'Tiền thuê', sub: '1 tháng · Studio Cao Cấp', amount: 4500000 },
      { name: 'Tiền cọc', sub: 'Hoàn trả khi kết thúc hợp đồng', amount: 9000000 },
      { name: 'Phí dịch vụ', sub: '2% · xử lý đơn đặt phòng', amount: 200000 },
      { name: 'Khuyến mãi', sub: 'WELCOME10 · giảm 10%', amount: -450000 }
    ],
    total: 13250000,
    card: 'Mastercard ···· 3456'
  }
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', px: 2, mt: { xs: 2, md: 4 } }} >
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        width: '100%',
        maxWidth: '1000px',
        border: '0.5px solid',
        borderColor: 'divider',
        borderRadius: '16px',
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}>
        <StatusSuccess />
        <Invoice invoiceData={invoiceData} />
      </Box>
    </Box>
  )
}

export default Complete