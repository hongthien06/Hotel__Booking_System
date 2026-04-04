import CreditCardIcon from '@mui/icons-material/CreditCard'
import {
  Box,
  Stack,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import TimerDigit from './TImerDigit'

const Brand = () => {
  const [seconds, setSeconds] = useState(119)

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 0), 1000)
    return () => clearInterval(t)
  }, [])

  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#f472b6,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CreditCardIcon sx={{ color: 'white', fontSize: 18 }} />
        </Box>
        <Typography fontWeight={500}>RentNow<Box component="span" sx={{ color: '#ec4899' }}>Pay</Box></Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        {[m[0], m[1], s[0], s[1]].map((d, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>
            {i === 2 && (
              <Typography color="text.secondary" sx={{ px: 0.25 }}>
                :
              </Typography>
            )}
            <TimerDigit value={d} />
          </Box>
        ))}
      </Stack>
    </Stack>
  )
}

export default Brand