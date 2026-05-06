import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import {
  Box,
  Button,
  Collapse,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import { applyVoucherApi, getActiveVouchersApi, removeVoucherApi } from '~/shared/api/voucherApi'

const formatVND = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)

const PromoInput = ({ bookingId, applied, onApply, onRemove }) => {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [hints, setHints] = useState([])

  useEffect(() => {
    getActiveVouchersApi()
      .then(list => setHints((list || []).slice(0, 5)))
      .catch(() => {})
  }, [])

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) { setError('Vui lòng nhập mã khuyến mãi'); return }
    if (!bookingId) { setError('Không tìm thấy thông tin booking'); return }
    setLoading(true)
    setError('')
    try {
      const result = await applyVoucherApi(bookingId, trimmed)
      onApply(result)
      setCode('')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error
        || 'Mã không hợp lệ hoặc đã hết lượt sử dụng'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!bookingId) return
    try {
      await removeVoucherApi(bookingId)
    } catch { /* bỏ qua lỗi network khi remove */ }
    onRemove()
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={0.75} mb={1}>
        <LocalOfferIcon sx={{ fontSize: 14, color: '#ec4899' }} />
        <Typography variant="body2" fontWeight={500}>Mã khuyến mãi</Typography>
      </Stack>

      {/* Badge khi đã áp dụng voucher */}
      <Collapse in={!!applied}>
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
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#be185d' }}>
                {applied?.voucherCode}
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#ec4899' }}>
                Giảm {formatVND(applied?.discountAmount)}
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={handleRemove} sx={{ color: '#ec4899' }}>
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      </Collapse>

      {/* Form nhập mã khi chưa áp dụng */}
      <Collapse in={!applied}>
        <Stack direction="row" gap={1}>
          <TextField
            size="small"
            fullWidth
            placeholder="Nhập mã khuyến mãi..."
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
            error={!!error}
            disabled={loading}
            onKeyDown={e => e.key === 'Enter' && handleApply()}
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
            onClick={handleApply}
            disabled={loading || !code.trim()}
            sx={{
              borderRadius: '10px',
              minWidth: 80,
              textTransform: 'none',
              fontSize: 13,
              bgcolor: '#ec4899',
              boxShadow: 'none',
              flexShrink: 0,
              '&:hover': { bgcolor: '#be185d', boxShadow: 'none' },
              '&.Mui-disabled': { bgcolor: '#fbcfe8', color: 'white' }
            }}
          >
            {loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : 'Áp dụng'}
          </Button>
        </Stack>
        {error && (
          <Typography sx={{ fontSize: 11, color: 'error.main', mt: 0.75, pl: 0.5 }}>{error}</Typography>
        )}

        {/* Gợi ý voucher đang hoạt động */}
        {hints.length > 0 && (
          <Stack direction="row" spacing={0.75} mt={1} flexWrap="wrap" useFlexGap>
            {hints.map(v => (
              <Box
                key={v.voucherId}
                onClick={() => { setCode(v.code); setError('') }}
                sx={{
                  fontSize: 11, px: 1, py: 0.4,
                  border: '1px dashed #f9a8d4',
                  borderRadius: '20px',
                  color: '#be185d',
                  cursor: 'pointer',
                  bgcolor: code === v.code ? '#fce7f3' : 'transparent',
                  '&:hover': { bgcolor: '#fce7f3' },
                  transition: 'all 0.15s'
                }}
              >
                {v.code}
              </Box>
            ))}
          </Stack>
        )}
      </Collapse>
    </Box>
  )
}

export default PromoInput
