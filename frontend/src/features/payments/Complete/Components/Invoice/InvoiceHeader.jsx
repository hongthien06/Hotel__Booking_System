import {
  Box,
  Chip,
  Stack,
  Typography
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { formatDate } from '~/shared/utils/formatters'

const InvoiceHeader = ({ invoiceData }) => {
  const { t } = useTranslation()

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
        <Box>
          <Typography fontWeight={500} fontSize={15}>{t('payment.invoice_title')}</Typography>
          <Typography variant="caption" color="text.secondary">
            {t('payment.issued_at')}: {invoiceData.issuedAt ? formatDate(invoiceData.issuedAt) : '—'} · #{invoiceData.invoiceNumber}
          </Typography>
        </Box>
        <Chip label={t('payment.paid_status')} size="small" sx={{ bgcolor: '#62ff5d68', color: '#36730a', border: '0.5px solid #C0DD97', fontWeight: 500, fontSize: 11 }} />
      </Stack>
    </Box>
  )
}

export default InvoiceHeader
