/* eslint-disable indent */
import {

  ConfirmationNumber,
  History,
  Search,
  RateReview
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card, CardContent, CardMedia,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  TextField,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { cancelBookingApi, getMyBookingsApi, mergePendingBookingsApi } from '../../../shared/api/bookingApi'
import { formatCurrency, formatDate } from '../../../shared/utils/formatters'
import { getBookingRooms } from '../../payments/utils/bookingTotals'
import ReviewFormDialog from '../../reviews/ReviewFormDialog'

const PC = '#c0496e' // Tương ứng với primary.dark hoặc primary.contrastText trong theme (Màu hồng đậm chủ đạo)
const PC_LIGHT = '#fce4ec' // Tương ứng với primary.main (Màu hồng nhạt)

const BookingHistoryPage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null)
  const [selectedPendingIds, setSelectedPendingIds] = useState([])
  const [mergingPayment, setMergingPayment] = useState(false)

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  const fetchBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMyBookingsApi(checkIn, checkOut)
      setBookings(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(t('bookings_history.fetch_error') || 'Lỗi khi tải dữ liệu')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId) => {
    if (!window.confirm(t('bookings_history.confirm_cancel'))) return
    try {
      await cancelBookingApi(bookingId)
      fetchBookings()
    } catch (err) {
      console.error('Cancel error:', err)
      const msg = err.response?.data?.message || err.response?.data?.error || t('bookings_history.cancel_error')
      alert(msg)
    }
  }

  const nightsBetween = (a, b) => {
    const diff = new Date(b) - new Date(a)
    return diff > 0 ? Math.round(diff / 86400000) : 1
  }

  const getHistoryRoom = (booking) => {
    const rooms = getBookingRooms(booking)
    const matchedRoom = rooms.find(room => room.roomId === booking.roomId)
    return matchedRoom || {
      roomId: booking.roomId,
      roomNumber: booking.roomNumber,
      roomTypeName: booking.roomTypeName,
      hotelName: booking.hotelName,
      hotelAddress: booking.hotelAddress,
      roomPriceSnapshot: booking.roomPriceSnapshot,
      subtotal: Number(booking.roomPriceSnapshot || 0) * Number(booking.totalNights || nightsBetween(booking.checkInDate, booking.checkOutDate))
    }
  }

  const getHistoryRoomTotal = (booking) => {
    const historyRoom = getHistoryRoom(booking)
    return Number(historyRoom.subtotal || 0)
  }

  const handlePayment = (booking) => {
    const primaryRoom = getHistoryRoom(booking)
    navigate('/payment?step=1', {
      state: {
        booking,
        room: {
          roomId: primaryRoom.roomId || booking.roomId,
          roomNumber: primaryRoom.roomNumber || booking.roomNumber,
          typeName: primaryRoom.roomTypeName || booking.roomTypeName,
          pricePerNight: primaryRoom.roomPriceSnapshot || getHistoryRoomTotal(booking) / nightsBetween(booking.checkInDate, booking.checkOutDate)
        },
        form: {
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate,
          numAdults: booking.numAdults || 2,
          numChildren: booking.numChildren || 0
        }
      }
    })
  }

  const togglePendingBooking = (bookingId) => {
    setSelectedPendingIds(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    )
  }

  const handleSelectedPayment = async () => {
    if (selectedPendingIds.length === 0) return
    setMergingPayment(true)
    try {
      if (selectedPendingIds.length === 1) {
        const booking = bookings.find(item => item.bookingId === selectedPendingIds[0])
        if (booking) handlePayment(booking)
        return
      }
      const mergedBooking = await mergePendingBookingsApi(selectedPendingIds)
      setSelectedPendingIds([])
      navigate('/payment?step=1', {
        state: {
          booking: mergedBooking,
          room: mergedBooking.rooms?.[0],
          form: {
            checkIn: mergedBooking.checkInDate,
            checkOut: mergedBooking.checkOutDate,
            numAdults: mergedBooking.numAdults || 2,
            numChildren: mergedBooking.numChildren || 0
          }
        }
      })
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Không thể gom các booking đã chọn'
      alert(msg)
    } finally {
      setMergingPayment(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleSearch = () => {
    fetchBookings()
  }

  useEffect(() => {
    setSelectedPendingIds(prev =>
      prev.filter(id => bookings.some(booking => booking.bookingId === id && booking.status === 'PENDING'))
    )
  }, [bookings])



  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return '#4caf50'
      case 'PENDING': return '#ff9800'
      case 'CANCELLED': return '#f44336'
      case 'REFUNDED': return '#03a9f4' // Light Blue cho Hoàn tiền
      case 'CHECKED_IN': return '#c0496e'
      case 'CHECKED_OUT': return '#607d8b' // Blue Grey cho Checkout
      default: return '#757575'
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', color: '#333', pb: 8 }}> {/* bgcolor: '#fff' tương ứng với action.inputBg */}
      {/* Pink Header Banner */}
      <Box sx={{
        pt: 8, pb: 6,
        textAlign: 'center',
        bgcolor: '#fdf2f8', // Màu nền nhẹ của Header Banner, tương tự primary.main với độ mờ cao
        borderBottom: '1px solid #fce4ec' // Màu viền tương ứng primary.main
      }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: 1, textTransform: 'uppercase', color: PC }}>
          {t('header.bookings_history') || 'LỊCH SỬ ĐẶT PHÒNG'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          {t('bookings_history.subtitle', 'Quản lý các chuyến đi và lịch sử đặt phòng của bạn')}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1320, mx: 'auto', px: 3, mt: -4 }}>

        {/* Horizontal Filter Bar - Aligned with Grid Edges */}
        <Box sx={{ px: 1.5, mb: 6 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'stretch',
            bgcolor: PC,
            borderRadius: 3,
            border: `2px solid ${PC}`, // Thinner outer border
            overflow: 'hidden',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            p: 0.3,
            gap: 0.3, // Thinner separators (gap)
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
          }}>
            {/* Destination Segment - Thinner Border */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              px: 3, py: 1.2,
              flex: 1.5,
              bgcolor: '#fff',
              borderRadius: 2,
              border: `1px solid ${PC}` // Thinner inner border
            }}>
              <Box sx={{ width: '100%' }}>
                <Typography sx={{ color: '#888', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>
                  {t('booking_page.destination')}
                </Typography>
                <TextField
                  select
                  fullWidth
                  variant="standard"
                  defaultValue=""
                  SelectProps={{
                    native: true,
                    disableUnderline: true,
                    sx: { color: '#333', fontSize: 14, fontWeight: 600, py: 0 }
                  }}
                >
                  <option value="">{t('booking_page.anywhere') || 'Địa điểm bất kỳ'}</option>
                  <option value="HCM">{t('destinations.hcm.name')}</option>
                  <option value="HANOI">{t('destinations.hanoi.name')}</option>
                  <option value="VUNG_TAU">{t('destinations.vungtau.name')}</option>
                  <option value="DA_LAT">{t('destinations.dalat.name')}</option>
                  <option value="DA_NANG">{t('destinations.danang.name')}</option>
                  <option value="NHA_TRANG">{t('destinations.nhatrang.name')}</option>
                  <option value="PHU_QUOC">{t('destinations.phuquoc.name')}</option>
                  <option value="SAPA">{t('destinations.sapa.name')}</option>
                  <option value="HUE">{t('destinations.hue.name')}</option>
                  <option value="CAT_BA">{t('destinations.catba.name')}</option>
                </TextField>
              </Box>
            </Box>

            {/* Combined Date Range Segment - Thinner Border */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              px: 3, py: 1.2,
              flex: 2,
              bgcolor: '#fff',
              borderRadius: 2,
              border: `1px solid ${PC}` // Thinner inner border
            }}>
              <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ color: '#888', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>{t('bookings_history.check_in') || 'Nhận phòng'}</Typography>
                  <TextField
                    type="date"
                    variant="standard"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    InputProps={{
                      disableUnderline: true,
                      sx: { color: '#333', fontSize: 14, fontWeight: 600 }
                    }}
                    fullWidth
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', pt: 2, color: '#ccc' }}>
                  <Typography sx={{ fontWeight: 300 }}>—</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ color: '#888', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>{t('bookings_history.check_out') || 'Trả phòng'}</Typography>
                  <TextField
                    type="date"
                    variant="standard"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    InputProps={{
                      disableUnderline: true,
                      sx: { color: '#333', fontSize: 14, fontWeight: 600 }
                    }}
                    fullWidth
                  />
                </Box>
              </Box>
            </Box>

            {/* Search Button Segment - Matched with BookingPage Theme */}
            <Box sx={{ flex: 0.8, display: 'flex' }}>
              <Button
                onClick={handleSearch}
                variant="contained"
                startIcon={<Search />}
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  bgcolor: PC,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#a0365a' },
                  minWidth: { md: '180px' }
                }}
              >
                {t('common.search') || 'Tìm kiếm'}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Results Grid - Centered items */}
        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

        {bookings.some(booking => booking.status === 'PENDING') && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            p: 2,
            borderRadius: 3,
            bgcolor: '#fff',
            border: `1px solid ${PC_LIGHT}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <Typography sx={{ color: PC, fontWeight: 800 }}>
              Đã chọn {selectedPendingIds.length} phòng chờ thanh toán
            </Typography>
            <Button
              variant="contained"
              disabled={selectedPendingIds.length === 0 || mergingPayment}
              onClick={handleSelectedPayment}
              sx={{ borderRadius: 2, bgcolor: PC, color: '#fff', fontWeight: 800, px: 3 }}
            >
              {mergingPayment ? 'Đang xử lý...' : 'Thanh toán các phòng đã chọn'}
            </Button>
          </Box>
        )}

        <Grid container spacing={3} justifyContent="center">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
              </Grid>
            ))
          ) : bookings.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'center', py: 12, bgcolor: '#fafafa', borderRadius: 4, border: '1px dashed #ddd' }}>
                <History sx={{ fontSize: 64, color: '#ddd', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {t('bookings_history.no_data') || 'Bạn chưa có lịch sử đặt phòng nào.'}
                </Typography>
                <Button variant="outlined" sx={{ mt: 3, borderRadius: 2, color: PC, borderColor: PC }} href="/booking">
                  {t('common.book_now') || 'Đặt ngay'}
                </Button>
              </Box>
            </Grid>
          ) : (
            bookings.map((booking, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={booking.bookingId || index}>
                {(() => {
                  const primaryRoom = getHistoryRoom(booking)
                  return (
                <Card sx={{
                  height: '100%',
                  bgcolor: '#fff',
                  borderRadius: 3,
                  border: '1px solid #eee',
                  transition: 'all 0.3s',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
                  }
                }}>
                  {booking.status === 'PENDING' && (
                    <Checkbox
                      checked={selectedPendingIds.includes(booking.bookingId)}
                      onClick={(e) => { e.stopPropagation(); togglePendingBooking(booking.bookingId) }}
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        zIndex: 3,
                        bgcolor: 'rgba(255,255,255,0.95)',
                        borderRadius: '50%',
                        color: PC,
                        '&.Mui-checked': { color: PC },
                        '&:hover': { bgcolor: '#fff' }
                      }}
                    />
                  )}
                  {/* Status Overlay */}
                  <Box sx={{
                    position: 'absolute',
                    top: 12, right: 12,
                    zIndex: 2,
                    bgcolor: getStatusColor(booking.status),
                    color: '#fff',
                    px: 1, py: 0.3,
                    borderRadius: 1,
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}>
                    {booking.status}
                  </Box>

                  <CardMedia
                    component="img"
                    height="180"
                    image={'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400'}
                    alt="Room"
                  />

                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="caption" sx={{ color: PC, fontWeight: 700, mb: 0.5, display: 'block' }}>
                      {primaryRoom.roomTypeName || booking.roomTypeName || 'Standard'}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, lineHeight: 1.2, color: '#333' }}>
                      {t('booking_page.room') || 'Phòng'} {primaryRoom.roomNumber || booking.roomNumber}
                    </Typography>
                    {(primaryRoom.hotelName || primaryRoom.hotelAddress) && (
                      <Box sx={{ mb: 1.5 }}>
                        {primaryRoom.hotelName && (
                          <Typography variant="caption" color="text.secondary" display="block">{primaryRoom.hotelName}</Typography>
                        )}
                        {primaryRoom.hotelAddress && (
                          <Typography variant="caption" color="text.secondary" display="block">{primaryRoom.hotelAddress}</Typography>
                        )}
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#888' }}>
                      <ConfirmationNumber sx={{ fontSize: 14 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{booking.bookingCode}</Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ color: '#999', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{t('bookings_history.check_in_short') || 'In'}</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#444' }}>{formatDate(booking.checkInDate)}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ color: '#999', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{t('bookings_history.check_out_short') || 'Out'}</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#444' }}>{formatDate(booking.checkOutDate)}</Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: PC }}>
                        {formatCurrency(getHistoryRoomTotal(booking))}
                      </Typography>

                    </Box>

                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleCancel(booking.bookingId)}
                          sx={{ borderRadius: 2, fontSize: 11, fontWeight: 700 }}
                        >
                          {t('common.cancel')}
                        </Button>
                        {booking.status === 'PENDING' && (
                          <Button
                            fullWidth
                            variant="contained"
                            size="small"
                            onClick={() => handlePayment(booking)}
                            sx={{
                              borderRadius: 2,
                              fontSize: 11,
                              fontWeight: 700,
                              bgcolor: PC,
                              color: '#fff',
                              '&:hover': { bgcolor: '#a0365a' }
                            }}
                          >
                            {t('common.pay_now')}
                          </Button>
                        )}
                      </Box>
                    )}
                    {booking.status === 'CHECKED_OUT' && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<RateReview />}
                          onClick={() => {
                            setSelectedBookingForReview(booking)
                            setReviewDialogOpen(true)
                          }}
                          sx={{
                            borderRadius: 2, fontSize: 11, fontWeight: 700,
                            borderColor: PC, color: PC,
                            '&:hover': { bgcolor: '#fdf2f8', borderColor: PC }
                          }}
                        >
                          {t('reviews.write_review')}
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
                  )
                })()}
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      {/* Review Dialog */}
      {selectedBookingForReview && (
        <ReviewFormDialog
          open={reviewDialogOpen}
          onClose={() => { setReviewDialogOpen(false); setSelectedBookingForReview(null); }}
          booking={selectedBookingForReview}
          onReviewSubmitted={() => fetchBookings()}
        />
      )}
    </Box>
  )
}

export default BookingHistoryPage
