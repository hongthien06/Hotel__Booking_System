import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, MenuItem,
  Grid, IconButton, CircularProgress, Divider
} from '@mui/material'
import { Close } from '@mui/icons-material'
import RoomStatus, { STATUS_CONFIG } from '../RoomStatus'

const ROOM_TYPES = ['Standard', 'Deluxe', 'VIP Suite', 'Family', 'Penthouse']
const BED_TYPES  = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'DOUBLE', label: 'Double' },
  { value: 'TRIPLE', label: 'Triple' },
  { value: 'KING',   label: 'King'   },
  { value: 'QUEEN',  label: 'Queen'  },
]

const emptyForm = {
  roomNumber:    '',
  roomType:      'Standard',
  floor:         '',
  bedType:       'DOUBLE',
  pricePerNight: '',
  province:      '',
  district:      '',
  address:       '',
  status:        'AVAILABLE',
  thumbnailUrl:  '',
  description:   '',
}

const RoomForm = ({ open, onClose, onSubmit, editRoom, loading }) => {
  const isEdit = !!editRoom
  const [form, setForm]     = useState(emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    if (isEdit && editRoom) {
      setForm({
        roomNumber:    editRoom.roomNumber    || '',
        roomType:      editRoom.roomType || editRoom.type || 'Standard',
        floor:         editRoom.floor         || '',
        bedType:       editRoom.bedType       || 'DOUBLE',
        pricePerNight: editRoom.pricePerNight || '',
        province:      editRoom.province      || '',
        district:      editRoom.district      || '',
        address:       editRoom.address       || '',
        status:        editRoom.status        || 'AVAILABLE',
        thumbnailUrl:  editRoom.thumbnailUrl  || '',
        description:   editRoom.description   || '',
      })
    } else {
      setForm(emptyForm)
    }
    setErrors({})
  }, [open, editRoom])

  const validate = () => {
    const e = {}
    if (!form.roomNumber.trim())                                 e.roomNumber    = 'Không được để trống'
    if (!form.pricePerNight || Number(form.pricePerNight) <= 0) e.pricePerNight = 'Phải lớn hơn 0'
    if (!form.province.trim())                                   e.province      = 'Không được để trống'
    if (!form.district.trim())                                   e.district      = 'Không được để trống'
    return e
  }

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSubmit({
      ...form,
      floor:         Number(form.floor) || null,
      pricePerNight: Number(form.pricePerNight),
    })
  }

  const inputSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'action.inputBg' }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      {/* Header */}
      <DialogTitle sx={{ px: 3.5, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" fontWeight={900}>
            {isEdit ? `Chỉnh sửa phòng #${editRoom?.roomNumber}` : 'Thêm phòng mới'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isEdit ? 'Cập nhật thông tin phòng' : 'Điền đầy đủ thông tin để tạo phòng'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3.5, py: 3 }}>
        <Grid container spacing={2.5}>

          {/* Hàng 1: Số phòng (6) + Loại phòng (6) */}
          <Grid item xs={6}>
            <TextField label="Mã phòng *" fullWidth
              value={form.roomNumber} onChange={set('roomNumber')}
              error={!!errors.roomNumber} helperText={errors.roomNumber}
              placeholder="VD: 101, A201..." sx={inputSx}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField select label="Loại phòng" fullWidth
              value={form.roomType}
              onChange={e => {
                // Giữ nguyên giá trị, không reset field khác
                setForm(prev => ({ ...prev, roomType: e.target.value }))
              }}
              sx={inputSx}
            >
              {ROOM_TYPES.map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Hàng 2: Tầng (4) + Loại giường (4) + Giá (4) */}
          <Grid item xs={4}>
            <TextField label="Tầng" type="number" fullWidth
              value={form.floor} onChange={set('floor')}
              placeholder="VD: 3" sx={inputSx}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField select label="Loại giường" fullWidth
              value={form.bedType}
              onChange={e => {
                setForm(prev => ({ ...prev, bedType: e.target.value }))
              }}
              sx={inputSx}
            >
              {BED_TYPES.map(t => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={4}>
            <TextField label="Giá / đêm (₫) *" type="number" fullWidth
              value={form.pricePerNight} onChange={set('pricePerNight')}
              error={!!errors.pricePerNight} helperText={errors.pricePerNight}
              placeholder="VD: 800000" sx={inputSx}
            />
          </Grid>

          {/* Hàng 3: Tỉnh/TP (6) + Quận/Huyện (6) */}
          <Grid item xs={6}>
            <TextField label="Tỉnh / Thành phố *" fullWidth
              value={form.province} onChange={set('province')}
              error={!!errors.province} helperText={errors.province}
              placeholder="VD: TP. Hồ Chí Minh" sx={inputSx}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Quận / Huyện *" fullWidth
              value={form.district} onChange={set('district')}
              error={!!errors.district} helperText={errors.district}
              placeholder="VD: Quận 1" sx={inputSx}
            />
          </Grid>

          {/* Hàng 4: Địa chỉ chi tiết (12) */}
          <Grid item xs={12}>
            <TextField label="Địa chỉ chi tiết" fullWidth
              value={form.address} onChange={set('address')}
              placeholder="VD: 15 Nguyễn Huệ, Phường Bến Nghé" sx={inputSx}
            />
          </Grid>

          {/* Trạng thái (12) */}
          <Grid item xs={12}>
            <Typography variant="caption" fontWeight={700} color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
              Trạng thái phòng
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.keys(STATUS_CONFIG).map(key => (
                <Box key={key}
                  onClick={() => setForm(prev => ({ ...prev, status: key }))}
                  sx={{
                    cursor: 'pointer', borderRadius: '999px',
                    border: '2px solid',
                    borderColor: form.status === key ? 'secondary.main' : 'transparent',
                    p: 0.25, transition: 'all 0.15s',
                    transform: form.status === key ? 'scale(1.08)' : 'scale(1)',
                  }}
                >
                  <RoomStatus status={key} size="md" />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Hàng 5: URL ảnh (12) */}
          <Grid item xs={12}>
            <TextField label="URL ảnh phòng" fullWidth
              value={form.thumbnailUrl} onChange={set('thumbnailUrl')}
              placeholder="https://example.com/room.jpg"
              sx={inputSx}
            />
          </Grid>

          {/* Hàng 6: Mô tả (12) */}
          <Grid item xs={12}>
            <TextField label="Mô tả" fullWidth multiline rows={3}
              value={form.description} onChange={set('description')}
              placeholder="Mô tả ngắn về phòng..."
              sx={{
                ...inputSx,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'action.inputBg',
                  alignItems: 'flex-start',
                }
              }}
            />
          </Grid>

        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3.5, py: 2.5, gap: 1.5 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined" color="inherit"
          sx={{ borderRadius: 3, flex: 1, py: 1.25, fontWeight: 700, textTransform: 'none',
            borderColor: 'divider', color: 'text.secondary' }}
        >
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={loading} variant="contained" color="secondary"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ borderRadius: 3, flex: 1, py: 1.25, fontWeight: 700, textTransform: 'none' }}
        >
          {loading ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo phòng'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RoomForm
