import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import { Alert, Box, Button, Collapse, Divider, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const InfoRow = ({ label, value, bold, valueColor, sub }) => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
      <Typography variant="body2" fontWeight={bold ? 700 : 400} color={bold ? 'text.primary' : 'text.secondary'}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={bold ? 700 : 400} color={valueColor || (bold ? 'text.primary' : 'text.secondary')}>
        {value}
      </Typography>
    </Box>
    {sub && (
      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: -0.5, mb: 0.5 }}>
        {sub}
      </Typography>
    )}
  </Box>
)

const InfomationRental = () => {
  const navigate = useNavigate()
  const [openPrice, setOpenPrice] = useState(true)
  const handleNext = async () => {
    navigate('/payment/?step=2')
  }
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
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Alert
          icon={<InfoOutlinedIcon fontSize="small" />}
          severity="info"
          sx={{ borderRadius: '8px', fontSize: 13, alignItems: 'flex-start' }}
        >
          Thuế và phí là các khoản được chuyển trả cho chủ nhà. Mọi thắc mắc vui lòng liên hệ bộ phận hỗ trợ để được giải đáp.
        </Alert>
        <Box>
          <Stack
            direction="row" alignItems="center" justifyContent="space-between"
            onClick={() => setOpenPrice(p => !p)}
            sx={{ cursor: 'pointer', userSelect: 'none', mb: openPrice ? 1.5 : 0 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocalOfferIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" fontWeight={700}>Chi tiết giá</Typography>
            </Stack>
            {openPrice ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </Stack>

          <Collapse in={openPrice}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <InfoRow
                label="Giá phòng"
                value="4.500.000 đ"
                sub="(1x) Studio Cao Cấp – Giá cơ bản (1 tháng)"
              />
              <InfoRow label="Tiền cọc" value="9.000.000 đ" sub="Tương đương 2 tháng tiền thuê" />
              <InfoRow label="Thuế và phí dịch vụ" value="200.000 đ" />
            </Box>
            <Box sx={{
              mt: 1,
              bgcolor: '#ff2fee11',
              borderRadius: '8px',
              px: 2, py: 1.5,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <Box>
                <Typography variant="body2" fontWeight={700}>Tổng cộng</Typography>
                <Typography variant="caption" color="text.secondary">1 phòng, 1 tháng</Typography>
              </Box>
              <Typography variant="h6" fontWeight={800} color="error.main">
                13.700.000vnd
              </Typography>
            </Box>
          </Collapse>
        </Box>

        <Divider />
        <Box>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleNext}
            sx={{
              borderRadius: '50px',
              py: 1.5,
              fontWeight: 700,
              fontSize: 16,
              color: 'white',
              textTransform: 'none',
              bgcolor: 'primary.light',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: 'primary.main',
                boxShadow: '0 2px 16px rgba(0,0,0,0.08)'
              }
            }}
          >
            Tiếp tục
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>
            Bằng cách tiến hành thanh toán, bạn đã đồng ý với{' '}
            <Box component="span" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>Điều khoản và Điều kiện</Box>
            {' '}và{' '}
            <Box component="span" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>Chính sách Bảo mật</Box>.
          </Typography>
        </Box>

      </Box>
    </Box>
  )
}

export default InfomationRental