import CallOutlinedIcon from '@mui/icons-material/CallOutlined'
import { Box, Typography } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import TextField from '@mui/material/TextField'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getMyProfileApi } from '../../../../../shared/api/userApi'
import { useBookingContext } from '../../../_id'
import CountryCode from './CountryCode'

const InfoContact = () => {
  const { t } = useTranslation()
  const { booking } = useBookingContext() || {}

  const defaultName = booking?.userName || ''
  const defaultEmail = booking?.userEmail || ''
  const [phone, setPhone] = useState('')

  useEffect(() => {
    getMyProfileApi()
      .then(data => { if (data?.phone) setPhone(data.phone) })
      .catch(() => {})
  }, [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: '550' }}>
          <CallOutlinedIcon />{t('payment.contact_info')}
        </Typography>
        <Typography variant='b4' sx={{ color: '#606060' }}>{t('payment.contact_info_sub')}</Typography>
      </Box>
      <FormGroup sx={{
        padding: '0 2em 1em 2em',
        backgroundColor: '#ff2fee11',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <Box sx={{ marginTop: '1em', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography sx={{ color: '#501157', fontWeight: '600', fontSize: '0.875rem' }}>{t('payment.full_name')}</Typography>
          <TextField
            fullWidth
            type="text"
            variant="outlined"
            defaultValue={defaultName}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '48px',
                fontSize: '1rem'
              },
              '& .MuiInputLabel-root': {
                fontSize: '1rem'
              }
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ color: '#501157', fontWeight: '600', fontSize: '0.875rem' }}>{t('payment.phone')}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <CountryCode />
              <TextField
                fullWidth
                type="tel"
                variant="outlined"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '48px',
                    fontSize: '1rem'
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1rem'
                  }
                }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ color: '#501157', fontWeight: '600', fontSize: '0.875rem' }}>Email</Typography>
            <TextField
              fullWidth
              variant="outlined"
              defaultValue={defaultEmail}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '48px',
                  fontSize: '1rem'
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1rem'
                }
              }}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', borderTop: '1px dashed  #f19fb9', marginTop: 2 }}>
          <FormControlLabel control={<Checkbox sx={{ color: 'white', '&.Mui-checked': { color: 'primary.main' } }} />}
            label={<Typography sx={{ color: '#501157', fontWeight: '600', fontSize: '0.875rem' }}>{t('payment.booking_for_myself')}</Typography>}
          />
        </Box>
      </FormGroup>
    </Box>
  )
}

export default InfoContact
