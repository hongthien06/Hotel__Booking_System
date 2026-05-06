import Container from '@mui/material/Container'
import { createContext, useContext, useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import Complete from './Complete/Complete'
import Payment from './Payment/Payment'
import PaymentBar from './PaymentBar/paymentBar'
import Review from './Review/Review'

// Context to share booking data across Review sub-components
export const BookingContext = createContext(null)
export const useBookingContext = () => useContext(BookingContext)

function Payments() {
  const [params] = useSearchParams()
  const step = Number(params.get('step')) - 1 || 0
  const [activeStep, setActiveStep] = useState(0)
  const location = useLocation()

  // Booking data passed via router state from BookingPage
  const bookingState = location.state || {}

  // voucherData: ApplyVoucherResponse từ API sau khi áp mã giảm giá
  const [voucherData, setVoucherData] = useState(null)

  useEffect(() => {
    setActiveStep(step)
  }, [step])

  return (
    <BookingContext.Provider value={{ ...bookingState, voucherData, setVoucherData }}>
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
        <PaymentBar activeStep={activeStep} />

        {step === 0 && <Review />}
        {step === 1 && <Payment />}
        {step === 2 && <Complete />}

      </Container>
    </BookingContext.Provider>
  )
}

export default Payments