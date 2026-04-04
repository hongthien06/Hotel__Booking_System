import AppsIcon from '@mui/icons-material/Apps'
import {
  Box,
  IconButton,
  InputAdornment,
  Stack, TextField,
  Typography
} from '@mui/material'

const CVV_EXP_OTP = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction="row" gap={2}>
        {[
          { label: 'Số CVV', sub: '3 hoặc 4 chữ số sau thẻ', placeholder: '···', type: 'password', defaultValue: '327' },
          { label: 'Ngày hết hạn', sub: 'Ngày hết hạn trên thẻ', isExpiry: true }
        ].map(({ label, sub, placeholder, type, defaultValue, isExpiry }) => (
          <Box key={label} sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={500}>{label}</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.75}>{sub}</Typography>
            {isExpiry ? (
              <Stack direction="row" alignItems="center" gap={0.75}>
                <TextField size="small" defaultValue="09" inputProps={{ maxLength: 2, style: { textAlign: 'center', letterSpacing: 2 } }} sx={{ flex: 1 }} />
                <Typography color="text.secondary">/</Typography>
                <TextField size="small" defaultValue="27" inputProps={{ maxLength: 2, style: { textAlign: 'center', letterSpacing: 2, color: '#ec4899' } }} sx={{ flex: 1, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ec4899' } } }} />
              </Stack>
            ) : (
              <TextField size="small" fullWidth type={type} defaultValue={defaultValue} placeholder={placeholder}
                InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small"><AppsIcon fontSize="small" /></IconButton></InputAdornment> }} />
            )}
          </Box>
        ))}
      </Stack>
      <Box>
        <Typography variant="body2" fontWeight={500}>Mật khẩu OTP</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.75}>Mật khẩu động gửi về số điện thoại</Typography>
        <TextField fullWidth size="small" type="password" defaultValue="12345678"
          InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small"><AppsIcon fontSize="small" /></IconButton></InputAdornment> }} />
      </Box>
    </Box>

  )
}

export default CVV_EXP_OTP