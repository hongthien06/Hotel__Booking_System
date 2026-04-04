import { Box } from '@mui/material'
import { useState } from 'react'
import Info from './Content/Info'
import Total from './Content/Total'

const Payment = () => {
  const [card, setCard] = useState(['2412', '7512', '3412', '3456'])

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', px: 2, mt: { xs: 2, md: 4 } }} >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 3 },
          p: { xs: 2, md: 3.5 },
          width: '100%',
          maxWidth: '900px',
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 2px 24px rgba(0,0,0,0.07)',
          alignItems: { xs: 'stretch', md: 'flex-start' }
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Info card={card} setCard={setCard} />
        </Box>
        <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }} >
          <Total card={card} />
        </Box>
      </Box>
    </Box>
  )
}

export default Payment
