import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, TextField, Paper, Skeleton, Alert,
  Chip, Button, Divider, InputAdornment, Card, CardContent, CardMedia, IconButton
} from '@mui/material';
import { 
  CalendarToday, 
  History, 
  Search,
  MeetingRoom,
  ConfirmationNumber,
  ChevronRight,
  CheckCircle,
  Pending,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getMyBookingsApi, cancelBookingApi } from '../../../shared/api/bookingApi';
import { useNavigate } from 'react-router-dom';

const PC = '#c0496e';
const PC_LIGHT = '#fce4ec';

const BookingHistoryPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyBookingsApi(checkIn, checkOut);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(t('bookings_history.fetch_error') || 'Lỗi khi tải dữ liệu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm(t('bookings_history.confirm_cancel') || 'Bạn có chắc chắn muốn hủy đặt phòng này?')) return;
    try {
      await cancelBookingApi(bookingId);
      fetchBookings();
    } catch (err) {
      alert(t('bookings_history.cancel_error') || 'Lỗi khi hủy đặt phòng');
    }
  };

  const handlePayment = (booking) => {
    navigate('/payment?step=1', { 
      state: { 
        booking,
        room: {
          roomId: booking.roomId,
          roomNumber: booking.roomNumber,
          typeName: booking.roomTypeName,
          pricePerNight: booking.grandTotal / nightsBetween(booking.checkInDate, booking.checkOutDate)
        },
        form: {
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate,
          numAdults: booking.numAdults || 2,
          numChildren: booking.numChildren || 0
        }
      } 
    });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSearch = () => {
    fetchBookings();
  };

  const formatCurrency = (value) => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { 
      style: 'currency', 
      currency: i18n.language === 'vi' ? 'VND' : 'USD' 
    }).format(i18n.language === 'vi' ? value : value / 25000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return '#4caf50';
      case 'PENDING': return '#ff9800';
      case 'CANCELLED':
      case 'REFUNDED': return '#f44336';
      case 'CHECKED_IN': return '#c0496e';
      case 'CHECKED_OUT': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', color: '#333', pb: 8 }}>
      {/* Pink Header Banner */}
      <Box sx={{ 
        pt: 8, pb: 6, 
        textAlign: 'center', 
        bgcolor: '#fdf2f8', 
        borderBottom: '1px solid #fce4ec'
      }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: 1, textTransform: 'uppercase', color: PC }}>
          {t('header.bookings_history') || 'LỊCH SỬ ĐẶT PHÒNG'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          {t('bookings_history.subtitle') === 'bookings_history.subtitle' ? 'Quản lý các chuyến đi và lịch sử đặt phòng của bạn' : (t('bookings_history.subtitle') || 'Quản lý các chuyến đi và lịch sử đặt phòng của bạn')}
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
                  {t('booking_page.destination') || 'Nơi đến'}
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
                  <option value="HCM">TP. Hồ Chí Minh</option>
                  <option value="HANOI">Hà Nội</option>
                  <option value="VUNG_TAU">Vũng Tàu</option>
                  <option value="DA_LAT">Đà Lạt</option>
                  <option value="DA_NANG">Đà Nẵng</option>
                  <option value="NHA_TRANG">Nha Trang</option>
                  <option value="PHU_QUOC">Phú Quốc</option>
                  <option value="SAPA">Sapa</option>
                  <option value="HUE">Huế</option>
                  <option value="CAT_BA">Cát Bà</option>
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
                  <Typography sx={{ color: '#888', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>Nhận phòng</Typography>
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
                  <Typography sx={{ color: '#888', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>Trả phòng</Typography>
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

        <Grid container spacing={3} justifyContent="center">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={3} lg={3} key={i}>
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
              </Grid>
            ))
          ) : bookings.length === 0 ? (
            <Grid item xs={12}>
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
              <Grid item xs={12} sm={6} md={3} lg={3} key={booking.bookingId || index}>
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
                    image={`https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400`}
                    alt="Room"
                  />
                  
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="caption" sx={{ color: PC, fontWeight: 700, mb: 0.5, display: 'block' }}>
                      {booking.roomTypeName || 'Standard'}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, lineHeight: 1.2, color: '#333' }}>
                      {t('booking_page.room') || 'Phòng'} {booking.roomNumber}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#888' }}>
                      <ConfirmationNumber sx={{ fontSize: 14 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{booking.bookingCode}</Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography sx={{ color: '#999', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>In</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#444' }}>{booking.checkInDate}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography sx={{ color: '#999', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Out</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#444' }}>{booking.checkOutDate}</Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: PC }}>
                        {formatCurrency(booking.grandTotal)}
                      </Typography>
                      <IconButton size="small" sx={{ bgcolor: '#fdf2f8', color: PC, '&:hover': { bgcolor: PC_LIGHT } }}>
                        <ChevronRight fontSize="small" />
                      </IconButton>
                    </Box>

                    {booking.status === 'PENDING' && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button 
                          fullWidth 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          onClick={() => handleCancel(booking.bookingId)}
                          sx={{ borderRadius: 2, fontSize: 11, fontWeight: 700 }}
                        >
                          {t('common.cancel') || 'Hủy'}
                        </Button>
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
                            '&:hover': { bgcolor: '#a0365a' }
                          }}
                        >
                          {t('common.pay_now') || 'Thanh toán'}
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default BookingHistoryPage;
