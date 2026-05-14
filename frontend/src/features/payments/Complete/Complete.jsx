import { Box, CircularProgress, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { getInvoiceByTransactionIdAPI } from '~/shared/api/invoiceApi'
import { processVNPayReturnApi } from '~/shared/api/paymentApi'
import Invoice from './Components/Invoice'
import StatusFailed from './Components/StatusFailed'
import StatusSuccess from './Components/statusSuccess'

const Complete = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  // Detect gateway from URL params
  const isVNPay = searchParams.has('vnp_TxnRef')
  const isMoMo = searchParams.has('orderId') && searchParams.has('resultCode')

  // Transaction ID
  const transactionId = isVNPay
    ? searchParams.get('vnp_TxnRef')
    : isMoMo
      ? searchParams.get('orderId')
      : null

  // Detect failure before hitting the backend
  const vnpCode = searchParams.get('vnp_ResponseCode')
  const momoCode = searchParams.get('resultCode')
  const isPaymentFailed =
    (isVNPay && vnpCode && vnpCode !== '00') ||
    (isMoMo && momoCode && momoCode !== '0')

  const failureCode = isVNPay ? vnpCode : momoCode

  // Build VNPay IPN query string (only vnp_ params to avoid signature mismatch)
  const vnpParams = new URLSearchParams()
  searchParams.forEach((value, key) => {
    if (key.startsWith('vnp_')) vnpParams.append(key, value)
  })
  const ipnQueryString = `?${vnpParams.toString()}`

  // 1. Process VNPay IPN via return URL params
  const { isSuccess: isIpnProcessed } = useQuery({
    queryKey: ['vnpay_ipn', ipnQueryString],
    queryFn: () => processVNPayReturnApi(ipnQueryString),
    enabled: isVNPay && !!transactionId && !isPaymentFailed,
    retry: false
  })

  // 2. Fetch invoice after IPN is confirmed (VNPay) or immediately (MoMo — IPN is async webhook)
  const {
    data: invoiceData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['invoice', transactionId],
    queryFn: () => getInvoiceByTransactionIdAPI(transactionId),
    enabled: !isPaymentFailed && !!transactionId && (!isVNPay || isIpnProcessed),
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * (attempt + 1), 4000)
  })

  if (isPaymentFailed) {
    return <StatusFailed responseCode={failureCode} />
  }

  if (isError) {
    return <StatusFailed responseCode={null} />
  }

  if (isLoading || !invoiceData?.id) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress size={40} sx={{ color: 'primary.main' }} />
        <Typography variant="body2" color="text.secondary">{t('payment.loading_payment')}</Typography>
      </Box>
    )
  }

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
