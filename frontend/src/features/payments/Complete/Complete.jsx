import { Box } from '@mui/material'
import Invoice from './Components/Invoice'
import StatusSuccess from './Components/statusSuccess'
import { getInvoiceByBookingIdAPI } from '~/shared/api/invoiceApi'
import { processVNPayReturnApi } from '~/shared/api/paymentApi'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'

const Complete = () => {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('vnp_TxnRef') // bookingId

  // Extract only vnp_ params for IPN to avoid signature mismatch
  const vnpParams = new URLSearchParams()
  searchParams.forEach((value, key) => {
    if (key.startsWith('vnp_')) {
      vnpParams.append(key, value)
    }
  })
  const ipnQueryString = `?${vnpParams.toString()}`

  // 1. Simulate IPN call locally using Return URL params
  const { isSuccess: isIpnProcessed } = useQuery({
    queryKey: ['vnpay_ipn', ipnQueryString],
    queryFn: () => processVNPayReturnApi(ipnQueryString),
    enabled: !!bookingId && ipnQueryString.includes('vnp_TxnRef'),
    retry: false
  })

  // 2. Fetch invoice by bookingId after IPN is processed
  const { data: invoiceData = {}, isLoading } = useQuery({
    queryKey: ['invoice', bookingId],
    queryFn: () => getInvoiceByBookingIdAPI(bookingId),
    enabled: !!bookingId && (!ipnQueryString.includes('vnp_TxnRef') || isIpnProcessed),
    retry: 3,
    retryDelay: 1000
  })

  if (isLoading || !invoiceData.id) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>Loading...</Box>

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