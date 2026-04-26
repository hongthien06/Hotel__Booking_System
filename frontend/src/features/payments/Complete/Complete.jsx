import { Box } from '@mui/material'
import Invoice from './Components/Invoice'
import StatusSuccess from './Components/statusSuccess'
import { getInvoiceByBookingCodeAPI } from '~/shared/api/invoiceApi'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'

const Complete = () => {
  const [searchParams] = useSearchParams()
  const bookingCode = searchParams.get('vnp_TxnRef')
  const { data: invoiceData = [] } = useQuery({
    queryKey: ['invoice', bookingCode],
    queryFn: () => getInvoiceByBookingCodeAPI(bookingCode)
  })

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
        <StatusSuccess invoiceData={invoiceData} />
        <Invoice invoiceData={invoiceData} />
      </Box>
    </Box>
  )
}

export default Complete