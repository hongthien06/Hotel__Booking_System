/* eslint-disable indent */
import {
  ConfirmationNumber,
  History,
  Search,
  RateReview,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Replay,
  InsertInvitation,
  DarkMode,
  AccountBalanceWallet,
  Star
} from '@mui/icons-material'
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Chip,
  Card, CardContent, CardMedia,
  Checkbox,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Skeleton,
  TextField,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DESTINATIONS } from '../BookingPage'
import { useNavigate } from 'react-router-dom'
import { cancelBookingApi, getMyBookingsApi, mergePendingBookingsApi } from '../../../shared/api/bookingApi'
import { getMyMembershipApi } from '../../../shared/api/membershipApi'
import { checkReviewExists } from '../../../shared/api/reviewApi'
import { getRoomByIdApi } from '../../../shared/api/roomApi'
import RoomDetail from '../../rooms/Details/RoomDetail'
import { formatCurrency, formatDate } from '../../../shared/utils/formatters'
import { getBookingRooms } from '../../payments/utils/bookingTotals'
import ReviewFormDialog from '../../reviews/ReviewFormDialog'
import imgNoResults from '../../../assets/KhongthayKQ.png'

const PC = '#c0496e' // Tương ứng với primary.dark hoặc primary.contrastText trong theme (Màu hồng đậm chủ đạo)
const PC_LIGHT = '#fce4ec' // Tương ứng với primary.main (Màu hồng nhạt)

const getStatusColor = (status) => {
  switch (status) {
    case 'CONFIRMED': return '#4caf50'
    case 'PENDING': return '#ff9800'
    case 'CANCELLED': return '#f44336'
    case 'REFUNDED': return '#03a9f4'
    case 'CHECKED_IN': return '#c0496e'
    case 'CHECKED_OUT': return '#607d8b'
    default: return '#757575'
  }
}

