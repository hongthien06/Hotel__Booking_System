import Container from '@mui/material/Container'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '~/shared/components/layout/Header/Header'
import Payment from './Payment/Payment'
import PaymentBar from './PaymentBar/paymentBar'
import Review from './Review/Review'
import Complete from './Complete/Complete'


function Payments() {
  const [params] = useSearchParams()
  const step = Number(params.get('step')) - 1 || 0
  const [activeStep, setActiveStep] = useState(0)
  useEffect(() => {
    setActiveStep(step)
  }, [step])

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <Header />
      <PaymentBar activeStep={activeStep} />

      {step === 0 && <Review />}
      {step === 1 && <Payment />}
      {step === 2 && <Complete />}

    </Container>
  )
}

export default Payments