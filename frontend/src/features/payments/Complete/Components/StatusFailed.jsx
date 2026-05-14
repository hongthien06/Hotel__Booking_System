import CloseIcon from '@mui/icons-material/Close'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const getFailureReason = (t, responseCode) => {
  switch (responseCode) {
    case '24': return t('payment.failed_reason_cancelled')
    case '51': return t('payment.failed_reason_insufficient')
    case '11': return t('payment.failed_reason_timeout')
    default: return t('payment.failed_reason_default')
  }
}

const StatusFailed = ({ responseCode }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const reason = getFailureReason(t, responseCode)

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      px: 3,
      gap: 2.5,
      maxWidth: 480,
      mx: 'auto',
      textAlign: 'center'
    }}>
      <Box sx={{
        width: 72, height: 72, borderRadius: '50%',
        bgcolor: '#ff575726',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Box sx={{
          width: 52, height: 52, borderRadius: '50%',
          bgcolor: '#ef4444',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <CloseIcon sx={{ color: 'white', fontSize: 26 }} />
        </Box>
      </Box>

      <Box>
        <Typography fontWeight={600} fontSize={20} mb={0.75}>
          {t('payment.failed_title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
          {t('payment.failed_sub')}
        </Typography>
      </Box>

      {responseCode && (
        <Box sx={{
          bgcolor: '#fff5f5',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          px: 2.5, py: 1.5,
          width: '100%'
        }}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            {reason}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Code: {responseCode}
          </Typography>
        </Box>
      )}

      <Stack spacing={1.5} width="100%" mt={0.5}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<RefreshIcon />}
          onClick={() => navigate('/booking-history')}
          sx={{
            bgcolor: '#c02860',
            color: 'white',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#a0214f', boxShadow: 'none' }
          }}
        >
          {t('payment.retry_booking')}
        </Button>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<HomeOutlinedIcon />}
          onClick={() => navigate('/')}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            color: 'text.secondary',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'grey.50', color: 'black' }
          }}
        >
          {t('payment.go_home')}
        </Button>
      </Stack>
    </Box>
  )
}

export default StatusFailed
