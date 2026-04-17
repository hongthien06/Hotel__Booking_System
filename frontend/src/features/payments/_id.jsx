import Container from '@mui/material/Container'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '~/shared/components/layout/Header/Header'
import Complete from './Complete/Complete'
import Payment from './Payment/Payment'
import PaymentBar from './PaymentBar/paymentBar'
import Review from './Review/Review'


function Payments() {
  const [params] = useSearchParams()
  const step = Number(params.get('step')) - 1 || 0
  const [activeStep, setActiveStep] = useState(0)
  useEffect(() => {
    setActiveStep(step)
  }, [step])

  return (
    <Container disableGutters
      maxWidth={false}
      sx={{
        minHeight: '100vh',
        bgcolor: '#ffffff',
        backgroundImage: `
            radial-gradient(circle 600px at 0% 200px, #fce7f3, transparent),
            radial-gradient(circle 600px at 100% 500px, #fce7f3, transparent) 
          `
      }}>
      <Header />
      <PaymentBar activeStep={activeStep} />

      {step === 0 && <Review />}
      {step === 1 && <Payment />}
      {step === 2 && <Complete />}

    </Container>
  )
}

export default Payments