import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Alert, Box, FormControlLabel, Paper, Radio, RadioGroup, Typography, Chip } from '@mui/material'
import momoLogo from '~/assets/momologo.png'
import vnpayLogo from '~/assets/vnpaylogo.png'

const PaymentMethod = ({ selectedMethod, setSelectedMethod }) => {


  const PAYMENT_METHODS = [
    {
      id: 'vnpay',
      name: 'VNPay',
      description: 'Thanh toán qua cổng VNPay (ATM, QR, Visa/Master)',
      logo: (
        <Box
          component='img'
          src={vnpayLogo}
          alt='logo'
          sx={{ width: 30, height: 30, objectFit: 'contain' }}
        />
      ),
      tags: ['ATM', 'Visa/Master'],
      color: '#005BAA',
      bg: '#e8f4fd'
    },
    {
      id: 'momo',
      name: 'MoMo',
      description: 'Ví điện tử MoMo – nhanh chóng & bảo mật',
      logo: (
        <Box
          component='img'
          src={momoLogo}
          alt='logo'
          sx={{ width: 30, height: 30, objectFit: 'contain' }}
        />
      ),
      tags: ['Ví MoMo', 'QR Code'],
      color: '#D42A87',
      bg: '#fce4ec'
    }
  ]
  const method = PAYMENT_METHODS.find((m) => m.id === selectedMethod)
  return (
    <Box>
      <Typography sx={{ fontWeight: 700, mb: 0.5, fontSize: 15 }}>
        Phương thức thanh toán
      </Typography>
      <Typography sx={{ color: '#9e9e9e', fontSize: 13, mb: 2 }}>
        Chọn cổng thanh toán bạn muốn sử dụng
      </Typography>
      <RadioGroup
        value={selectedMethod}
        onChange={(e) => setSelectedMethod(e.target.value)}
      >
        <Box sx={{ mb: 3, display: 'flex', gap: 3, flexDirection: 'column' }}>
          {PAYMENT_METHODS.map((m) => (
            <Box item key={m.id}>
              <Paper
                elevation={0}
                onClick={() => setSelectedMethod(m.id)}
                sx={{
                  p: 2,
                  display: 'block',
                  border: `2px solid ${selectedMethod === m.id ? m.color : '#f0f0f0'}`,
                  background: selectedMethod === m.id ? m.bg : '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderRadius: 3,
                  '&:hover': {
                    borderColor: m.color,
                    background: m.bg
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControlLabel
                    value={m.id}
                    control={
                      <Radio sx={{ color: m.color, '&.Mui-checked': { color: m.color }, p: 0 }} />
                    }
                    sx={{ m: 0 }}
                  />
                  {m.logo}
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                      {m.name}
                    </Typography>
                    <Typography sx={{ color: '#757575', fontSize: 12 }}>
                      {m.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75, flexWrap: 'wrap' }}>

                    </Box>
                  </Box>
                  {selectedMethod === m.id && (
                    <CheckCircleIcon sx={{ color: m.color, fontSize: 22 }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75, flexWrap: 'wrap' }}>
                  {m.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size='small'
                      sx={{
                        height: 20,
                        fontSize: 10,
                        fontWeight: 600,
                        bgcolor: `${m.color}18`,
                        color: m.color,
                        border: `1px solid ${m.color}30`
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>
      </RadioGroup>

      {selectedMethod && (
        <Alert
          severity='info'
          icon={<InfoOutlinedIcon fontSize='small' />}
          sx={{
            mb: 1,
            borderRadius: 2,
            bgcolor: method?.bg,
            color: method?.color,
            border: `1px solid ${method?.color}30`,
            fontSize: 13,
            '& .MuiAlert-icon': { color: method?.color }
          }}
        >
          {selectedMethod === 'vnpay'
            ? 'Bạn sẽ được chuyển đến cổng VNPay để hoàn tất thanh toán. Hỗ trợ ATM nội địa, Visa, Mastercard.'
            : 'Bạn sẽ được chuyển đến ứng dụng MoMo hoặc quét mã QR để hoàn tất thanh toán.'}
        </Alert>
      )}
    </Box>
  )
}

export default PaymentMethod