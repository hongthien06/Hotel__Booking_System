import CardVisual from './Total/CardVisual'
import OrderSummary from './Total/OrderSummary'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

const Total = () => {
  const { t } = useTranslation()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CardVisual />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <OrderSummary />
        <Typography variant="caption" color="text.secondary" textAlign="center" lineHeight={1.6}>
          {t('payment.terms_text')}{' '}
          <Box component="span" sx={{ color: '#ec4899', textDecoration: 'underline', cursor: 'pointer' }}>{t('payment.terms_of_service')}</Box>
          {' '}{t('payment.and')}{' '}
          <Box component="span" sx={{ color: '#ec4899', textDecoration: 'underline', cursor: 'pointer' }}>{t('payment.privacy_policy')}</Box>.
        </Typography>
      </Box>

    </Box>
  )
}

export default Total
