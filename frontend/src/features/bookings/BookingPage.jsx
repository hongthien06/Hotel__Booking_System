import React, { useState, useEffect, useRef } from 'react';
import imgHCM from '../../assets/TP_HCM.png';
import imgHaNoi from '../../assets/HA NOI.jpg';
import imgVungTau from '../../assets/VUNG TAU.jpg';
import imgDaLat from '../../assets/DA_LAT.webp';
import imgDaNang from '../../assets/DA_NANG.jpg';
import imgNhaTrang from '../../assets/NHA_TRANG.png';
import imgPhuQuoc from '../../assets/PHU_QUOC.png';
import imgSapa from '../../assets/SAPA.png';
import imgHue from '../../assets/HUE.png';
import imgCatBa from '../../assets/CAT_BA.png';
import {
  Box, Typography, Grid, TextField, Button, Card, CardContent, CardMedia,
  Rating, Chip, Checkbox, FormControlLabel, FormGroup, IconButton,
  Divider, InputAdornment, Skeleton, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, CircularProgress, Slider, MenuItem
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Search, LocationOn, ChevronLeft, ChevronRight, Close, FilterList, ArrowForward } from '@mui/icons-material';
import { getRoomsApi, getAvailableRoomsApi } from '../../shared/api/roomApi';
import { createBookingApi } from '../../shared/api/bookingApi';
import { useAuth } from '../../shared/hooks/useAuth';
import LoginPromptModal from '../../shared/components/modals/LoginPromptModal';
import { useNavigate } from 'react-router-dom';
import RoomDetail from '../rooms/Details/RoomDetail';

const PC = '#c0496e';
const PC_LIGHT = '#fce4ec';
const SIDEBAR_W = 300;

const DESTINATIONS = [
  { key: 'hcm', province: 'TP. Hồ Chí Minh', img: imgHCM, bg: '#fff0f3' },
  { key: 'hanoi', province: 'Hà Nội', img: imgHaNoi, bg: '#f0f4ff' },
  { key: 'vungtau', province: 'Bà Rịa - Vũng Tàu', img: imgVungTau, bg: '#f0fff4' },
  { key: 'dalat', province: 'Lâm Đồng', img: imgDaLat, bg: '#fff8f0' },
  { key: 'danang', province: 'Đà Nẵng', img: imgDaNang, bg: '#f5f0ff' },
  { key: 'nhatrang', province: 'Khánh Hòa', img: imgNhaTrang, bg: '#f0f9ff' },
  { key: 'phuquoc', province: 'Kiên Giang', img: imgPhuQuoc, bg: '#f0fff4' },
  { key: 'sapa', province: 'Lào Cai', img: imgSapa, bg: '#f5f5f5' },
  { key: 'hue', province: 'Thừa Thiên Huế', img: imgHue, bg: '#fff5f0' },
  { key: 'catba', province: 'Hải Phòng', img: imgCatBa, bg: '#f0fff4' },
];


