import { Box } from '@mui/material'

const TimerDigit = ({ value }) => (
  <Box sx={{
    bgcolor: '#1e1b2e', color: 'white', width: 30, height: 34,
    borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums'
  }}>
    {value}
  </Box>
)

export default TimerDigit