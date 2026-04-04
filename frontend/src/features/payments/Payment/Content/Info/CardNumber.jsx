import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import {
  Box,
  Button,
  Stack,
  Typography
} from '@mui/material'
const CardNumber = ({ card, setCard }) => {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
        <Box>
          <Typography variant="body2" fontWeight={500}>Số thẻ</Typography>
          <Typography variant="caption" color="text.secondary">Nhập 16 chữ số trên thẻ của bạn</Typography>
        </Box>
        <Button size="small" startIcon={<EditIcon sx={{ fontSize: '13px !important' }} />} sx={{ color: '#ec4899', textTransform: 'none', fontSize: 12, minWidth: 0 }}>Sửa</Button>
      </Stack>
      <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: '10px', px: 1.5, height: 48, gap: 0.5, '&:focus-within': { borderColor: '#ec4899' } }}>
        <Stack direction="row" mr={1}>
          <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#eb001b' }} />
          <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#f79e1b', ml: -0.75 }} />
        </Stack>
        {card.map((seg, i) => (
          <Stack key={i} direction="row" alignItems="center" gap={0.5}>
            {i > 0 && <Typography color="text.secondary" fontSize={13}>–</Typography>}
            <Box component="input" value={seg} onChange={e => { const c = [...card]; c[i] = e.target.value; setCard(c) }} maxLength={4}
              sx={{ width: 48, border: 'none', bgcolor: 'transparent', fontSize: 14, textAlign: 'center', outline: 'none', letterSpacing: 2, color: 'text.primary', fontFamily: 'inherit' }} />
          </Stack>
        ))}
        <CheckCircleIcon sx={{ color: '#3b82f6', fontSize: 18, ml: 'auto' }} />
      </Box>
    </Box>
  )
}

export default CardNumber