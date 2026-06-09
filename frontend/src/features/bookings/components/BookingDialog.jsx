import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, TextField, Button, Chip, IconButton,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions, Alert, useMediaQuery, useTheme, CircularProgress
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
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
  if (!a || !b) return 0
  const diff = new Date(b) - new Date(a)
  // Cùng ngày hoặc diff dương => ít nhất 1 đêm
  return diff >= 0 ? Math.max(1, Math.round(diff / 86400000)) : 0
}

// Cho phép checkOut = checkIn (đặt trong ngày), chỉ xóa nếu checkOut < checkIn
const sanitizeCheckOut = (checkIn, checkOut) =>
  checkIn && checkOut && checkOut < checkIn ? '' : checkOut

const formatCurrency = (n, lang) => {
  const currency = lang ? (lang === 'vi' ? 'VND' : 'USD') : null;
  return formatCurrencyShared(n, currency);
}

const BookingDialog = ({ open, room, rooms = [], isMock, searchParams, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobileDialog = useMediaQuery(theme.breakpoints.down('sm'))
  const [form, setForm] = useState(() => {
    const checkIn = searchParams?.checkIn || ''
    const checkOut = sanitizeCheckOut(checkIn, searchParams?.checkOut || '')
    return {
      checkIn,
      checkOut,
      expectedCheckoutTime: '',
      numAdults: searchParams?.adults || 2,
      numChildren: searchParams?.children || 0,
      specialRequest: ''
    }
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [bookedDates, setBookedDates] = useState([])
  const [loadingDates, setLoadingDates] = useState(false)

  useEffect(() => {
    if (!open || !room || isMock) {
      Promise.resolve().then(() => setBookedDates([]))
      return
    }
    const rid = room.roomId || room.id
    if (!rid) return
    Promise.resolve()
      .then(() => {
        setLoadingDates(true)
        setError('')
        return getBookedDatesApi(rid)
      })
      .then(dates => {
        setLoadingDates(false)
        setBookedDates(Array.isArray(dates) ? dates : [])
      })
      .catch(() => {
        setLoadingDates(false)
        setBookedDates([])
      })
  }, [open, room?.roomId, room?.id, isMock])

  useEffect(() => {
    if (!open) return
    Promise.resolve().then(() => {
      const checkIn = searchParams?.checkIn || ''
      const checkOut = sanitizeCheckOut(checkIn, searchParams?.checkOut || '')
      setForm({
        checkIn,
        checkOut,
        numAdults: searchParams?.adults || 2,
        numChildren: searchParams?.children || 0,
        specialRequest: ''
      })
      setError('')
    })
  }, [open, searchParams])

  const selectedRooms = rooms.length > 0 ? rooms : (room ? [room] : [])
  if (!open || selectedRooms.length === 0) return null

  const primaryRoom = room || selectedRooms[0]
  const roomName = selectedRooms.length > 1
    ? `${selectedRooms.length} ${t('payment.room').toLowerCase()}`
    : (isMock ? primaryRoom.name : `${t('booking_page.room')} ${primaryRoom.roomNumber}`)
  const roomType = isMock ? primaryRoom.type : (primaryRoom.typeName || 'Standard')
  const roomPrice = selectedRooms.reduce((sum, item) =>
    sum + Number(isMock ? item.price : (item.pricePerNight || item.priceDay || 0)), 0)
  const nights = nightsBetween(form.checkIn, form.checkOut)

  const total = roomPrice * nights

  const maxGuests = selectedRooms.reduce((sum, item) => sum + Number(item.maxGuests || 0), 0) || 99
  const totalGuests = Number(form.numAdults) + Number(form.numChildren)
  const numRooms = selectedRooms.length
  // 1 child per room stays for free (does not count towards capacity limit)
  const effectiveGuests = Number(form.numAdults) + Math.max(0, Number(form.numChildren) - numRooms)
  const isCapacityExceeded = effectiveGuests > maxGuests

  const handleBook = async () => {
    if (!form.checkIn || !form.checkOut) { setError(t('rooms.validation_required')); return }
    // Cho phép checkOut = checkIn (đặt trong ngày, tính 1 đêm)
    if (new Date(form.checkOut) < new Date(form.checkIn)) { setError(t('rooms.check_out_after_check_in')); return }

    // Kiểm tra sức chứa tối đa (maxGuests)
    if (isCapacityExceeded) {
      setError(t('booking_page.max_guests_exceeded', { max: maxGuests }))
      return
    }

    if (isMock) { setError(t('booking_page.mock_room_error', 'Phòng mẫu — vui lòng tìm kiếm phòng thực trên hệ thống.')); return }

    setSubmitting(true)
    setError('')
    try {
      const roomIds = selectedRooms.map(item => item.roomId || item.id)
      const booking = await createBookingApi({
        roomId: roomIds[0],
        roomIds,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
          expectedCheckoutTime: form.expectedCheckoutTime || null,
        numAdults: Number(form.numAdults),
        numChildren: Number(form.numChildren),
        specialRequest: form.specialRequest
      })
      onSuccess?.(booking)
      navigate('/booking-history')
    } catch (err) {
      const data = err?.response?.data
      let errMsg = ''
      if (data) {
        if (data.message) errMsg = data.message
        else if (data.error) errMsg = data.error
        else if (typeof data === 'object' && Object.keys(data).length > 0) {
          errMsg = typeof Object.values(data)[0] === 'string' ? Object.values(data)[0] : JSON.stringify(Object.values(data)[0])
        }
      }
      if (!errMsg) {
        errMsg = err.message || t('common.error')
      }
      setError(errMsg)
      toast.error(errMsg)
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
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        {/* Room summary */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2.5, p: 2, bgcolor: '#fafafa', borderRadius: 2, border: '1px solid #eee' }}>
          <Box sx={{ flex: 1 }}>
            <Chip label={t(roomType)} size="small" sx={{ bgcolor: PC_LIGHT, color: PC, fontWeight: 700, mb: 0.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{roomName}</Typography>
            {selectedRooms.length > 1 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {selectedRooms.map(item => `#${item.roomNumber}`).join(', ')}
              </Typography>
            )}
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
                onChange={newValue => {
                  const newCheckIn = newValue ? newValue.format('YYYY-MM-DD') : ''
                  setForm(f => ({
                    ...f,
                    checkIn: newCheckIn,
                    checkOut: (f.checkOut && newCheckIn && f.checkOut < newCheckIn) ? '' : f.checkOut
                  }))
                  setError('')
                }}
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
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block', pl: 0.5 }}>
                {t('booking_page.checkin_time')}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <DatePicker
                label={t('booking_page.check_out')}
                value={form.checkOut ? dayjs(form.checkOut) : null}
                onChange={newValue => {
                  setForm(f => ({ ...f, checkOut: newValue ? newValue.format('YYYY-MM-DD') : '' }))
                  setError('')
                }}
                minDate={form.checkIn ? dayjs(form.checkIn).subtract(1, 'day') : dayjs().subtract(1, 'day')}
                shouldDisableDate={(date) => {
                  const dateStr = date.format('YYYY-MM-DD')
                  const minStr = form.checkIn || dayjs().format('YYYY-MM-DD')
                  if (dateStr < minStr) return true
                  if (dateStr === minStr) return false
                  return bookedDates.includes(dateStr)
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
              {form.checkIn && form.checkOut && form.checkIn === form.checkOut && (
                <TextField
                  label={t('booking_page.expected_checkout_time_label')}
                  type="time"
                  size="small"
                  value={form.expectedCheckoutTime}
                  onChange={e => setForm(f => ({ ...f, expectedCheckoutTime: e.target.value }))}
                  inputProps={{ step: 300 }}
                  sx={{ mt: 1 }}
                  fullWidth
                />
              )}
              {form.checkIn !== form.checkOut && (
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block', pl: 0.5 }}>
                  {t('booking_page.checkout_time')}
                </Typography>
              )}
            </Grid>
          </Grid>
        </LocalizationProvider>

        {form.checkIn && form.checkOut && form.checkIn === form.checkOut && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            {t('booking_page.same_day_checkout_notice')}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 0.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {t('booking_page.num_guests')}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: isCapacityExceeded ? 'error.main' : 'success.main' }}>
            {t('booking_page.max_capacity_info', { maxGuests })}
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <TextField fullWidth label={t('booking_page.adults')} type="number" size="small"
              value={form.numAdults}
              onChange={e => {
                setForm(f => ({ ...f, numAdults: Math.max(1, parseInt(e.target.value) || 1) }))
                setError('')
              }}
              inputProps={{ min: 1 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: '#f0f7ff' } }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label={t('booking_page.children')} type="number" size="small"
              value={form.numChildren}
              onChange={e => {
                setForm(f => ({ ...f, numChildren: Math.max(0, parseInt(e.target.value) || 0) }))
                setError('')
              }}
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

        {isCapacityExceeded && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
              {t('booking_page.max_guests_exceeded', { max: maxGuests })}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}>
              {selectedRooms.length === 1 ? (
                <>{t('booking_page.hint_single_room', { roomName, maxGuests, totalGuests })}</>
              ) : (
                <>{t('booking_page.hint_multiple_rooms', { maxGuests })}</>
              )}
            </Typography>
            
            <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  onClose()
                  const targetLoc = selectedRooms[0]?.province || selectedRooms[0]?.location || ''
                  const targetHotel = selectedRooms[0]?.hotelName || ''
                  navigate('/bookings', { 
                    state: { 
                      destination: targetLoc, 
                      hotelName: targetHotel, 
                      adults: form.numAdults,
                      children: form.numChildren,
                      autoSearch: true 
                    } 
                  })
                }}
                sx={{
                  bgcolor: '#c0496e', color: 'white', borderRadius: 2, boxShadow: 'none',
                  '&:hover': { bgcolor: '#9a3a58', boxShadow: 'none' }
                }}
              >
                {t('booking_page.action_find_suitable_rooms', 'Tìm thêm phòng phù hợp')}
              </Button>
            </Box>
          </Alert>
        )}

        {/* Price summary */}
        {form.checkIn && form.checkOut && nights > 0 && (
          <>
            {(() => {
              const checkInDateTime = new Date(`${form.checkIn}T14:00:00`)
              const refundDeadline = new Date(checkInDateTime.getTime() - 24 * 60 * 60 * 1000)
              const isNonRefundable = new Date() > refundDeadline

              return isNonRefundable && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontSize: '0.85rem', '& .MuiAlert-message': { fontWeight: 600 } }}>
                  {t('booking_page.non_refundable_warning')}
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
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>{t('common.cancel')}</Button>
        <Button variant="contained" color="primary" onClick={handleBook} disabled={submitting || isCapacityExceeded}
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
