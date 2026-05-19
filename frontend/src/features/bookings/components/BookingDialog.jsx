import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, TextField, Button, Chip, IconButton,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions, Alert, useMediaQuery, useTheme, CircularProgress
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { createBookingApi, getBookedDatesApi } from '../../../shared/api/bookingApi'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import i18n from 'i18next'
import { formatCurrency as formatCurrencyShared } from '../../../shared/utils/formatters'

const PC = '#c0496e'
const PC_LIGHT = '#fce4ec'

const nightsBetween = (a, b) => {
  const diff = new Date(b) - new Date(a)
  return diff > 0 ? Math.round(diff / 86400000) : 1
}

const formatCurrency = (n, lang) => {
  const currency = lang ? (lang === 'vi' ? 'VND' : 'USD') : null;
  return formatCurrencyShared(n, currency);
}

const BookingDialog = ({ open, room, isMock, searchParams, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobileDialog = useMediaQuery(theme.breakpoints.down('sm'))
  const [form, setForm] = useState({
    checkIn: searchParams?.checkIn || '',
    checkOut: searchParams?.checkOut || '',
    numAdults: (searchParams?.adults || 2),
    numChildren: (searchParams?.children || 0),
    specialRequest: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [bookedDates, setBookedDates] = useState([])
  const [loadingDates, setLoadingDates] = useState(false)

  useEffect(() => {
    if (open && room && !isMock) {
      // Đảm bảo lấy đúng ID (backend dùng roomId trong RoomResponse)
      const rid = room.roomId || room.id;
      if (!rid) return;

      console.log('Fetching booked dates for room ID:', rid);
      setLoadingDates(true);
      setError('');
      
      getBookedDatesApi(rid)
        .then(dates => {
          console.log('Booked dates for Room ' + rid + ':', dates);
          setBookedDates(Array.isArray(dates) ? dates : []);
        })
        .catch(err => {
          console.error('Failed to fetch booked dates:', err);
          setBookedDates([]);
        })
        .finally(() => setLoadingDates(false));
    } else {
      setBookedDates([]);
    }
  }, [open, room?.roomId, room?.id, isMock])

  useEffect(() => {
    if (open) {
      setForm({
        checkIn: searchParams?.checkIn || '',
        checkOut: searchParams?.checkOut || '',
        numAdults: (searchParams?.adults || 2),
        numChildren: (searchParams?.children || 0),
        specialRequest: ''
      })
      setError('')
    }
  }, [open, searchParams])

  if (!room) return null

  const roomName = isMock ? room.name : `${t('booking_page.room')} ${room.roomNumber}`
  const roomType = isMock ? room.type : (room.typeName || 'Standard')
  const roomPrice = isMock ? room.price : Number(room.pricePerNight || room.priceDay || 0)
  const nights = nightsBetween(form.checkIn, form.checkOut)

  const total = roomPrice * nights

  const handleBook = async () => {
    if (!form.checkIn || !form.checkOut) { setError(t('rooms.validation_required')); return }
    if (new Date(form.checkOut) <= new Date(form.checkIn)) { setError(t('rooms.check_out_after_check_in')); return }
    
    // Kiểm tra sức chứa tối đa (maxGuests)
    const maxGuests = room.maxGuests || 99
    if (Number(form.numAdults) + Number(form.numChildren) > maxGuests) {
      setError(t('booking_page.max_guests_exceeded', { max: maxGuests }))
      return
    }

    if (isMock) { setError('Phòng mẫu — vui lòng tìm kiếm phòng thực trên hệ thống.'); return }

    setSubmitting(true)
    setError('')
    try {
      await createBookingApi({
        roomId: room.roomId || room.id,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        numAdults: Number(form.numAdults),
        numChildren: Number(form.numChildren),
        specialRequest: form.specialRequest
      })
      onSuccess()
    } catch (err) {
      const data = err?.response?.data
      const msg = data?.error || data?.message || (typeof data === 'string' ? data : t('common.error'))
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobileDialog} PaperProps={{ sx: { borderRadius: isMobileDialog ? 0 : 3 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: PC }}>{t('booking_page.booking_confirm')}</Typography>
          <Typography variant="body2" color="text.secondary">{roomName}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Room summary */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2.5, p: 2, bgcolor: '#fafafa', borderRadius: 2, border: '1px solid #eee' }}>
          <Box sx={{ flex: 1 }}>
            <Chip label={t(roomType)} size="small" sx={{ bgcolor: PC_LIGHT, color: PC, fontWeight: 700, mb: 0.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{roomName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatCurrency(roomPrice, 'vi')} {t('rooms.per_night')}
            </Typography>
          </Box>
        </Box>

        {/* Date pickers */}
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={i18n.language}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <DatePicker
                label={t('booking_page.check_in')}
                value={form.checkIn ? dayjs(form.checkIn) : null}
                onChange={newValue => setForm(f => ({ ...f, checkIn: newValue ? newValue.format('YYYY-MM-DD') : '' }))}
                minDate={dayjs()}
                shouldDisableDate={(date) => {
                  const dateStr = date.format('YYYY-MM-DD');
                  const isDisabled = bookedDates.includes(dateStr);
                  if (isDisabled) console.log('Disabling date:', dateStr);
                  return isDisabled;
                }}
                loading={loadingDates}
                slotProps={{ 
                  textField: { size: 'small', fullWidth: true },
                  day: {
                    sx: {
                      '&.Mui-disabled': { color: 'rgba(0, 0, 0, 0.26) !important' }
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <DatePicker
                label={t('booking_page.check_out')}
                value={form.checkOut ? dayjs(form.checkOut) : null}
                onChange={newValue => setForm(f => ({ ...f, checkOut: newValue ? newValue.format('YYYY-MM-DD') : '' }))}
                minDate={form.checkIn ? dayjs(form.checkIn).add(1, 'day') : dayjs().add(1, 'day')}
                shouldDisableDate={(date) => {
                  const dateStr = date.format('YYYY-MM-DD');
                  const isDisabled = bookedDates.includes(dateStr);
                  return isDisabled;
                }}
                loading={loadingDates}
                slotProps={{ 
                  textField: { size: 'small', fullWidth: true },
                  day: {
                    sx: {
                      '&.Mui-disabled': { color: 'rgba(0, 0, 0, 0.26) !important' }
                    }
                  }
                }}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <TextField fullWidth label={t('booking_page.adults')} type="number" size="small"
              value={form.numAdults}
              onChange={e => setForm(f => ({ ...f, numAdults: Math.max(1, parseInt(e.target.value) || 1) }))}
              inputProps={{ min: 1 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: '#f0f7ff' } }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label={t('booking_page.children')} type="number" size="small"
              value={form.numChildren}
              onChange={e => setForm(f => ({ ...f, numChildren: Math.max(0, parseInt(e.target.value) || 0) }))}
              inputProps={{ min: 0 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: '#f0f7ff' } }}
            />
          </Grid>
        </Grid>

        <TextField fullWidth label={t('booking_page.special_request')} multiline rows={2} size="small"
          value={form.specialRequest}
          onChange={e => setForm(f => ({ ...f, specialRequest: e.target.value }))}
          placeholder={t('booking_page.special_request_placeholder')}
          sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: '#f0f7ff' } }}
        />

        {/* Price summary */}
        {form.checkIn && form.checkOut && nights > 0 && (
          <>
            {(() => {
              const checkInDateTime = new Date(`${form.checkIn}T14:00:00`)
              const refundDeadline = new Date(checkInDateTime.getTime() - 24 * 60 * 60 * 1000)
              const isNonRefundable = new Date() > refundDeadline

              return isNonRefundable && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontSize: '0.85rem', '& .MuiAlert-message': { fontWeight: 600 } }}>
                  {t('booking_page.non_refundable_warning') === 'booking_page.non_refundable_warning'
                    ? 'Vì thời gian đặt đã nằm trong khoảng 24h trước check-in, đơn này sẽ không được hoàn tiền nếu hủy.'
                    : t('booking_page.non_refundable_warning')}
                </Alert>
              )
            })()}

            <Box sx={{ p: 2, bgcolor: PC_LIGHT, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">{formatCurrency(roomPrice, i18n.language)} × {nights} {t('rooms.per_night')}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(total, i18n.language)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{t('booking_page.total')}</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: PC }}>{formatCurrency(total, i18n.language)}</Typography>
              </Box>
            </Box>
          </>
        )}

        {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>{t('common.cancel')}</Button>
        <Button variant="contained" color="primary" onClick={handleBook} disabled={submitting}
          sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {submitting ? t('booking_page.processing') : t('booking_page.booking_confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BookingDialog

