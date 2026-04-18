

import {
  Box,
  Stack
} from '@mui/material'

const CardVisual = () => (
  <Box sx={{
    background: 'linear-gradient(135deg, #fce7f3, #fdf2f8)',
    border: '0.5px solid #fbcfe8',
    borderRadius: '14px', p: 2.5, position: 'relative', overflow: 'hidden', height: '140px'
  }}>
    <Box sx={{ width: 30, height: 22, borderRadius: '4px', background: 'linear-gradient(135deg,#d1d5db,#9ca3af)', mb: 4 }} />
    <Stack direction="row" justifyContent="end" alignItems="center">
      <Stack direction="row">
        <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#eb001b' }} />
        <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#f79e1b', ml: -1 }} />
      </Stack>
    </Stack>
  </Box>
)

export default CardVisual