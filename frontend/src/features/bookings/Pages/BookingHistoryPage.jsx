import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, TextField, Paper, Skeleton, Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getMyBookingsApi } from '../../../shared/api/bookingApi';

const BookingHistoryPage = () => {
  const { t, i18n } = useTranslation();
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
      setBookings(data || []);
    } catch (err) {
      setError(t('bookings_history.fetch_error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [checkIn, checkOut]);

  const formatCurrency = (value) => {
    if (!value) return '0 VND';
    return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { 
      style: 'currency', 
      currency: i18n.language === 'vi' ? 'VND' : 'USD' 
    }).format(i18n.language === 'vi' ? value : value / 25000);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#121212', color: '#fff' }}>
      <Grid container spacing={4}>
        {/* Cột trái: Bộ lọc */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 2, border: '1px solid #333' }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              {t('bookings_history.title')}
            </Typography>
            <Box mb={3}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 1 }}>
                {t('bookings_history.check_in')}
              </Typography>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  bgcolor: '#fff',
                  borderRadius: 1,
                  input: { color: '#000' }
                }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 1 }}>
                {t('bookings_history.check_out')}
              </Typography>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  bgcolor: '#fff',
                  borderRadius: 1,
                  input: { color: '#000' }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Cột phải: Danh sách Booking */}
        <Grid item xs={12} md={9}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2}>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Skeleton variant="rectangular" height={160} sx={{ bgcolor: 'grey.800', borderRadius: 2 }} />
                </Grid>
              ))
            ) : bookings.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#1e1e1e', color: '#888', border: '1px dashed #444' }}>
                  <Typography variant="body1">
                    {t('bookings_history.no_data')}
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              bookings.map((booking, index) => (
                <Grid item xs={12} sm={6} md={3} key={booking.bookingId || index}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: '#1e1e1e',
                      color: '#fff',
                      height: 160,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 2,
                      border: '1px solid #333',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: '#888', transform: 'translateY(-4px)' }
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      Booking {booking.bookingId}
                    </Typography>
                    <Typography variant="body2" color="grey.500" mt={0.5}>
                      {booking.bookingCode}
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 1, bgcolor: '#333', px: 1, py: 0.5, borderRadius: 1 }}>
                      {booking.checkInDate} {t('rooms.per_night')} {booking.checkOutDate}
                    </Typography>
                    <Typography variant="body2" color="primary.main" fontWeight="bold" mt={1}>
                      {formatCurrency(booking.grandTotal)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: booking.status === 'CONFIRMED' ? 'success.main' : booking.status === 'PENDING' ? 'warning.main' : 'error.main', mt: 0.5, fontWeight: 'bold' }}>
                      {booking.status}
                    </Typography>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingHistoryPage;
