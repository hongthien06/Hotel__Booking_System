import {
  Box,
  Chip,
  Stack,
  Typography
} from '@mui/material'
import { useTranslation } from 'react-i18next'

const InvoiceHeader = ({ invoiceData }) => {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
        <Box>
          <Typography fontWeight={500} fontSize={15}>{t('payment.invoice_title')}</Typography>
          <Typography variant="caption" color="text.secondary">
            {t('payment.issued_at')}: {invoiceData.issuedAt ? new Date(invoiceData.issuedAt).toLocaleDateString(locale) : '—'} · #{invoiceData.invoiceNumber}
          </Typography>
        </Box>
        <Chip label={t('payment.paid_status')} size="small" sx={{ bgcolor: '#62ff5d68', color: '#36730a', border: '0.5px solid #C0DD97', fontWeight: 500, fontSize: 11 }} />
      </Stack>
    </Box>
  )
}

export default InvoiceHeader
