import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Stack, TextField,
  Typography
} from '@mui/material'
import { useState } from 'react'

const VALID_CODES = {
  WELCOME10: { label: 'Giảm 10% tiền thuê', discount: 450000 },
  RENTNOW50: { label: 'Giảm 50.000đ phí dịch vụ', discount: 50000 },
  VIP2025: { label: 'Ưu đãi VIP — giảm 500.000đ', discount: 500000 }
}

const PromoInput = ({ applied, onRemove }) => {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={0.75} mb={1}>
        <LocalOfferIcon sx={{ fontSize: 14, color: '#ec4899' }} />
        <Typography variant="body2" fontWeight={500}>Mã khuyến mãi</Typography>
      </Stack>

      <Collapse in={!applied}>
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 1.5, py: 1,
          bgcolor: '#fdf2f8',
          border: '1px dashed #f9a8d4',
          borderRadius: '10px',
          mb: 1
        }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 14, color: 'white' }} />
            </Box>
            <Box>
              {/* set o day neu ap dung dc */}
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#be185d' }}>WELCOME10</Typography>
              <Typography sx={{ fontSize: 11, color: '#ec4899' }}>{VALID_CODES?.WELCOME10.label}</Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={onRemove} sx={{ color: '#ec4899' }}>
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      </Collapse>

      <Collapse in={!applied}>
        <Stack direction="row" gap={1}>
          <TextField
            size="small"
            fullWidth
            placeholder="Nhập mã khuyến mãi..."
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
            error={!!error}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                fontSize: 13,
                letterSpacing: 1,
                '&.Mui-focused fieldset': { borderColor: '#ec4899' }
              }
            }}
          />
          <Button
            variant="contained"
            sx={{
              borderRadius: '10px',
              minWidth: 72,
              textTransform: 'none',
              fontSize: 13,
              bgcolor: '#ec4899',
              boxShadow: 'none',
              flexShrink: 0,
              '&:hover': { bgcolor: '#be185d', boxShadow: 'none' },
              '&.Mui-disabled': { bgcolor: '#fbcfe8', color: 'white' }
            }}
          >
            Áp dụng
          </Button>
        </Stack>
        {error && (
          <Typography sx={{ fontSize: 11, color: 'error.main', mt: 0.75, pl: 0.5 }}>{error}</Typography>
        )}
        <Stack direction="row" spacing={0.75} mt={1} flexWrap="wrap" useFlexGap>
          {Object.keys(VALID_CODES).map(k => (
            <Box
              key={k}
              onClick={() => { setCode(k); setError('') }}
              sx={{
                fontSize: 11, px: 1, py: 0.4,
                border: '1px dashed #f9a8d4',
                borderRadius: '20px',
                color: '#be185d',
                cursor: 'pointer',
                bgcolor: code === k ? '#fce7f3' : 'transparent',
                '&:hover': { bgcolor: '#fce7f3' },
                transition: 'all 0.15s'
              }}
            >
              {k}
            </Box>
          ))}
        </Stack>
      </Collapse>
    </Box>
  )
}

export default PromoInput