import {
  Box,
  Typography
} from '@mui/material'
import { useTranslation } from 'react-i18next'

const InvoiceFooter = () => {
  const { t } = useTranslation()

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, pt: 1.5, borderTop: '0.5px solid', borderColor: 'divider', lineHeight: 1.6, display: 'block' }}>
        {t('payment.footer_text')}{' '}
        <Box component="span" sx={{ color: '#D4537E' }}>support@rentnow.vn</Box>
      </Typography>
    </Box>
  )
}

export default InvoiceFooter