const BookingHistoryPage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null)
  const [selectedPendingIds, setSelectedPendingIds] = useState([])
  const [mergingPayment, setMergingPayment] = useState(false)
  const [reviewedBookings, setReviewedBookings] = useState({})

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [destination, setDestination] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [roomDetailOpen, setRoomDetailOpen] = useState(false)
  const [loadingRoom, setLoadingRoom] = useState(false)

  const handleCardClick = async (booking) => {
    const primaryRoom = getHistoryRoom(booking)
    if (!primaryRoom.roomId) return
    setLoadingRoom(true)
    try {
      const roomData = await getRoomByIdApi(primaryRoom.roomId)
      setSelectedRoom(roomData)
      setRoomDetailOpen(true)
    } catch (err) {
      console.error('Failed to fetch room details:', err)
      // Fallback
      setSelectedRoom({
        id: primaryRoom.roomId,
        roomNumber: primaryRoom.roomNumber,
        typeName: primaryRoom.roomTypeName,
        hotelName: primaryRoom.hotelName,
        address: primaryRoom.hotelAddress,
        pricePerNight: primaryRoom.roomPriceSnapshot,
        status: booking.status === 'CHECKED_OUT' ? 'AVAILABLE' : 'OCCUPIED'
      })
      setRoomDetailOpen(true)
    } finally {
      setLoadingRoom(false)
    }
  }

  const fetchBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMyBookingsApi(checkIn, checkOut)
      const list = Array.isArray(data) ? data : []
      setBookings(list)

      // Kiểm tra trạng thái review cho các booking
      const checkedOutBookings = list
      const reviewChecks = {}
      await Promise.all(
        checkedOutBookings.map(async (b) => {
          try {
            const result = await checkReviewExists(b.bookingId)
            reviewChecks[b.bookingId] = result.reviewed
          } catch {
            reviewChecks[b.bookingId] = false
          }
        })
      )
      setReviewedBookings(prev => ({ ...prev, ...reviewChecks }))
    } catch (err) {
      setError(t('bookings_history.fetch_error'))
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
    if (!a || !b) return 0
    const start = new Date(a)
    const end = new Date(b)
    const now = new Date()
    // If check-in is in the future, guest hasn't stayed yet -> 0 nights
    if (start > now) return 0
    const diff = end - start
    return diff > 0 ? Math.round(diff / 86400000) : 0
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
    const rooms = getBookingRooms(booking)
    const nights = Number(booking.totalNights || nightsBetween(booking.checkInDate, booking.checkOutDate) || 0)
    return rooms.reduce((sum, r) => sum + (Number(r.roomPriceSnapshot || 0) * nights), 0)
  }

  const handlePayment = (booking) => {
    const primaryRoom = getHistoryRoom(booking)
    const nights = nightsBetween(booking.checkInDate, booking.checkOutDate)
    navigate('/payment?step=1', {
      state: {
        booking,
        room: {
          roomId: primaryRoom.roomId || booking.roomId,
          roomNumber: primaryRoom.roomNumber || booking.roomNumber,
          typeName: primaryRoom.roomTypeName || booking.roomTypeName,
          pricePerNight: primaryRoom.roomPriceSnapshot || (nights ? getHistoryRoomTotal(booking) / nights : getHistoryRoomTotal(booking))
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
    getMyMembershipApi().then(setMembership).catch(() => {})
  }, [])

  const formatMillions = (value) => {
    if (!value) return '0'
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1).replace('.0', '') + 'M'
    }
    return new Intl.NumberFormat('vi-VN').format(value)
  }

  const totalBookings = membership?.bookingCount || bookings.length || 0
  // Total spent should only include bookings that reached CONFIRMED (paid)
  const totalSpent = membership?.totalSpent || bookings.reduce((sum, b) => {
    if (b.status !== 'CONFIRMED') return sum
    const price = Number(b.finalAmount || b.totalAmount || getHistoryRoomTotal(b) || 0)
    return sum + price
  }, 0)
  const totalNights = bookings.reduce((sum, b) => sum + (b.status !== 'CANCELLED' && b.status !== 'REFUNDED' ? Number(b.totalNights || nightsBetween(b.checkInDate, b.checkOutDate) || 0) : 0), 0)
  const memberPoints = membership?.points || Math.floor(totalSpent / 100000)

  const handleSearch = () => {
    fetchBookings()
  }

  const preFilteredBookings = bookings.filter(b => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const str = JSON.stringify(b).toLowerCase()
      if (!str.includes(term)) return false
    }
    if (destination) {
      const str = JSON.stringify(b).toLowerCase()
      const destNorm = String(destination).toLowerCase()
      // support common aliases for major cities (e.g., Sài Gòn <-> TP. Hồ Chí Minh)
      const aliasMap = {
        'tp. hồ chí minh': ['sài gòn', 'saigon', 'hcm', 'tp hcm', 'ho chi minh'],
        'tp. hồ chí minh': ['sài gòn', 'saigon', 'hcm', 'tp hcm', 'ho chi minh'],
      }
      const aliases = aliasMap[destNorm] || []
      const matchesMain = str.includes(destNorm)
      const matchesAlias = aliases.some(a => str.includes(a))
      if (!matchesMain && !matchesAlias) return false
    }
    return true
  })

  const counts = {
    ALL: preFilteredBookings.length,
    UPCOMING: preFilteredBookings.filter(b => ['CONFIRMED', 'PENDING', 'CHECKED_IN'].includes(b.status)).length,
    COMPLETED: preFilteredBookings.filter(b => b.status === 'CHECKED_OUT').length,
    CANCELLED: preFilteredBookings.filter(b => ['CANCELLED', 'REFUNDED'].includes(b.status)).length,
  }

  const filteredBookings = preFilteredBookings.filter(b => {
    if (statusFilter === 'UPCOMING') return ['CONFIRMED', 'PENDING', 'CHECKED_IN'].includes(b.status)
    if (statusFilter === 'COMPLETED') return b.status === 'CHECKED_OUT'
    if (statusFilter === 'CANCELLED') return ['CANCELLED', 'REFUNDED'].includes(b.status)
    return true
  })

  const getBookingPrice = (b) => Number(b.finalAmount || b.totalAmount || getHistoryRoomTotal(b) || 0)

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === 'newest') {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0)
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0)
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB - dateA
      }
      return (b.bookingId || 0) - (a.bookingId || 0)
    }
    if (sortBy === 'oldest') {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0)
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0)
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB
      }
      return (a.bookingId || 0) - (b.bookingId || 0)
    }
    if (sortBy === 'price_desc') {
      return getBookingPrice(b) - getBookingPrice(a)
    }
    if (sortBy === 'price_asc') {
      return getBookingPrice(a) - getBookingPrice(b)
    }
    return 0
  })

  useEffect(() => {
    setSelectedPendingIds(prev =>
      prev.filter(id => bookings.some(booking => booking.bookingId === id && booking.status === 'PENDING'))
    )
  }, [bookings])



  

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', color: '#333', pb: 8 }}> {/* bgcolor: '#fff' tương ứng với action.inputBg */}
      {/* Pink Header Banner */}
      <Box sx={{
        pt: 8, pb: 6,
        textAlign: 'center',
        bgcolor: '#fdf2f8', // Màu nền nhẹ của Header Banner, tương tự primary.main với độ mờ cao
        borderBottom: '1px solid #fce4ec' // Màu viền tương ứng primary.main
      }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, letterSpacing: 1.2, textTransform: 'uppercase', color: PC, fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' } }}>
          {t('header.bookings_history')}
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 5, fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' }, fontWeight: 500 }}>
          {t('bookings_history.subtitle', 'Quản lý các chuyến đi và lịch sử đặt phòng của bạn')}
        </Typography>

        {/* Stats Cards */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2, 
          flexWrap: 'wrap', 
          maxWidth: 1000, 
          mx: 'auto', 
          px: 3 
        }}>
          {/* Card 1 */}
          <Box sx={{ flex: 1, minWidth: 200, bgcolor: 'background.paper', borderRadius: 3, p: 2.5, textAlign: 'left', border: '1px solid', borderColor: 'primary.main', boxShadow: '0 8px 24px rgba(160, 27, 76, 0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <InsertInvitation sx={{ color: 'primary.dark', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{t('bookings_history.total_bookings')}</Typography>
            </Box>
            <Typography variant="h4" sx={{ color: 'primary.dark', fontWeight: 800, mb: 0.5 }}>{totalBookings}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{t('bookings_history.since_joined')}</Typography>
          </Box>

          {/* Card 2 */}
          <Box sx={{ flex: 1, minWidth: 200, bgcolor: 'background.paper', borderRadius: 3, p: 2.5, textAlign: 'left', border: '1px solid', borderColor: 'primary.main', boxShadow: '0 8px 24px rgba(160, 27, 76, 0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <DarkMode sx={{ color: 'primary.dark', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{t('bookings_history.total_nights')}</Typography>
            </Box>
            <Typography variant="h4" sx={{ color: 'primary.dark', fontWeight: 800, mb: 0.5 }}>{totalNights}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{t('bookings_history.nights_stayed')}</Typography>
          </Box>

          {/* Card 3 */}
          <Box sx={{ flex: 1, minWidth: 200, bgcolor: 'background.paper', borderRadius: 3, p: 2.5, textAlign: 'left', border: '1px solid', borderColor: 'primary.main', boxShadow: '0 8px 24px rgba(160, 27, 76, 0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <AccountBalanceWallet sx={{ color: 'primary.dark', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{t('bookings_history.total_spent_label')}</Typography>
            </Box>
            {(() => {
              const lng = (i18n.language || 'vi').toLowerCase()
              if (lng.startsWith('vi')) {
                const unit = t('bookings_history.currency_unit') || 'đồng'
                return (
                  <>
                    <Typography variant="h4" sx={{ color: 'primary.dark', fontWeight: 800, mb: 0.5, fontSize: { xs: '1.6rem', sm: '2rem', md: '2.2rem' }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatMillions(totalSpent)}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{unit}</Typography>
                  </>
                )
              }
              // For non-Vietnamese locales show formatted currency and small USD caption below the amount
              return (
                <>
                  <Typography variant="h4" sx={{ color: 'primary.dark', fontWeight: 800, mb: 0.5, fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatCurrency(totalSpent)}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{'USD'}</Typography>
                </>
              )
            })()}
          </Box>

          {/* Card 4 */}
          <Box sx={{ flex: 1, minWidth: 200, bgcolor: 'background.paper', borderRadius: 3, p: 2.5, textAlign: 'left', border: '1px solid', borderColor: 'primary.main', boxShadow: '0 8px 24px rgba(160, 27, 76, 0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Star sx={{ color: 'primary.dark', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{t('bookings_history.membership_points')}</Typography>
            </Box>
            <Typography variant="h4" sx={{ color: 'primary.dark', fontWeight: 800, mb: 0.5 }}>{new Intl.NumberFormat('vi-VN').format(memberPoints)}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{t('bookings_history.points_label')}</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1320, mx: 'auto', px: 3, mt: -5 }}>
        {/* Horizontal Filter Bar */}
        <Box sx={{
          bgcolor: 'background.paper',
          borderRadius: 3,
          py: 'calc(12px + 0.25cm)',
          px: 2,
          mb: 3,
          border: '1px solid',
          borderColor: 'primary.main',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1.5,
          alignItems: 'center',
          boxShadow: '0 8px 24px rgba(160, 27, 76, 0.05)'
        }}>
          {/* Search text field */}
          <TextField
            placeholder={t('bookings_history.search_placeholder', 'Tìm theo tên khách sạn, mã đặt phòng...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: 'primary.dark', mr: 1, fontSize: 20 }} />
            }}
            size="small"
            sx={{ flex: 2.5, width: '100%' }}
          />
          {/* Check in */}
          <TextField
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            size="small"
            sx={{ flex: 1, width: '100%' }}
          />
          {/* Check out */}
          <TextField
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            size="small"
            sx={{ flex: 1, width: '100%' }}
          />
          {/* Destination */}
          <TextField
            select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            size="small"
            sx={{ flex: 1.5, width: '100%' }}
            SelectProps={{ native: false, MenuProps: { PaperProps: { sx: { maxHeight: 300, borderRadius: 2 } } } }}
          >
            <MenuItem value="">{t('bookings_history.all_locations', 'Tất cả địa điểm')}</MenuItem>
            {
              // Render exactly the destinations defined in DESTINATIONS (no extras, no dedupe logic)
              DESTINATIONS.map(d => (
                <MenuItem key={d.key} value={d.province || d.name}>{t(`destinations.${d.key}.name`) || (d.province || d.name)}</MenuItem>
              ))
            }
          </TextField>
          {/* Search button */}
          <Button
            variant="historySearchButton"
            onClick={handleSearch}
            startIcon={<Search />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              py: { xs: 1, md: 0.75 },
              px: 3,
              width: { xs: '100%', md: 'auto' },
              height: 40
            }}
          >
            {t('bookings_history.search_button', 'Tìm kiếm')}
          </Button>
        </Box>

        {/* Status Filter Chips */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
          {[
            { label: t('bookings_history.filter_all', 'Tất cả'), count: counts.ALL, value: 'ALL' },
            { label: t('bookings_history.filter_upcoming', 'Sắp tới'), count: counts.UPCOMING, value: 'UPCOMING' },
            { label: t('bookings_history.filter_completed', 'Đã ở'), count: counts.COMPLETED, value: 'COMPLETED' },
            { label: t('bookings_history.filter_cancelled', 'Đã hủy'), count: counts.CANCELLED, value: 'CANCELLED' }
          ].map(chip => {
            const isActive = statusFilter === chip.value
            return (
              <Box
                key={chip.value}
                onClick={() => setStatusFilter(chip.value)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  px: 2, py: 0.75,
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: isActive ? 'primary.dark' : 'action.inputBorder',
                  bgcolor: isActive ? 'primary.dark' : 'background.paper',
                  color: isActive ? '#fff' : 'text.primary',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 4px 12px rgba(192, 40, 96, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.02)',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'primary.main',
                    borderColor: 'primary.dark',
                    color: isActive ? '#fff' : 'primary.contrastText'
                  }
                }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: isActive ? 600 : 500 }}>{chip.label}</Typography>
                <Box sx={{
                  px: 1, py: 0.25,
                  borderRadius: 4,
                  bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'action.inputBg',
                  color: isActive ? '#fff' : 'primary.contrastText',
                  fontSize: 12, fontWeight: 700
                }}>
                  {chip.count}
                </Box>
              </Box>
            )
          })}
        </Box>

        {/* Results count & Sort Bar */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 14, fontWeight: 600, maxWidth: 150, lineHeight: 1.2 }}>
            {t('bookings_history.showing_results', { count: sortedBookings.length }) || `Hiển thị ${sortedBookings.length} kết quả`}
          </Typography>
          <TextField
            select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                    border: '1px solid',
                    borderColor: 'action.inputBorder',
                    '& .MuiMenuItem-root': {
                      fontSize: 14,
                      color: 'text.primary',
                      py: 1,
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText'
                      },
                      '&.Mui-selected': {
                        bgcolor: 'primary.dark',
                        color: '#fff',
                        '&:hover': {
                          bgcolor: 'primary.dark'
                        }
                      }
                    }
                  }
                }
              }
            }}
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="newest">{t('bookings_history.sort_newest')}</MenuItem>
            <MenuItem value="oldest">{t('bookings_history.sort_oldest')}</MenuItem>
            <MenuItem value="price_desc">{t('bookings_history.sort_price_desc')}</MenuItem>
            <MenuItem value="price_asc">{t('bookings_history.sort_price_asc')}</MenuItem>
          </TextField>
        </Box>

        {/* Results Grid - Centered items */}
        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

        {sortedBookings.some(booking => booking.status === 'PENDING') && (
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
              variant="payButton"
              disabled={selectedPendingIds.length === 0 || mergingPayment}
              onClick={handleSelectedPayment}
              sx={{ borderRadius: 2, fontWeight: 800, px: 3 }}
            >
              {mergingPayment ? 'Đang xử lý...' : 'Thanh toán các phòng đã chọn'}
            </Button>
          </Box>
        )}

        <Grid container spacing={3} justifyContent="flex-start">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
              </Grid>
            ))
          ) : sortedBookings.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Card sx={{ width: '100%', p: 0, display: 'flex', gap: 2, alignItems: 'stretch', mx: 'auto', borderRadius: 3, boxShadow: 1, overflow: 'hidden', minHeight: { xs: 'calc(120px + 3cm)', sm: 'calc(160px + 3cm)' } }}>
                  <Box component="img" src={imgNoResults} alt={t('bookings_history.no_data')}
                    sx={{ width: { xs: 120, sm: 280 }, height: '100%', objectFit: 'cover', flexShrink: 0, display: 'block' }}
                  />
                  <Box sx={{ textAlign: 'left', flex: 1, p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: PC }}>
                      {t('bookings_history.no_data')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {t('bookings_history.empty_cta')}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ mt: 1 }}>
                      <Button variant="historyBookNowButton" sx={{ borderRadius: 2 }} href="/bookings">
                        {t('common.book_now')}
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Box>
            </Grid>
          ) : (
            sortedBookings.map((booking, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={booking.bookingId || index}>
                {(() => {
                  const primaryRoom = getHistoryRoom(booking)
                  const allRooms = getBookingRooms(booking)
                  const roomNumbersStr = allRooms.map(r => r.roomNumber).filter(Boolean).join(', ')
                  const roomTypesStr = allRooms.map(r => r.roomTypeName || 'Standard').filter((v, i, a) => a.indexOf(v) === i).join(' + ')
                  return (
                <Card 
                  onClick={() => handleCardClick(booking)}
                  sx={{
                    height: '100%',
                    bgcolor: '#fff',
                    borderRadius: 3,
                    border: '1px solid #eee',
                    transition: 'all 0.3s',
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
                    }
                  }}
                >
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
                  <StatusChip status={booking.status} />

                  <CardMedia
                    component="img"
                    height="180"
                    image={'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400'}
                    alt="Room"
                  />

                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="caption" sx={{ color: PC, fontWeight: 700, mb: 0.5, display: 'block' }}>
                      {roomTypesStr || 'Standard'}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, lineHeight: 1.2, color: '#333' }}>
                      {allRooms.length > 1 
                        ? `${t('booking_page.room')} ${roomNumbersStr}`
                        : `${t('booking_page.room')} ${primaryRoom.roomNumber || booking.roomNumber}`}
                    </Typography>
                    {(primaryRoom.hotelName || primaryRoom.hotelAddress) && (
                      <Box sx={{ mb: 1.5 }}>
                            {(() => {
                              const lng = (i18n.language || 'vi').toLowerCase()
                              const hotelName = (!lng.startsWith('vi') && (primaryRoom.hotelNameEn || primaryRoom.hotelName_en)) ? (primaryRoom.hotelNameEn || primaryRoom.hotelName_en) : primaryRoom.hotelName
                              let hotelAddress = (!lng.startsWith('vi') && (primaryRoom.hotelAddressEn || primaryRoom.hotelAddress_en)) ? (primaryRoom.hotelAddressEn || primaryRoom.hotelAddress_en) : primaryRoom.hotelAddress

                              // If running in English locale but no explicit English address provided,
                              // apply a lightweight conversion of common Vietnamese abbreviations to English.
                              if (lng.startsWith('en') && hotelAddress && !(primaryRoom.hotelAddressEn || primaryRoom.hotelAddress_en)) {
                                hotelAddress = hotelAddress
                                  .replace(/\bP\.\s*/g, 'Ward ')
                                  .replace(/\bPhường\b/g, 'Ward')
                                  .replace(/\bQ\.\s*/g, 'District ')
                                  .replace(/\bQuận\b/g, 'District')
                                  .replace(/\bTP\.\s*/g, 'City ')
                                  .replace(/\bTp\.\s*/g, 'City ')
                                  .replace(/\bThành phố\b/g, 'City')
                                  .replace(/\bĐường\b/g, 'Street')
                                  .replace(/\bDường\b/g, 'Street')
                                  .replace(/\bPhố\b/g, 'Street')
                                  .replace(/\bĐ\.?\s*/g, '')
                                  .replace(/\s+\(.*?\)\s*/g, ' ') // remove parentheses content like district hints
                                  .trim()
                              }

                              return (
                                <>
                                  {hotelName && (
                                    <Typography variant="caption" color="text.secondary" display="block">{hotelName}</Typography>
                                  )}
                                  {hotelAddress && (
                                    <Typography variant="caption" color="text.secondary" display="block">{hotelAddress}</Typography>
                                  )}
                                </>
                              )
                            })()}
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#888' }}>
                      <ConfirmationNumber sx={{ fontSize: 14 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{booking.bookingCode}</Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ color: '#999', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{t('bookings_history.check_in_short')}</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#444' }}>{formatDate(booking.checkInDate)}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ color: '#999', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{t('bookings_history.check_out_short')}</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#444' }}>{formatDate(booking.checkOutDate)}</Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: PC, lineHeight: 1.2 }}>
                        {formatCurrency(getHistoryRoomTotal(booking))}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600 }}>
                        ({t('bookings_history.original_price') || 'Giá gốc'})
                      </Typography>
                    </Box>

                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleCancel(booking.bookingId); }}
                          sx={{ borderRadius: 2, fontSize: 11, fontWeight: 700 }}
                        >
                          {t('common.cancel')}
                        </Button>
                        {booking.status === 'PENDING' && (
                          <Button
                            fullWidth
                            variant="payButton"
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handlePayment(booking); }}
                            sx={{
                              borderRadius: 2,
                              fontSize: 11
                            }}
                          >
                            {t('common.pay_now')}
                          </Button>
                        )}
                      </Box>
                    )}
                    {(booking.status === 'CHECKED_IN' || booking.status === 'CHECKED_OUT') && (
                      <Box sx={{ mt: 2 }}>
                        {reviewedBookings[booking.bookingId] ? (
                          <Button
                            fullWidth
                            variant="contained"
                            size="small"
                            disabled
                            sx={{
                              borderRadius: 2,
                              fontSize: 11,
                              fontWeight: 700,
                              bgcolor: PC_LIGHT,
                              color: PC,
                              '&.Mui-disabled': { borderColor: '#c8e6c9', color: '#81c784' }
                            }}
                          >
                            {t('reviews.already_reviewed')}
                          </Button>
                        ) : (
                          <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            startIcon={<RateReview />}
                            onClick={(e) => {
                              e.stopPropagation()
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
                        )}
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

      {/* Room Detail Dialog */}
      {selectedRoom && (
        <RoomDetail
          open={roomDetailOpen}
          room={selectedRoom}
          onClose={() => { setRoomDetailOpen(false); setSelectedRoom(null); }}
          onBook={(room) => navigate('/bookings', { state: { autoBookRoom: room } })}
          canEdit={false}
          bookButtonText={t('common.rebook')}
        />
      )}

      {/* Backdrop loading overlay */}
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loadingRoom}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  )
}

// Small helper to render a status chip with icon
const StatusChip = ({ status }) => {
  const iconMap = {
    CONFIRMED: <CheckCircle sx={{ fontSize: 16 }} />,
    PENDING: <HourglassEmpty sx={{ fontSize: 16 }} />,
    CANCELLED: <Cancel sx={{ fontSize: 16 }} />,
    REFUNDED: <Replay sx={{ fontSize: 16 }} />,
    CHECKED_IN: <CheckCircle sx={{ fontSize: 16 }} />
  }
  const color = getStatusColor(status)
  return (
    <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
      <Chip
        icon={iconMap[status] || <History sx={{ fontSize: 16 }} />}
        label={status}
        size="small"
        sx={{
          bgcolor: color,
          color: '#fff',
          fontWeight: 800,
          textTransform: 'uppercase',
          px: 1,
          py: 0.25,
        }}
      />
    </Box>
  )
}

export default BookingHistoryPage
