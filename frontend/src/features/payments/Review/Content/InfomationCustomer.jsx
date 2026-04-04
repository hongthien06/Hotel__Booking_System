import { Box } from '@mui/material'
import InfoContact from './InfomationCustomer/InfoContact'
import InfoBooking from './InfomationCustomer/InfoBooking'
const InfomationCustomer = () => {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      borderRadius: '8px',
      bgcolor: 'background.paper',
      padding: 3,
      boxShadow: '0 0 6px 1px rgba(180, 180, 180, 0.2)',
      gap: 3
    }}>
      <InfoContact />
      <InfoBooking />
    </Box >
  )
}

export default InfomationCustomer