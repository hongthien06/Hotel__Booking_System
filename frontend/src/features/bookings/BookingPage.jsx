import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Chip,
  InputAdornment,
  Skeleton,
  Alert
} from '@mui/material';
import { Search, CalendarMonth, People, LocationOn } from '@mui/icons-material';
import { getRoomsApi, getAvailableRoomsApi } from '../../shared/api/roomApi';

const BookingPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [searchParams, setSearchParams] = useState({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guests: 1
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRoomsApi();
        setRooms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    if (!searchParams.checkIn || !searchParams.checkOut) {
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const data = await getAvailableRoomsApi(searchParams.checkIn, searchParams.checkOut);
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error searching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Page Header */}
      <Box sx={{ 
        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        py: 5, color: 'white', textAlign: 'center'
      }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
          Tìm & Đặt phòng
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Chọn ngày để tìm phòng phù hợp với nhu cầu của bạn
        </Typography>
      </Box>

      {/* Search Bar */}
      <Container maxWidth="lg" sx={{ mt: -3, position: 'relative', zIndex: 2, mb: 5 }}>
        <Card sx={{ 
          p: 3, 
          borderRadius: 4, 
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          bgcolor: 'background.paper'
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Ngày nhận phòng"
                type="date"
                name="checkIn"
                value={searchParams.checkIn}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonth color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Ngày trả phòng"
                type="date"
                name="checkOut"
                value={searchParams.checkOut}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonth color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Số khách"
                type="number"
                name="guests"
                value={searchParams.guests}
                onChange={handleInputChange}
                inputProps={{ min: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <People color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Search />}
                sx={{ py: 1.8, borderRadius: 2, fontWeight: 'bold', fontSize: '1.05rem' }}
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? 'Đang tìm...' : 'Tìm phòng trống'}
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Container>

      {/* Results */}
      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {searched ? 'Phòng còn trống' : 'Tất cả phòng'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {loading ? 'Đang tải...' : `${rooms.length} phòng được tìm thấy`}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {loading ? (
            [...Array(6)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 4, mb: 2 }} />
                <Skeleton width="60%" height={28} sx={{ mb: 1 }} />
                <Skeleton width="40%" height={20} />
              </Grid>
            ))
          ) : rooms.length > 0 ? (
            rooms.map((room) => (
              <Grid item xs={12} sm={6} md={4} key={room.id}>
                <Card sx={{ 
                  borderRadius: 4, 
                  overflow: 'hidden', 
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 16px 35px rgba(0,0,0,0.12)' }
                }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="220"
                      image={room.image || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop"}
                      alt={`Room ${room.roomNumber}`}
                    />
                    <Chip
                      label={room.roomTypeName || 'Standard'}
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: 'rgba(255,255,255,0.92)',
                        fontWeight: 700,
                        backdropFilter: 'blur(4px)'
                      }}
                    />
                    <Chip
                      label={room.status === 'AVAILABLE' ? 'Còn trống' : room.status}
                      color={room.status === 'AVAILABLE' ? 'success' : 'default'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Phòng {room.roomNumber}
                      </Typography>
                      <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 800 }}>
                        {room.priceDay ? formatCurrency(room.priceDay) : 'N/A'}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      /đêm
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 0.5 }}>
                      <Rating value={5} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary">(48 reviews)</Typography>
                    </Box>
                    {room.province && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn fontSize="inherit" /> {room.province}
                      </Typography>
                    )}
                    <Button 
                      variant="contained" 
                      fullWidth 
                      sx={{ borderRadius: 2, fontWeight: 700, py: 1.2 }}
                    >
                      Đặt phòng ngay
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ borderRadius: 3, py: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {searched 
                    ? 'Không tìm thấy phòng trống trong khoảng thời gian này. Vui lòng thử ngày khác!'
                    : 'Chưa có dữ liệu phòng. Vui lòng thử lại sau!'}
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default BookingPage;
