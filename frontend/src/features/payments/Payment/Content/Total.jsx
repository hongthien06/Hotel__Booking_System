import CardVisual from './Total/CardVisual'
import OrderSummary from './Total/OrderSummary'
import { Box, Typography } from '@mui/material'

const Total = ({ card }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 2 }}>
      <CardVisual number={card.join('')} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <OrderSummary />
        <Typography variant="caption" color="text.secondary" textAlign="center" lineHeight={1.6}>
          Bằng cách thanh toán, bạn đồng ý với{' '}
          <Box component="span" sx={{ color: '#ec4899', textDecoration: 'underline', cursor: 'pointer' }}>Điều khoản dịch vụ</Box>
          {' '}và{' '}
          <Box component="span" sx={{ color: '#ec4899', textDecoration: 'underline', cursor: 'pointer' }}>Chính sách bảo mật</Box>.
        </Typography>
      </Box>

    </Box>
  )
}

export default Total