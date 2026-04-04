

import {
  Box,
  Stack,
  Typography
} from '@mui/material'

const CardVisual = ({ number, name, expiry }) => (
  <Box sx={{
    background: 'linear-gradient(135deg, #fce7f3, #fdf2f8)',
    border: '0.5px solid #fbcfe8',
    borderRadius: '14px', p: 2.5, position: 'relative', overflow: 'hidden'
  }}>
    <Box sx={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(251,207,232,0.4)', right: -30, bottom: -40 }} />
    <Box sx={{ width: 30, height: 22, borderRadius: '4px', background: 'linear-gradient(135deg,#d1d5db,#9ca3af)', mb: 4 }} />
    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{name || 'Nguyen Van A'}</Typography>
    <Typography sx={{ fontSize: 14, color: '#6b7280', letterSpacing: 2, my: 0.5 }}>
      ···· ···· ···· {number?.slice(-4) || '3456'}
    </Typography>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography sx={{ fontSize: 13, color: '#6b7280' }}>{expiry || '09/27'}</Typography>
      <Stack direction="row">
        <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#eb001b' }} />
        <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#f79e1b', ml: -1 }} />
      </Stack>
    </Stack>
  </Box>
)

export default CardVisual