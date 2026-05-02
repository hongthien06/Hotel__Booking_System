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
  Snackbar, CircularProgress, Slider
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
  { key: 'standard', label: 'room_types.standard', img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400' },
  { key: 'deluxe', label: 'room_types.deluxe', img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400' },
  { key: 'superior', label: 'room_types.superior', img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400' },
  { key: 'family', label: 'room_types.family', img: 'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=400' },
  { key: 'president', label: 'room_types.president', img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400' }
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
      <TextField fullWidth size="small" value={params.destination}
        onChange={e => onParam('destination', e.target.value)} sx={{ mb: 2 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn sx={{ color: PC, fontSize: 18 }} /></InputAdornment> }}
      />

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
  const roomType = isMock ? room.type : (room.roomTypeName || 'Standard');
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
      // Navigate directly to payment step (skip review)
      navigate('/payment?step=1', {
        state: {
          booking: bookingResult,
          room: room,
          form: {
            checkIn: form.checkIn,
            checkOut: form.checkOut,
            numAdults: Number(form.numAdults),
            numChildren: Number(form.numChildren),
            specialRequest: form.specialRequest,
          },
        },
      });
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
      const scrollAmount = (clientWidth + 20) / 5;
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
      const typeName = roomTypes.length === 1 ? ROOM_TYPES.find(t => t.key === roomTypes[0])?.key : undefined;
      const bedType = bedTypes.length === 1 ? bedTypes[0] : undefined;
      const d = await getAvailableRoomsApi(
        searchParams.checkIn,
        searchParams.checkOut,
        searchParams.destination || undefined,
        minPrice,
        maxPrice,
        typeName,
        bedType
      );
      setRooms(Array.isArray(d) ? d : []);
    } catch { setRooms([]); }
    finally { setLoading(false); }
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
        typeKey,
        bedTypes.length === 1 ? bedTypes[0] : undefined
      );
      setRooms(Array.isArray(d) ? d : []);
    } catch { setRooms([]); }
    finally { setLoading(false); }
  };

  const selectDest = (idx) => { setDestIdx(idx); onParam('destination', DESTINATIONS[idx].province || DESTINATIONS[idx].name); };

  /* ── Room Card ─────────────────────────────────────────── */
  const RoomCard = ({ room, isMock }) => {
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
            image={room.image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600'}
            alt={isMock ? room.name : `${t('booking_page.room')} ${room.roomNumber}`}
          />
        }
        <CardContent sx={{ p: 2 }}>
          <Chip label={isMock ? t(`room_types.${room.type.toLowerCase()}`) : t(room.roomTypeName || 'Standard')} size="small"
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
                      }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: PC, mb: 0.5 }}>{s.destination}</Typography>
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
                    width: 'calc((100% - 80px) / 5)', height: 160,
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
                    width: 'calc((100% - 48px) / 4)', height: 160,
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
                    {searched ? t('booking_page.available_rooms') : t('booking_page.featured_rooms')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searched ? t('booking_page.available_rooms_sub') : t('booking_page.featured_rooms_sub')}
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
              {(searched ? rooms.length > 3 : MOCK_ROOMS.length > 3) && (
                <IconButton onClick={() => scrollRooms(-1)} sx={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  zIndex: 2, bgcolor: 'white', boxShadow: 3,
                  '&:hover': { bgcolor: PC_LIGHT },
                }}>
                  <ChevronLeft sx={{ color: PC }} />
                </IconButton>
              )}

              <Box ref={roomScrollRef} sx={{
                display: 'flex', gap: 3, overflowX: 'auto', pb: 2,
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
                ) : rooms.length > 0 ? (
                  rooms.map(r => (
                    <Box key={r.id} sx={{ width: 'calc((100% - 48px) / 3)', flexShrink: 0, scrollSnapAlign: 'start' }}>
                      <RoomCard room={r} isMock={false} />
                    </Box>
                  ))
                ) : searched ? (
                  <Box sx={{ width: '100%' }}>
                    <Alert severity="info" sx={{ borderRadius: 3 }}>
                      {t('booking_page.no_rooms_found')}
                    </Alert>
                  </Box>
                ) : (
                  MOCK_ROOMS.map(r => (
                    <Box key={r.id} sx={{ width: 'calc((100% - 48px) / 3)', flexShrink: 0, scrollSnapAlign: 'start' }}>
                      <RoomCard room={r} isMock={true} />
                    </Box>
                  ))
                )}
              </Box>

              {(searched ? rooms.length > 3 : MOCK_ROOMS.length > 3) && (
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
                    display: 'flex', gap: 3, overflowX: 'auto', pb: 2,
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
                    display: 'flex', gap: 3, overflowX: 'auto', pb: 2,
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
