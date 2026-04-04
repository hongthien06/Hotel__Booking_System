import {
  Box, Button
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Brand from './Info/Brand'
import CardNumber from './Info/CardNumber'
import CVV_EXP_OTP from './Info/CVV_EXP_OTP'

import Discount from './Discount/Discount'

const Info = ({ card, setCard }) => {
  const navigate = useNavigate()
  const handleNext = () => {
    navigate('/payment/?step=3')
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Brand />
      <CardNumber card={card} setCard={setCard} />
      <CVV_EXP_OTP />
      <Discount />
      <Button fullWidth variant="contained" size="large" onClick={handleNext}
        sx={{ borderRadius: '12px', py: 1.5, fontWeight: 600, fontSize: 15, textTransform: 'none', background: 'linear-gradient(90deg,#f472b6,#ec4899)', boxShadow: 'none', '&:hover': { boxShadow: 'none', opacity: 0.9 } }}>
        Thanh toán ngay
      </Button>
    </Box>
  )
}

export default Info