const ROOM_TYPES = [
  { key: 'Standard', label: 'room_types.standard', img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400' },
  { key: 'Deluxe', label: 'room_types.deluxe', img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400' },
  { key: 'Superior', label: 'room_types.superior', img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400' },
  { key: 'Family Room', label: 'room_types.family', img: 'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=400' },
  { key: 'Presidential Suite', label: 'room_types.president', img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400' }
];
const BED_TYPES = [
  { key: 'SINGLE', label: 'rooms.bed_single' },
  { key: 'DOUBLE', label: 'rooms.bed_double' },
  { key: 'TRIPLE', label: 'rooms.bed_triple' },
  { key: 'KING', label: 'rooms.bed_king' },
  { key: 'QUEEN', label: 'rooms.bed_queen' }
];
const BED_TYPE_LABELS = (t) => ({
  'SINGLE': t('rooms.bed_single') || 'Giường Đơn',
  'DOUBLE': t('rooms.bed_double') || 'Giường Đôi',
  'TRIPLE': t('rooms.bed_triple') || 'Giường Ba',
  'KING': t('rooms.bed_king') || 'Giường King',
  'QUEEN': t('rooms.bed_queen') || 'Giường Queen'
});
const formatCurrency = (n, lang) => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US', {
  style: 'currency',
  currency: lang === 'vi' ? 'VND' : 'USD'
}).format(lang === 'vi' ? n : n / 25000);

const SERVICES = [
  { key: 'breakfast', label: 'services.breakfast' },
  { key: 'shuttle', label: 'services.shuttle' },
  { key: 'bike', label: 'services.bike' },
  { key: 'spa', label: 'services.spa' },
  { key: 'pool', label: 'services.pool' }
];

const MOCK_ROOMS = [
  { id: 'm1', name: 'Phòng Deluxe View Biển', location: 'Vũng Tàu', bed: 'King', reviews: 124, rating: 4.8, type: 'Deluxe', price: 1200000, bg: '#dbeafe', emoji: '🌊' },
  { id: 'm2', name: 'Phòng Standard Classic', location: 'Hà Nội', bed: 'Đôi', reviews: 210, rating: 4.5, type: 'Standard', price: 800000, bg: '#e0e7ff', emoji: '🏛️' },
  { id: 'm3', name: 'Family Room', location: 'Đà Nẵng', bed: 'Ba', reviews: 155, rating: 4.6, type: 'Family', price: 1500000, bg: '#fef9c3', emoji: '🌉' },
  { id: 'm4', name: 'Superior Mountain View', location: 'Sa Pa', bed: 'Queen', reviews: 98, rating: 4.7, type: 'Superior', price: 1100000, bg: '#f0fdf4', emoji: '🏔️' },
  { id: 'm5', name: 'President Suite', location: 'TP. Hồ Chí Minh', bed: 'King', reviews: 45, rating: 4.9, type: 'President', price: 5500000, bg: '#fff7ed', emoji: '👑' },
  { id: 'm6', name: 'Deluxe Garden View', location: 'Huế', bed: 'Double', reviews: 88, rating: 4.4, type: 'Deluxe', price: 950000, bg: '#fdf2f8', emoji: '🌸' },
  { id: 'm7', name: 'Bungalow Beachfront', location: 'Phú Quốc', bed: 'King', reviews: 167, rating: 4.8, type: 'Superior', price: 2200000, bg: '#ecfeff', emoji: '🏖️' },
  { id: 'm8', name: 'Vintage Studio', location: 'Đà Lạt', bed: 'Single', reviews: 132, rating: 4.6, type: 'Standard', price: 750000, bg: '#fffbeb', emoji: '☕' },
  { id: 'm9', name: 'Modern City Room', location: 'Hải Phòng', bed: 'Double', reviews: 76, rating: 4.3, type: 'Standard', price: 850000, bg: '#f1f5f9', emoji: '🏙️' },
  { id: 'm10', name: 'Luxury Penthouse', location: 'Nha Trang', bed: 'King', reviews: 34, rating: 5.0, type: 'President', price: 8000000, bg: '#faf5ff', emoji: '💎' },
];

const MOCK_WEEKEND_DEALS = [
  { id: 'w1', name: 'Riverside Boutique Studio', location: 'Hội An', province: 'Quảng Nam', bed: 'Double', reviews: 214, rating: 8.7, type: 'Superior', pricePerNight: 950000, image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400' },
  { id: 'w2', name: 'Mountain Eco Lodge', location: 'Sa Pa', province: 'Lào Cai', bed: 'Queen', reviews: 189, rating: 9.1, type: 'Deluxe', pricePerNight: 1350000, image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400' },
  { id: 'w3', name: 'Beachside Bungalow Retreat', location: 'Mũi Né', province: 'Bình Thuận', bed: 'King', reviews: 301, rating: 8.5, type: 'Deluxe', pricePerNight: 1600000, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400' },
  { id: 'w4', name: 'Heritage Colonial Room', location: 'Hà Nội', province: 'Hà Nội', bed: 'Double', reviews: 425, rating: 8.3, type: 'Standard', pricePerNight: 720000, image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400' },
  { id: 'w5', name: 'Rooftop Sky Suite', location: 'TP. Hồ Chí Minh', province: 'TP. Hồ Chí Minh', bed: 'King', reviews: 98, rating: 9.3, type: 'President', pricePerNight: 4200000, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400' },
  { id: 'w6', name: 'Pine Forest Cabin', location: 'Đà Lạt', province: 'Lâm Đồng', bed: 'Double', reviews: 176, rating: 9.0, type: 'Superior', pricePerNight: 1100000, image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400' },
  { id: 'w7', name: 'Island Pearl Villa', location: 'Phú Quốc', province: 'Kiên Giang', bed: 'King', reviews: 263, rating: 9.4, type: 'President', pricePerNight: 3800000, image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400' },
  { id: 'w8', name: 'Old Quarter Cozy Room', location: 'Hội An', province: 'Quảng Nam', bed: 'Single', reviews: 511, rating: 8.6, type: 'Standard', pricePerNight: 650000, image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400' },
  { id: 'w9', name: 'Cliffside Ocean View', location: 'Vũng Tàu', province: 'Bà Rịa - Vũng Tàu', bed: 'Queen', reviews: 147, rating: 8.9, type: 'Deluxe', pricePerNight: 1750000, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400' },
  { id: 'w10', name: 'Wellness Spa Retreat', location: 'Huế', province: 'Thừa Thiên Huế', bed: 'Queen', reviews: 88, rating: 9.2, type: 'Superior', pricePerNight: 2100000, image: 'https://images.unsplash.com/photo-1601053081350-c1e37a5e7e99?w=400' },
];

const nightsBetween = (a, b) => {
  const diff = new Date(b) - new Date(a);
  return diff > 0 ? Math.round(diff / 86400000) : 1;
};

/* ─── Sidebar ─────────────────────────────────────────── */
const Sidebar = ({ params, onParam, roomTypes, setRoomTypes, bedTypes, setBedTypes, services, setServices, minPrice, setMinPrice, maxPrice, setMaxPrice, onSearch, loading }) => {
  const { t } = useTranslation();
  const toggle = (list, setList, v) =>
    setList(list.includes(v) ? list.filter(x => x !== v) : [...list, v]);
  const labelSx = { fontWeight: 700, color: '#888', letterSpacing: 1, fontSize: 11, display: 'block', mb: 0.5 };

  return (
    <Box sx={{ width: SIDEBAR_W, p: 2.5, height: '100%', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <Search sx={{ color: PC }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: PC }}>{t('booking_page.search_title')}</Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Typography sx={labelSx}>{t('booking_page.destination')}</Typography>
      <TextField
        select
        fullWidth
        size="small"
        value={params.destination}
        onChange={e => onParam('destination', e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocationOn sx={{ color: PC, fontSize: 18 }} />
            </InputAdornment>
          ),
        }}
        SelectProps={{
          native: false,
          MenuProps: { PaperProps: { sx: { maxHeight: 300, borderRadius: 2 } } }
        }}
      >
        {DESTINATIONS.map((d) => (
          <MenuItem key={d.key} value={d.province || d.name} sx={{ fontSize: 13 }}>
            {t(`destinations.${d.key}.name`)}
          </MenuItem>
        ))}
      </TextField>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {[['checkIn', 'booking_page.check_in'], ['checkOut', 'booking_page.check_out']].map(([k, lblKey]) => (
          <Grid item xs={6} key={k}>
            <Typography sx={labelSx}>{t(lblKey)}</Typography>
            <TextField fullWidth size="small" type="date" value={params[k]}
              onChange={e => onParam(k, e.target.value)}
              InputLabelProps={{ shrink: true }} inputProps={{ style: { fontSize: 12 } }}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {[['adults', 'booking_page.adults', 1], ['children', 'booking_page.children', 0]].map(([k, lblKey, min]) => (
          <Grid item xs={6} key={k}>
            <Typography sx={labelSx}>{t(lblKey)}</Typography>
            <TextField fullWidth size="small" type="number" value={params[k]}
              onChange={e => onParam(k, Math.max(min, parseInt(e.target.value) || min))}
              inputProps={{ min }}
            />
          </Grid>
        ))}
      </Grid>

      <Typography sx={{ fontWeight: 700, color: PC, mb: 1, display: 'block' }}>
        {t('booking_page.price_per_night')}
      </Typography>
      <Box sx={{ px: 1, mb: 1 }}>
        <Slider
          value={[minPrice || 0, maxPrice || 10000000]}
          onChange={(e, newValue) => {
            setMinPrice(newValue[0]);
            setMaxPrice(newValue[1]);
          }}
          valueLabelDisplay="auto"
          min={0}
          max={10000000}
          step={500000}
          sx={{
            color: PC,
            '& .MuiSlider-thumb': {
              bgcolor: 'white',
              border: `2px solid ${PC}`,
              '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 8px ${PC}33` },
            }
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {new Intl.NumberFormat('vi-VN').format(minPrice || 0)}₫
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Intl.NumberFormat('vi-VN').format(maxPrice || 10000000)}₫
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {[
        ['booking_page.room_type', ROOM_TYPES, roomTypes, setRoomTypes],
        ['booking_page.bed_type', BED_TYPES, bedTypes, setBedTypes],
        ['booking_page.extra_services', SERVICES, services, setServices],
      ].map(([titleKey, items, list, setList]) => (
        <Box key={titleKey}>
          <Typography sx={{ ...labelSx, color: PC, mb: 1 }}>{t(titleKey)}</Typography>
          <FormGroup sx={{ mb: 1 }}>
            {items.map(v => (
              <FormControlLabel key={v.key}
                control={<Checkbox size="small" checked={list.includes(v.key)}
                  onChange={() => toggle(list, setList, v.key)}
                  sx={{ color: PC, '&.Mui-checked': { color: PC } }}
                />}
                label={<Typography variant="body2">{t(v.label)}</Typography>}
                sx={{ mb: 0.1 }}
              />
            ))}
          </FormGroup>
          <Divider sx={{ mb: 2 }} />
        </Box>
      ))}

      <Button fullWidth variant="contained" color="primary" onClick={onSearch} disabled={loading}
        startIcon={<Search />}
        sx={{ borderRadius: 2, py: 1.2, fontWeight: 700 }}
      >
        {loading ? t('booking_page.searching') : t('booking_page.find_room')}
      </Button>
    </Box>
  );
};


const OffersSection = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ mb: 6, px: 6 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
        {t('banners.offers_title') === 'banners.offers_title' ? 'Ưu đãi' : t('banners.offers_title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('banners.offers_subtitle') === 'banners.offers_subtitle' ? 'Khuyến mãi, giảm giá và ưu đãi đặc biệt dành riêng cho bạn' : t('banners.offers_subtitle')}
      </Typography>
      
      <Card sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        borderRadius: 4, 
        border: '1px solid #eee', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        bgcolor: '#fff'
      }}>
        <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
            Không điều kiện ràng buộc. An tâm nghỉ dưỡng.
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#1a1a1a' }}>
            Đặt với Ưu Đãi Mùa Du Lịch
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 450 }}>
            Giảm ít nhất 15% cho một số chỗ nghỉ khi đặt phòng từ nay đến hết mùa du lịch.
          </Typography>
          <Button variant="contained" sx={{ 
            bgcolor: '#006ce4', 
            color: '#fff', 
            textTransform: 'none', 
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 1.5,
            width: 'fit-content',
            py: 1.2,
            px: 4,
            '&:hover': { bgcolor: '#005bb8', boxShadow: '0 4px 12px rgba(0,108,228,0.3)' }
          }}>
            Tiết kiệm cho chuyến đi tới
          </Button>
        </Box>
        <Box sx={{ width: { xs: '100%', md: 320 }, minHeight: 220 }}>
          <CardMedia
            component="img"
            image="https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600"
            alt="Offer"
            sx={{ height: '100%', objectFit: 'cover' }}
          />
        </Box>
      </Card>
    </Box>
  );
};

/* ─── BookingDialog ────────────────────────────────────── */
const BookingDialog = ({ open, room, isMock, searchParams, onClose, onSuccess, navigate }) => {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({
    checkIn: searchParams?.checkIn || '',
    checkOut: searchParams?.checkOut || '',
    numAdults: (searchParams?.adults || 2),
    numChildren: (searchParams?.children || 0),
    specialRequest: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        checkIn: searchParams?.checkIn || '',
        checkOut: searchParams?.checkOut || '',
        numAdults: (searchParams?.adults || 2),
        numChildren: (searchParams?.children || 0),
        specialRequest: '',
      });
      setError('');
    }
  }, [open, searchParams]);

  if (!room) return null;

  const roomName = isMock ? room.name : `${t('booking_page.room')} ${room.roomNumber}`;
  const roomType = isMock ? room.type : (room.typeName || 'Standard');
  const roomPrice = isMock ? room.price : Number(room.pricePerNight || room.priceDay || 0);
  const nights = nightsBetween(form.checkIn, form.checkOut);

  const total = roomPrice * nights;

  const handleBook = async () => {
    if (!form.checkIn || !form.checkOut) { setError(t('rooms.validation_required')); return; }
    if (new Date(form.checkOut) <= new Date(form.checkIn)) { setError(t('rooms.check_out_after_check_in')); return; }
    if (isMock) { setError('Phòng mẫu — vui lòng tìm kiếm phòng thực trên hệ thống.'); return; }

    setSubmitting(true);
    setError('');
    try {
      const bookingResult = await createBookingApi({
        roomId: room.roomId || room.id,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        numAdults: Number(form.numAdults),
        numChildren: Number(form.numChildren),
        specialRequest: form.specialRequest,
      });
      // Navigate to history instead of payment review
      navigate('/bookings-history');
    } catch (err) {
      console.error('Booking error:', err);
      const data = err?.response?.data;
      const msg = data?.error || data?.message || (typeof data === 'string' ? data : t('common.error'));
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
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
              {formatCurrency(roomPrice, i18n.language)} {t('rooms.per_night')}
            </Typography>
          </Box>
        </Box>

        {/* Date pickers */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <TextField fullWidth label={t('booking_page.check_in')} type="date" size="small"
              value={form.checkIn}
              onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label={t('booking_page.check_out')} type="date" size="small"
              value={form.checkOut}
              onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>


        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <TextField fullWidth label={t('booking_page.adults')} type="number" size="small"
              value={form.numAdults}
              onChange={e => setForm(f => ({ ...f, numAdults: Math.max(1, parseInt(e.target.value) || 1) }))}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label={t('booking_page.children')} type="number" size="small"
              value={form.numChildren}
              onChange={e => setForm(f => ({ ...f, numChildren: Math.max(0, parseInt(e.target.value) || 0) }))}
              inputProps={{ min: 0 }}
            />
          </Grid>
        </Grid>

        <TextField fullWidth label={t('booking_page.special_request')} multiline rows={2} size="small"
          value={form.specialRequest}
          onChange={e => setForm(f => ({ ...f, specialRequest: e.target.value }))}
          placeholder={t('booking_page.special_request_placeholder')}
          sx={{ mb: 2 }}
        />

        {/* Price summary */}
        {form.checkIn && form.checkOut && nights > 0 && (
          <>
            {(() => {
              const checkInDateTime = new Date(`${form.checkIn}T14:00:00`);
              const refundDeadline = new Date(checkInDateTime.getTime() - 24 * 60 * 60 * 1000);
              const isNonRefundable = new Date() > refundDeadline;
              
              return isNonRefundable && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontSize: '0.85rem', '& .MuiAlert-message': { fontWeight: 600 } }}>
                  {t('booking_page.non_refundable_warning') === 'booking_page.non_refundable_warning' 
                    ? "Vì thời gian đặt đã nằm trong khoảng 24h trước check-in, đơn này sẽ không được hoàn tiền nếu hủy."
                    : t('booking_page.non_refundable_warning')}
                </Alert>
              );
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
  );
};

/* ─── Main ─────────────────────────────────────────────── */
const BookingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [destIdx, setDestIdx] = useState(1);
  const [roomTypes, setRoomTypes] = useState([]);
  const [bedTypes, setBedTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [minPrice, setMinPrice] = useState(undefined);
  const [maxPrice, setMaxPrice] = useState(undefined);
  const [params, setParams] = useState({
    destination: 'Hà Nội',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    adults: 2, children: 0,
  });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedIsMock, setSelectedIsMock] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });
  const destScrollRef = useRef(null);
  const scrollDest = (dir) => {
    if (destScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = destScrollRef.current;
      const scrollAmount = (clientWidth + 20) / 4;
      if (dir > 0 && scrollLeft + clientWidth >= scrollWidth - 10) return;
      if (dir < 0 && scrollLeft <= 10) return;
      destScrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  const roomScrollRef = useRef(null);
  const scrollRooms = (dir) => {
    if (roomScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = roomScrollRef.current;
      const scrollAmount = (clientWidth + 24) / 3;
      if (dir > 0 && scrollLeft + clientWidth >= scrollWidth - 10) return;
      if (dir < 0 && scrollLeft <= 10) return;
      roomScrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  const typeScrollRef = useRef(null);
  const scrollTypes = (dir) => {
    if (typeScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = typeScrollRef.current;
      const scrollAmount = (clientWidth + 16) / 4;
      if (dir > 0 && scrollLeft + clientWidth >= scrollWidth - 10) return;
      if (dir < 0 && scrollLeft <= 10) return;
      typeScrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  const budgetScrollRef = useRef(null);
  const scrollBudget = (dir) => {
    if (budgetScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = budgetScrollRef.current;
      const scrollAmount = (clientWidth + 24) / 3;
      if (dir > 0 && scrollLeft + clientWidth >= scrollWidth - 10) return;
      if (dir < 0 && scrollLeft <= 10) return;
      budgetScrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recent_searches');
    return saved ? JSON.parse(saved) : [];
  });

  const budgetRooms = React.useMemo(() => {
    if (searched && rooms.length === 0) return [];
    const list = rooms.length > 0 ? rooms : MOCK_ROOMS;
    return [...list].sort((a, b) => {
      const pA = Number(a.pricePerNight || a.priceDay || a.price || 0);
      const pB = Number(b.pricePerNight || b.priceDay || b.price || 0);
      return pA - pB;
    }).slice(0, 10);
  }, [rooms, searched]);

  const featuredRooms = React.useMemo(() => {
    if (searched && rooms.length === 0) return [];
    const list = rooms.length > 0 ? rooms : MOCK_ROOMS;
    return list.slice(0, 10);
  }, [rooms, searched]);

  const topRatedRooms = React.useMemo(() => {
    if (searched && rooms.length === 0) return [];
    const list = rooms.length > 0 ? rooms : MOCK_ROOMS;
    return [...list].sort((a, b) => {
      const rA = Number(a.rating || 0);
      const rB = Number(b.rating || 0);
      if (rB !== rA) return rB - rA;
      const revA = Number(a.reviews || 0);
      const revB = Number(b.reviews || 0);
      return revB - revA;
    }).slice(0, 10);
  }, [rooms, searched]);
  
  const weekendDeals = React.useMemo(() => {
    // Lấy tối đa 10 phòng thật từ backend, shuffle để khác phần "Phòng nổi bật"
    const shuffledReal = [...rooms].sort(() => Math.random() - 0.5);
    const realRooms = shuffledReal.slice(0, 10).map(r => ({
      ...r,
      _isMockCard: false,
      oldPrice: Number(r.pricePerNight || r.priceDay || 0) * (1.2 + Math.random() * 0.15),
    }));

    // Nếu phòng thật < 10, bổ sung bằng MOCK_WEEKEND_DEALS
    const needed = Math.max(0, 10 - realRooms.length);
    const mockFill = MOCK_WEEKEND_DEALS.slice(0, needed).map(r => ({
      ...r,
      _isMockCard: true,
      oldPrice: Number(r.pricePerNight || 0) * (1.2 + Math.random() * 0.15),
    }));

    return [...realRooms, ...mockFill];
  }, [rooms]);


  const recentScrollRef = useRef(null);
  const scrollRecent = (dir) => {
    if (recentScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = recentScrollRef.current;
      const scrollAmount = (clientWidth + 16) / 4;
      if (dir > 0 && scrollLeft + clientWidth >= scrollWidth - 10) return;
      if (dir < 0 && scrollLeft <= 10) return;
      recentScrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  const weekendScrollRef = useRef(null);
  const scrollWeekend = (dir) => {
    if (weekendScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = weekendScrollRef.current;
      const scrollAmount = clientWidth / 3 + 16;
      if (dir > 0 && scrollLeft + clientWidth >= scrollWidth - 10) return;
      if (dir < 0 && scrollLeft <= 10) return;
      weekendScrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  const topRatedScrollRef = useRef(null);
  const scrollTopRated = (dir) => {
    if (topRatedScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = topRatedScrollRef.current;
      const scrollAmount = (clientWidth + 24) / 3;
      if (dir > 0 && scrollLeft + clientWidth >= scrollWidth - 10) return;
      if (dir < 0 && scrollLeft <= 10) return;
      topRatedScrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    getRoomsApi()
      .then(d => setRooms(Array.isArray(d) ? d : []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  const onParam = (k, v) => setParams(p => ({ ...p, [k]: v }));

  const handleSearch = async (overrideParams) => {
    // Distinguish between a search object and a React event
    const isOverride = overrideParams && typeof overrideParams === 'object' && 'checkIn' in overrideParams;
    const searchParams = isOverride ? overrideParams : params;

    if (!searchParams.checkIn || !searchParams.checkOut) return;
    setLoading(true); setSearched(true);

    // Save to history (only for new manual searches)
    if (!isOverride) {
      const newHistory = [searchParams, ...recentSearches.filter(s => s.destination !== searchParams.destination)].slice(0, 10);
      setRecentSearches(newHistory);
      localStorage.setItem('recent_searches', JSON.stringify(newHistory));
    }

    try {
      const d = await getAvailableRoomsApi(
        searchParams.checkIn,
        searchParams.checkOut,
        searchParams.destination || undefined,
        minPrice,
        maxPrice,
        roomTypes.length > 0 ? roomTypes : undefined,
        bedTypes.length > 0 ? bedTypes : undefined
      );
      setRooms(Array.isArray(d) ? d : []);
    } catch { setRooms([]); }
    finally { setLoading(false); }
  };

  const handleClearSearch = () => {
    setSearched(false);
    // Optionally reset rooms to all rooms, or just let them be
    getRoomsApi()
      .then(d => setRooms(Array.isArray(d) ? d : []))
      .catch(() => setRooms([]));
  };

  const handleRecentSearchClick = (s) => {
    setParams(s);
    handleSearch(s);
  };

  const openBooking = (room, isMock) => {
    if (!isAuthenticated) {
      setLoginPromptOpen(true);
      return;
    }
    setSelectedRoom(room);
    setSelectedIsMock(isMock);
    setDialogOpen(true);
  };

  const openDetail = (room, isMock) => {
    setSelectedRoom(room);
    setSelectedIsMock(isMock);
    setDetailOpen(true);
  };

  const handleBookingSuccess = () => {
    setDialogOpen(false);
    setSnackbar({ open: true, msg: t('booking_page.booking_success'), severity: 'success' });
  };

  const handleTypeClick = async (typeKey) => {
    setRoomTypes([typeKey]);
    setLoading(true); setSearched(true);
    try {
      const d = await getAvailableRoomsApi(
        params.checkIn,
        params.checkOut,
        params.destination || undefined,
        minPrice,
        maxPrice,
        [typeKey],
        bedTypes.length > 0 ? bedTypes : undefined
      );
      setRooms(Array.isArray(d) ? d : []);
    } catch { setRooms([]); }
    finally { setLoading(false); }
  };

  const selectDest = (idx) => { 
    const dest = DESTINATIONS[idx].province || DESTINATIONS[idx].name;
    setDestIdx(idx); 
    setParams(p => {
      const newParams = { ...p, destination: dest };
      handleSearch(newParams);
      return newParams;
    });
  };

  /* ── Room Card ─────────────────────────────────────────── */
  const RoomCard = ({ room, isMock, oldPrice }) => {
    const { t, i18n } = useTranslation();
    return (
      <Card
        onClick={() => openDetail(room, isMock)}
        sx={{
          cursor: 'pointer',
          borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s',
          boxShadow: 1,
          '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 30px rgba(0,0,0,0.13)' }
        }}
      >
        {isMock
          ? <Box sx={{ height: 160, bgcolor: room.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: 64 }}>{room.emoji}</Typography>
          </Box>
          : <CardMedia component="img" height="160"
            image={(room.imageUrls && room.imageUrls.length > 0) ? room.imageUrls[0] : (room.image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600')}
            alt={isMock ? room.name : `${t('booking_page.room')} ${room.roomNumber}`}
          />
        }
        <CardContent sx={{ p: 2 }}>
          <Chip label={isMock ? t(`room_types.${room.type.toLowerCase()}`) : t(room.typeName || 'Standard')} size="small"
            sx={{ bgcolor: PC_LIGHT, color: PC, fontWeight: 700, fontSize: 11, mb: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
            {isMock ? room.name : `${t('booking_page.room')} ${room.roomNumber}`}
          </Typography>
          <Typography variant="caption" color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mb: 1 }}>
            <LocationOn fontSize="inherit" />
            {isMock
              ? `${room.location} · ${room.bed}`
              : `${room.province || 'Hà Nội'} · ${BED_TYPE_LABELS(t)[room.bedType] || room.bedType}`}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
            <Rating value={isMock ? room.rating : 5} precision={0.1} readOnly size="small"
              sx={{ '& .MuiRating-iconFilled': { color: PC } }} />
            <Typography variant="caption" color="text.secondary">
              ({isMock ? room.reviews : 48} {t('room_detail.reviews')})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: PC }}>
              {oldPrice && (
                <Typography component="span" variant="caption" sx={{ textDecoration: 'line-through', color: '#d32f2f', mr: 1, fontWeight: 500, fontSize: '0.75rem' }}>
                  {formatCurrency(oldPrice, i18n.language)}
                </Typography>
              )}
              {formatCurrency(isMock ? room.price : Number(room.pricePerNight || room.priceDay || 0), i18n.language)}
            </Typography>
            <Button
              size="small" variant="contained" color="primary"
              onClick={(e) => { e.stopPropagation(); openBooking(room, isMock); }}
              sx={{ borderRadius: 2, fontSize: 11, px: 1.5 }}
            >
              {t('common.book_now')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ display: 'flex', position: 'relative', bgcolor: 'background.default', minHeight: '100vh' }}>

      {/* Sidebar — fixed, độc lập với scroll trang chính */}
      <Box sx={{
        position: 'fixed',
        top: 0, left: 0,
        width: sidebarOpen ? SIDEBAR_W : 0,
        height: '100vh',
        overflowY: sidebarOpen ? 'auto' : 'hidden',
        overflowX: 'hidden',
        transition: 'width 0.3s ease',
        bgcolor: 'white',
        borderRight: '1px solid #eee',
        zIndex: 100,
        boxShadow: sidebarOpen ? '2px 0 12px rgba(0,0,0,0.07)' : 'none',
      }}>
        <Sidebar params={params} onParam={onParam}
          roomTypes={roomTypes} setRoomTypes={setRoomTypes}
          bedTypes={bedTypes} setBedTypes={setBedTypes}
          services={services} setServices={setServices}
          minPrice={minPrice} setMinPrice={setMinPrice}
          maxPrice={maxPrice} setMaxPrice={setMaxPrice}
          onSearch={handleSearch} loading={loading}
        />
      </Box>

      {/* Main — đẩy sang phải theo chiều rộng sidebar */}
      <Box sx={{
        flex: 1, minWidth: 0,
        marginLeft: sidebarOpen ? `${SIDEBAR_W}px` : 0,
        transition: 'margin-left 0.3s ease',
      }}>
        {/* Filter toggle - Sticky */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 90, pl: 0.5, pt: 0.5, pb: 0, width: 'fit-content' }}>
          <IconButton onClick={() => setSidebarOpen(o => !o)}
            sx={{ bgcolor: PC, color: 'white', borderRadius: 2, boxShadow: 3, '&:hover': { bgcolor: '#a0365a' } }}>
            <FilterList />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, py: 2, pb: 8 }}>
          <Box sx={{ maxWidth: 1080, mx: 'auto' }}>

            {!searched ? (
              <>
                {/* 1. Tìm kiếm gần đây */}
                {recentSearches.length > 0 && (
                  <>
                    <Box sx={{ mb: 2, pl: 6 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('booking_page.recent_searches')}</Typography>
                      <Typography variant="body2" color="text.secondary">{t('booking_page.recent_searches_sub')}</Typography>
                    </Box>
                    <Box sx={{ position: 'relative', mb: 5, px: 6 }}>
                      {recentSearches.length > 4 && (
                        <IconButton onClick={() => scrollRecent(-1)} sx={{
                          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                          zIndex: 2, bgcolor: 'white', boxShadow: 3,
                          '&:hover': { bgcolor: PC_LIGHT },
                        }}>
                          <ChevronLeft sx={{ color: PC }} />
                        </IconButton>
                      )}

                      <Box ref={recentScrollRef} sx={{
                        display: 'flex', gap: 2, overflowX: 'auto', pb: 1,
                        justifyContent: 'flex-start',
                        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                        scrollSnapType: 'x mandatory',
                      }}>
                        {recentSearches.map((s, i) => (
                          <Card key={i} onClick={() => handleRecentSearchClick(s)} sx={{
                            cursor: 'pointer', borderRadius: 3, flexShrink: 0,
                            width: 'calc((100% - 48px) / 4)', p: 2,
                            scrollSnapAlign: 'start', boxShadow: 1,
                            border: '1px solid #eee',
                            transition: 'all 0.2s',
                            minHeight: 100, // Cố định chiều cao tối thiểu
                            display: 'flex', flexDirection: 'column', justifyContent: 'center'
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 800, 
                              color: PC, 
                              mb: 0.5,
                              minHeight: '1.2em', // Đảm bảo luôn có khoảng trống cho tiêu đề
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {s.destination || t('booking_page.anywhere')}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {s.checkIn} — {s.checkOut}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {s.adults} {t('booking_page.adults').toLowerCase()}, {s.children} {t('booking_page.children').toLowerCase()}
                            </Typography>
                          </Card>
                        ))}
                      </Box>

                      {recentSearches.length > 4 && (
                        <IconButton onClick={() => scrollRecent(1)} sx={{
                          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                          zIndex: 2, bgcolor: 'white', boxShadow: 3,
                          '&:hover': { bgcolor: PC_LIGHT },
                        }}>
                          <ChevronRight sx={{ color: PC }} />
                        </IconButton>
                      )}
                    </Box>
                  </>
                )}

                {/* 2. Điểm đến phổ biến */}
                <Box sx={{ mb: 2, pl: 6 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('destinations.title')}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('destinations.subtitle')}</Typography>
                </Box>
                <Box sx={{ position: 'relative', mb: 5, px: 6 }}>
                  {DESTINATIONS.length > 5 && (
                    <IconButton onClick={() => scrollDest(-1)} sx={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 2, bgcolor: 'white', boxShadow: 3,
                      '&:hover': { bgcolor: PC_LIGHT },
                    }}>
                      <ChevronLeft sx={{ color: PC }} />
                    </IconButton>
                  )}

                  {/* Scroll container */}
                  <Box ref={destScrollRef} sx={{
                    display: 'flex', gap: 2.5, overflowX: 'auto', pb: 1,
                    justifyContent: 'flex-start',
                    scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                    scrollSnapType: 'x mandatory',
                  }}>
                    {DESTINATIONS.map((d, i) => (
                      <Card key={d.name} onClick={() => selectDest(i)} sx={{
                        cursor: 'pointer', borderRadius: 3, flexShrink: 0,
                        width: 'calc((100% - 60px) / 4)', height: 216,
                        position: 'relative', overflow: 'hidden',
                        scrollSnapAlign: 'start',
                        scrollSnapStop: 'always',
                        border: destIdx === i ? `3px solid ${PC}` : '3px solid transparent',
                        transition: 'all 0.2s',
                        boxShadow: destIdx === i ? `0 0 0 3px ${PC}44` : 1,
                      }}>
                        {/* Ảnh tràn kín */}
                        <img
                          src={d.img}
                          alt={d.name}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {/* Gradient overlay */}
                        <Box sx={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)',
                        }} />
                        {/* Text */}
                        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 1.2, textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
                            {t(`destinations.${d.key}.name`)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.82)' }}>{t(`destinations.${d.key}.desc`)}</Typography>
                        </Box>
                      </Card>
                    ))}
                  </Box>

                  {DESTINATIONS.length > 5 && (
                    <IconButton onClick={() => scrollDest(1)} sx={{
                      position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 2, bgcolor: 'white', boxShadow: 3,
                      '&:hover': { bgcolor: PC_LIGHT },
                    }}>
                      <ChevronRight sx={{ color: PC }} />
                    </IconButton>
                  )}
                </Box>


                <OffersSection />


                {/* 3. Tìm kiếm theo loại phòng */}
                <Box sx={{ mb: 2, pl: 6 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('booking_page.room_type')}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('booking_page.room_type_sub')}</Typography>
                </Box>
                <Box sx={{ position: 'relative', mb: 5, px: 6 }}>
                  {ROOM_TYPES.length > 4 && (
                    <IconButton onClick={() => scrollTypes(-1)} sx={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 2, bgcolor: 'white', boxShadow: 3,
                      '&:hover': { bgcolor: PC_LIGHT },
                    }}>
                      <ChevronLeft sx={{ color: PC }} />
                    </IconButton>
                  )}

                  <Box ref={typeScrollRef} sx={{
                    display: 'flex', gap: 2, overflowX: 'auto', pb: 1,
                    justifyContent: 'flex-start',
                    scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                    scrollSnapType: 'x mandatory',
                  }}>
                    {ROOM_TYPES.map((type) => (
                      <Card key={type.key} onClick={() => handleTypeClick(type.key)} sx={{
                        cursor: 'pointer', borderRadius: 4, flexShrink: 0,
                        width: 'calc((100% - 48px) / 4)', height: 180,
                        position: 'relative', overflow: 'hidden',
                        scrollSnapAlign: 'start',
                        boxShadow: 1,
                        border: roomTypes.includes(type.key) ? `3px solid ${PC}` : '3px solid transparent',
                        transition: 'all 0.2s',
                      }}>
                        <CardMedia component="img" image={type.img} alt={t(type.label)} sx={{ height: '100%', objectFit: 'cover' }} />
                        <Box sx={{
                          position: 'absolute', bottom: 0, left: 0, right: 0, p: 2,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                          color: 'white', textAlign: 'center'
                        }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {t(type.label)}
                          </Typography>
                        </Box>
                      </Card>
                    ))}
                  </Box>

                  {ROOM_TYPES.length > 4 && (
                    <IconButton onClick={() => scrollTypes(1)} sx={{
                      position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 2, bgcolor: 'white', boxShadow: 3,
                      '&:hover': { bgcolor: PC_LIGHT },
                    }}>
                      <ChevronRight sx={{ color: PC }} />
                    </IconButton>
                  )}
                </Box>

                {/* 4. Phòng nổi bật */}
                <Box sx={{ mb: 2, pl: 6 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {t('booking_page.featured_rooms')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('booking_page.featured_rooms_sub')}
                      </Typography>
                    </Box>
                    <Button 
                      endIcon={<ArrowForward />} 
                      onClick={() => navigate('/rooms')}
                      sx={{ 
                        color: PC, fontWeight: 700, textTransform: 'none',
                        '&:hover': { bgcolor: PC_LIGHT }
                      }}
                    >
                      {t('common.see_all') || 'Xem tất cả'}
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ position: 'relative', mb: 4, px: 6 }}>
                  {MOCK_ROOMS.length > 3 && (
                    <IconButton onClick={() => scrollRooms(-1)} sx={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 2, bgcolor: 'white', boxShadow: 3,
                      '&:hover': { bgcolor: PC_LIGHT },
                    }}>
                      <ChevronLeft sx={{ color: PC }} />
                    </IconButton>
                  )}

                  <Box ref={roomScrollRef} sx={{
                    display: 'flex', gap: 3, overflowX: 'auto', pb: 2, pt: 1,
                    justifyContent: 'flex-start',
                    scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                    scrollSnapType: 'x mandatory',
                  }}>
                    {loading ? (
                      [...Array(3)].map((_, i) => (
                        <Box key={i} sx={{ width: 'calc((100% - 48px) / 3)', flexShrink: 0 }}>
                          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3, mb: 1 }} />
                          <Skeleton width="70%" height={22} sx={{ mb: 0.5 }} />
                          <Skeleton width="50%" height={18} />
                        </Box>
                      ))
                    ) : (
                      featuredRooms.map(r => (
                        <Box key={r.id || r.roomId} sx={{ width: 'calc((100% - 48px) / 3)', flexShrink: 0, scrollSnapAlign: 'start' }}>
                          <RoomCard room={r} isMock={rooms.length === 0} />
                        </Box>
                      ))
                    )}
                  </Box>

                  {MOCK_ROOMS.length > 3 && (
                    <IconButton onClick={() => scrollRooms(1)} sx={{
                      position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 2, bgcolor: 'white', boxShadow: 3,
                      '&:hover': { bgcolor: PC_LIGHT },
                    }}>
                      <ChevronRight sx={{ color: PC }} />
                    </IconButton>
                  )}
                </Box>


                {/* 5. Phòng được đánh giá cao nhất */}
                {topRatedRooms.length > 0 && (
                  <>
                    <Box sx={{ mb: 2, pl: 6 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('booking_page.top_rated')}</Typography>
                          <Typography variant="body2" color="text.secondary">{t('booking_page.top_rated_sub')}</Typography>
                        </Box>
                        <Button 
                          endIcon={<ArrowForward />} 
                          onClick={() => navigate('/rooms')}
                          sx={{ 
                            color: PC, fontWeight: 700, textTransform: 'none',
                            '&:hover': { bgcolor: PC_LIGHT }
                          }}
                        >
                          {t('common.see_all') || 'Xem tất cả'}
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ position: 'relative', mb: 5, px: 6 }}>
                      {topRatedRooms.length > 3 && (
                        <IconButton onClick={() => scrollTopRated(-1)} sx={{
                          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                          zIndex: 2, bgcolor: 'white', boxShadow: 3,
                          '&:hover': { bgcolor: PC_LIGHT },
                        }}>
                          <ChevronLeft sx={{ color: PC }} />
                        </IconButton>
                      )}

                      <Box ref={topRatedScrollRef} sx={{
                        display: 'flex', gap: 3, overflowX: 'auto', pb: 2, pt: 1,
                        justifyContent: 'flex-start',
                        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                        scrollSnapType: 'x mandatory',
                      }}>
                        {topRatedRooms.map(r => (
                          <Box key={r.id} sx={{ width: 'calc((100% - 48px) / 3)', flexShrink: 0, scrollSnapAlign: 'start' }}>
                            <RoomCard room={r} isMock={rooms.length === 0} />
                          </Box>
                        ))}
                      </Box>

                      {topRatedRooms.length > 3 && (
                        <IconButton onClick={() => scrollTopRated(1)} sx={{
                          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                          zIndex: 2, bgcolor: 'white', boxShadow: 3,
                          '&:hover': { bgcolor: PC_LIGHT },
                        }}>
                          <ChevronRight sx={{ color: PC }} />
                        </IconButton>
                      )}
                    </Box>
                  </>
                )}


                {/* 6. Phòng có giá ưu đãi nhất */}
                {budgetRooms.length > 0 && (
                  <>
                    <Box sx={{ mb: 2, pl: 6 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('booking_page.budget_friendly')}</Typography>
                          <Typography variant="body2" color="text.secondary">{t('booking_page.budget_friendly_sub')}</Typography>
                        </Box>
                        <Button 
                          endIcon={<ArrowForward />} 
                          onClick={() => navigate('/rooms')}
                          sx={{ 
                            color: PC, fontWeight: 700, textTransform: 'none',
                            '&:hover': { bgcolor: PC_LIGHT }
                          }}
                        >
                          {t('common.see_all') || 'Xem tất cả'}
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ position: 'relative', mb: 5, px: 6 }}>
                      {budgetRooms.length > 3 && (
                        <IconButton onClick={() => scrollBudget(-1)} sx={{
                          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                          zIndex: 2, bgcolor: 'white', boxShadow: 3,
                          '&:hover': { bgcolor: PC_LIGHT },
                        }}>
                          <ChevronLeft sx={{ color: PC }} />
                        </IconButton>
                      )}

                      <Box ref={budgetScrollRef} sx={{
                        display: 'flex', gap: 3, overflowX: 'auto', pb: 2, pt: 1,
                        justifyContent: 'flex-start',
                        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                        scrollSnapType: 'x mandatory',
                      }}>
                        {budgetRooms.map(r => (
                          <Box key={r.id} sx={{ width: 'calc((100% - 48px) / 3)', flexShrink: 0, scrollSnapAlign: 'start' }}>
                            <RoomCard room={r} isMock={rooms.length === 0} />
                          </Box>
                        ))}
                      </Box>

                      {budgetRooms.length > 3 && (
                        <IconButton onClick={() => scrollBudget(1)} sx={{
                          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                          zIndex: 2, bgcolor: 'white', boxShadow: 3,
                          '&:hover': { bgcolor: PC_LIGHT },
                        }}>
                          <ChevronRight sx={{ color: PC }} />
                        </IconButton>
                      )}
                    </Box>
                  </>
                )}

                {/* 7. Ưu đãi cho cuối tuần */}
                <Box sx={{ mb: 2, pl: 6 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Ưu đãi cho cuối tuần</Typography>
                  <Typography variant="body2" color="text.secondary">Tiết kiệm cho chỗ nghỉ từ ngày 8 tháng 5 - ngày 10 tháng 5</Typography>
                </Box>
                <Box sx={{ position: 'relative', mb: 8, px: 6 }}>
                  <IconButton onClick={() => scrollWeekend(-1)} sx={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    zIndex: 2, bgcolor: 'white', boxShadow: 3,
                    '&:hover': { bgcolor: PC_LIGHT },
                  }}>
                    <ChevronLeft sx={{ color: PC }} />
                  </IconButton>

                  <Box ref={weekendScrollRef} sx={{
                    display: 'flex', gap: 3, overflowX: 'auto', pb: 2, pt: 1,
                    justifyContent: 'flex-start',
                    scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                    scrollSnapType: 'x mandatory',
                  }}>
                    {weekendDeals.map(r => (
                      <Box key={r.id || r.roomId} sx={{ width: 'calc((100% - 48px) / 3)', flexShrink: 0, scrollSnapAlign: 'start' }}>
                        <RoomCard room={r} isMock={r._isMockCard} oldPrice={r.oldPrice} />
                      </Box>
                    ))}
                  </Box>

                  <IconButton onClick={() => scrollWeekend(1)} sx={{
                    position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                    zIndex: 2, bgcolor: 'white', boxShadow: 3,
                    '&:hover': { bgcolor: PC_LIGHT },
                  }}>
                    <ChevronRight sx={{ color: PC }} />
                  </IconButton>
                </Box>
              </>
            ) : (
              /* Search Results View */
              <Box sx={{ px: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: PC }}>
                      {t('booking_page.search_results')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {rooms.length} {t('booking_page.available_rooms_sub')}
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    startIcon={<ChevronLeft />}
                    onClick={handleClearSearch}
                    sx={{ 
                      borderRadius: 2, color: PC, borderColor: PC, fontWeight: 700,
                      '&:hover': { bgcolor: PC_LIGHT, borderColor: PC }
                    }}
                  >
                    {t('booking_page.back_to_home')}
                  </Button>
                </Box>

                {loading ? (
                  <Grid container spacing={3}>
                    {[...Array(6)].map((_, i) => (
                      <Grid item xs={12} sm={6} md={4} key={i}>
                        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 1 }} />
                        <Skeleton width="70%" height={24} sx={{ mb: 0.5 }} />
                        <Skeleton width="40%" height={20} />
                      </Grid>
                    ))}
                  </Grid>
                ) : rooms.length > 0 ? (
                  <Grid container spacing={3}>
                    {rooms.map(r => (
                      <Grid item xs={12} sm={6} md={4} key={r.id}>
                        <RoomCard room={r} isMock={false} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Alert severity="info" sx={{ borderRadius: 3, display: 'inline-flex', px: 5 }}>
                      {t('booking_page.no_rooms_found')}
                    </Alert>
                    <Box sx={{ mt: 3 }}>
                      <Button variant="contained" onClick={handleClearSearch} sx={{ bgcolor: PC, borderRadius: 2 }}>
                        {t('booking_page.back_to_home')}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

          </Box>
        </Box>
      </Box>

      {/* Room Detail Drawer */}
      <RoomDetail
        open={detailOpen}
        room={selectedRoom}
        onClose={() => setDetailOpen(false)}
        onBook={(room) => openBooking(room, selectedIsMock)}
        canEdit={false}
      />

      {/* Booking Dialog */}
      <BookingDialog
        open={dialogOpen}
        room={selectedRoom}
        isMock={selectedIsMock}
        searchParams={params}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleBookingSuccess}
        navigate={navigate}
      />

      {/* Login Prompt Modal */}
      <LoginPromptModal
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ borderRadius: 2, fontWeight: 600 }}>
          {snackbar.msg}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default BookingPage;
