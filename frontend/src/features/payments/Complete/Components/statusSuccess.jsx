import CheckIcon from '@mui/icons-material/Check'
import DownloadIcon from '@mui/icons-material/Download'
import { Box, Button, Stack, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { downloadInvoicePdfApi } from '~/shared/api/invoiceApi'
import { useNavigate } from 'react-router-dom'

const StatusSuccess = ({ invoiceData }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handledownLoad = async () => {
    toast.promise(downloadInvoicePdfApi(invoiceData.id), {
      pending: 'Processing...',
      success: t('payment.download_pdf') + ' ✓',
      error: 'Failed to download invoice'
    })
  }

  return (
    <Box sx={{
      width: { xs: '100%', sm: 280 },
      flexShrink: 0,
      borderRight: { xs: 'none', sm: '0.5px solid' },
      borderBottom: { xs: '0.5px solid', sm: 'none' },
      borderColor: 'divider',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: 2.5, md: 4 },
      gap: 2
    }}>
      <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#57ff5760', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: '#1ace23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckIcon sx={{ color: 'white', fontSize: 26 }} />
        </Box>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography fontWeight={500} fontSize={16} lineHeight={1.4}>{t('payment.success_title')}</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mt={0.75} lineHeight={1.6}>
          {t('payment.success_sub')}
        </Typography>
      </Box>

      <Box sx={{ width: '100%', bgcolor: '#57ff5760', borderRadius: '8px', p: 1.5, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 12, fontWeight: '500', color: '#124c09', mb: 0.25 }}>{t('payment.booking_code_label')}</Typography>
        <Typography sx={{ fontSize: 15, fontWeight: '600', color: '#124c09', letterSpacing: 1 }}>{invoiceData.bookingCode}</Typography>
      </Box>

      <Stack spacing={1} width="100%" mt={0.5}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<DownloadIcon />}
          onClick={handledownLoad}
          sx={{ bgcolor: '#e41030ff', color: 'white', '&:hover': { boxShadow: 'none' }, borderRadius: '10px', textTransform: 'none', fontWeight: 500, boxShadow: 'none' }}
        >
          {t('payment.download_pdf')}
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate('/booking-history')}
          sx={{ borderRadius: '10px', textTransform: 'none', color: 'text.secondary', borderColor: 'divider', '&:hover': { bgcolor: 'grey.50', color: 'black' } }}
        >
          {t('payment.view_my_rooms')}
        </Button>
      </Stack>
    </Box>
  )
}

export default StatusSuccess
