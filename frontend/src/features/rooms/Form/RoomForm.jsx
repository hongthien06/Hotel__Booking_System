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
  roomNumber: '', roomType: 'Standard', floor: '',
  capacity: '', area: '', pricePerNight: '',
  bedType: 'DOUBLE', bedrooms: '1', bathrooms: '1',
  status: 'AVAILABLE', description: '', amenities: '', imageUrl: ''
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
        capacity:      editRoom.capacity      || '',
        area:          editRoom.area          || '',
        pricePerNight: editRoom.pricePerNight || '',
        bedType:       editRoom.bedType       || 'DOUBLE',
        bedrooms:      editRoom.bedrooms      || '1',
        bathrooms:     editRoom.bathrooms     || '1',
        status:        editRoom.status        || 'AVAILABLE',
        description:   editRoom.description   || '',
        amenities:     Array.isArray(editRoom.amenities)
          ? editRoom.amenities.join(', ')
          : (editRoom.amenities || ''),
        imageUrl:      editRoom.imageUrl      || ''
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
    if (!form.capacity      || Number(form.capacity)      <= 0) e.capacity      = 'Phải lớn hơn 0'
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
      floor:         Number(form.floor)         || null,
      capacity:      Number(form.capacity),
      area:          Number(form.area)          || null,
      pricePerNight: Number(form.pricePerNight),
      bedrooms:      Number(form.bedrooms),
      bathrooms:     Number(form.bathrooms),
      amenities:     form.amenities
        ? form.amenities.split(',').map(a => a.trim()).filter(Boolean)
        : []
    })
  }

  const inputSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'action.inputBg' }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
    >
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

          {/* Số phòng + Loại phòng */}
          <Grid item xs={6}>
            <TextField label="Số phòng *" fullWidth
              value={form.roomNumber} onChange={set('roomNumber')}
              error={!!errors.roomNumber} helperText={errors.roomNumber}
              placeholder="VD: 101, A201..." sx={inputSx}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField select label="Loại phòng" fullWidth
              value={form.roomType} onChange={set('roomType')} sx={inputSx}
            >
              {ROOM_TYPES.map(t => (
                <MenuItem key={t} value={t} sx={{ textTransform: 'uppercase' }}>{t}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Tầng + Giá */}
          <Grid item xs={6}>
            <TextField label="Tầng" type="number" fullWidth
              value={form.floor} onChange={set('floor')}
              placeholder="VD: 3" sx={inputSx}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Giá / đêm (₫) *" type="number" fullWidth
              value={form.pricePerNight} onChange={set('pricePerNight')}
              error={!!errors.pricePerNight} helperText={errors.pricePerNight}
              placeholder="VD: 800000" sx={inputSx}
            />
          </Grid>

          {/* Sức chứa + Diện tích */}
          <Grid item xs={6}>
            <TextField label="Sức chứa (khách) *" type="number" fullWidth
              value={form.capacity} onChange={set('capacity')}
              error={!!errors.capacity} helperText={errors.capacity}
              placeholder="VD: 2" sx={inputSx}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Diện tích (m²)" type="number" fullWidth
              value={form.area} onChange={set('area')}
              placeholder="VD: 35" sx={inputSx}
            />
          </Grid>

          {/* Loại giường (xs=6) + Phòng ngủ (xs=3) + Phòng tắm (xs=3) */}
          <Grid item xs={6}>
            <TextField select label="Loại giường" fullWidth
              value={form.bedType} onChange={set('bedType')} sx={inputSx}
            >
              {BED_TYPES.map(t => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={3}>
            <TextField label="Phòng ngủ" type="number" fullWidth
              value={form.bedrooms} onChange={set('bedrooms')} sx={inputSx}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField label="Phòng tắm" type="number" fullWidth
              value={form.bathrooms} onChange={set('bathrooms')} sx={inputSx}
            />
          </Grid>

          {/* Trạng thái */}
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

          {/* Tiện nghi */}
          <Grid item xs={12}>
            <TextField label="Tiện nghi (cách nhau bằng dấu phẩy)" fullWidth
              value={form.amenities} onChange={set('amenities')}
              placeholder="VD: WiFi, TV, Điều hòa, Tủ lạnh" sx={inputSx}
            />
          </Grid>

          {/* URL ảnh */}
          <Grid item xs={12}>
            <TextField label="URL ảnh phòng" fullWidth
              value={form.imageUrl} onChange={set('imageUrl')}
              placeholder="https://..." sx={inputSx}
            />
          </Grid>

          {/* Mô tả */}
          <Grid item xs={12}>
            <TextField label="Mô tả" fullWidth multiline rows={3}
              value={form.description} onChange={set('description')}
              placeholder="Mô tả ngắn về phòng..." sx={inputSx}
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
