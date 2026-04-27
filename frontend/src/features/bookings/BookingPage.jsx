import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, TextField, Button, Card, CardContent, CardMedia,
  Rating, Chip, Checkbox, FormControlLabel, FormGroup, IconButton,
  Divider, InputAdornment, Skeleton, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, CircularProgress
} from '@mui/material';
import { Menu as MenuIcon, Search, LocationOn, ChevronLeft, Close } from '@mui/icons-material';
import { getRoomsApi, getAvailableRoomsApi } from '../../shared/api/roomApi';
import { createBookingApi } from '../../shared/api/bookingApi';

const PC = '#c0496e';
const PC_LIGHT = '#fce4ec';
const SIDEBAR_W = 300;

const DESTINATIONS = [
  { name: 'TP. Hồ Chí Minh', desc: 'Thành phố sôi động', emoji: '🏙️', bg: '#fff0f3' },
  { name: 'Hà Nội',           desc: 'Thủ đô ngàn năm',    emoji: '🏛️', bg: '#f0f4ff' },
  { name: 'Vũng Tàu',         desc: 'Biển xanh cát trắng',emoji: '🏖️', bg: '#f0fff4' },
  { name: 'Đà Lạt',           desc: 'Thành phố ngàn hoa', emoji: '🌸', bg: '#fff8f0' },
  { name: 'Đà Nẵng',          desc: 'Thành phố đáng sống',emoji: '🌉', bg: '#f5f0ff' },
];

const ACCOM_TYPES = [
  { name: 'Khách sạn', emoji: '🏨' },
  { name: 'Căn hộ',    emoji: '🏠' },
  { name: 'Resort',    emoji: '🌴' },
  { name: 'Biệt thự',  emoji: '🏡' },
  { name: 'Villa',     emoji: '🏰' },
];

const ROOM_TYPES = ['Standard', 'Deluxe', 'VIP Suite', 'Family', 'Penthouse'];
const BED_TYPES  = ['Đơn', 'Đôi', 'Ba', 'King', 'Queen'];
const SERVICES   = ['Bữa sáng', 'Đưa đón sân bay', 'Thuê xe máy', 'Spa & Massage', 'Hồ bơi'];

const MOCK_ROOMS = [
  { id:'m1', name:'Phòng Deluxe View Biển', location:'Vũng Tàu', bed:'King',   reviews:124, rating:4.8, type:'Deluxe',   price:1200000, bg:'#dbeafe', emoji:'🌊' },
  { id:'m2', name:'Phòng Standard Classic', location:'Hà Nội',   bed:'Đôi',   reviews:210, rating:4.5, type:'Standard', price:800000,  bg:'#e0e7ff', emoji:'🏛️' },
  { id:'m3', name:'Family Room',            location:'Đà Nẵng',  bed:'Ba',    reviews:155, rating:4.6, type:'Family',   price:1500000, bg:'#fef9c3', emoji:'🌉' },
];

const fmtVND = (n) => new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' }).format(n);
const nightsBetween = (a, b) => {
  const diff = new Date(b) - new Date(a);
  return diff > 0 ? Math.round(diff / 86400000) : 1;
};

/* ─── Sidebar ─────────────────────────────────────────── */
const Sidebar = ({ params, onParam, roomTypes, setRoomTypes, bedTypes, setBedTypes, services, setServices, onSearch, loading }) => {
  const toggle = (list, setList, v) =>
    setList(list.includes(v) ? list.filter(x => x !== v) : [...list, v]);
  const labelSx = { fontWeight:700, color:'#888', letterSpacing:1, fontSize:11, display:'block', mb:0.5 };

  return (
    <Box sx={{ width: SIDEBAR_W, p: 2.5, height:'100%', overflowY:'auto' }}>
      <Box sx={{ display:'flex', alignItems:'center', mb:2, gap:1 }}>
        <Search sx={{ color: PC }} />
        <Typography variant="h6" sx={{ fontWeight:700, color: PC }}>Tìm kiếm phòng</Typography>
      </Box>
      <Divider sx={{ mb:2 }} />

      <Typography sx={labelSx}>NƠI ĐẾN</Typography>
      <TextField fullWidth size="small" value={params.destination}
        onChange={e => onParam('destination', e.target.value)} sx={{ mb:2 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn sx={{ color:PC, fontSize:18 }} /></InputAdornment> }}
      />

      <Grid container spacing={1.5} sx={{ mb:2 }}>
        {[['checkIn','NHẬN PHÒNG'],['checkOut','TRẢ PHÒNG']].map(([k,lbl]) => (
          <Grid item xs={6} key={k}>
            <Typography sx={labelSx}>{lbl}</Typography>
            <TextField fullWidth size="small" type="date" value={params[k]}
              onChange={e => onParam(k, e.target.value)}
              InputLabelProps={{ shrink:true }} inputProps={{ style:{ fontSize:12 } }}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5} sx={{ mb:3 }}>
        {[['adults','NGƯỜI LỚN',1],['children','TRẺ EM',0]].map(([k,lbl,min]) => (
          <Grid item xs={6} key={k}>
            <Typography sx={labelSx}>{lbl}</Typography>
            <TextField fullWidth size="small" type="number" value={params[k]}
              onChange={e => onParam(k, Math.max(min, parseInt(e.target.value)||min))}
              inputProps={{ min }}
            />
          </Grid>
        ))}
      </Grid>

      {[
        ['LOẠI PHÒNG',  ROOM_TYPES, roomTypes, setRoomTypes],
        ['LOẠI GIƯỜNG', BED_TYPES,  bedTypes,  setBedTypes],
        ['DỊCH VỤ ĐI KÈM', SERVICES, services, setServices],
      ].map(([title, items, list, setList]) => (
        <Box key={title}>
          <Typography sx={{ ...labelSx, color: PC, mb:1 }}>{title}</Typography>
          <FormGroup sx={{ mb:1 }}>
            {items.map(v => (
              <FormControlLabel key={v}
                control={<Checkbox size="small" checked={list.includes(v)}
                  onChange={() => toggle(list, setList, v)}
                  sx={{ color:PC, '&.Mui-checked':{ color:PC } }}
                />}
                label={<Typography variant="body2">{v}</Typography>}
                sx={{ mb:0.1 }}
              />
            ))}
          </FormGroup>
          <Divider sx={{ mb:2 }} />
        </Box>
      ))}

      <Button fullWidth variant="contained" onClick={onSearch} disabled={loading}
        startIcon={<Search />}
        sx={{ bgcolor:PC, '&:hover':{ bgcolor:'#a0365a' }, borderRadius:2, py:1.2, fontWeight:700 }}
      >
        {loading ? 'Đang tìm...' : 'Tìm phòng'}
      </Button>
    </Box>
  );
};

/* ─── BookingDialog ────────────────────────────────────── */
const BookingDialog = ({ open, room, isMock, searchParams, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    checkIn: searchParams?.checkIn || '',
    checkOut: searchParams?.checkOut || '',
    numGuests: (searchParams?.adults || 1),
    specialRequest: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        checkIn: searchParams?.checkIn || '',
        checkOut: searchParams?.checkOut || '',
        numGuests: (searchParams?.adults || 1),
        specialRequest: '',
      });
      setError('');
    }
  }, [open, searchParams]);

  if (!room) return null;

  const roomName  = isMock ? room.name  : `Phòng ${room.roomNumber}`;
  const roomType  = isMock ? room.type  : (room.roomTypeName || 'Standard');
  const roomPrice = isMock ? room.price : Number(room.pricePerNight || room.priceDay || 0);
  const nights    = nightsBetween(form.checkIn, form.checkOut);
  const total     = roomPrice * nights;

  const handleBook = async () => {
    if (!form.checkIn || !form.checkOut) { setError('Vui lòng chọn ngày nhận và trả phòng.'); return; }
    if (new Date(form.checkOut) <= new Date(form.checkIn)) { setError('Ngày trả phòng phải sau ngày nhận phòng.'); return; }
    if (isMock) { setError('Phòng mẫu — vui lòng tìm kiếm phòng thực trên hệ thống.'); return; }

    setSubmitting(true);
    setError('');
    try {
      await createBookingApi({
        roomId: room.roomId,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        numGuests: Number(form.numGuests),
        specialRequest: form.specialRequest,
      });
      onSuccess();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Đặt phòng thất bại. Vui lòng thử lại.';
      setError(typeof msg === 'string' ? msg : 'Đặt phòng thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3 } }}>
      <DialogTitle sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', pb:1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight:800, color: PC }}>Xác nhận đặt phòng</Typography>
          <Typography variant="body2" color="text.secondary">{roomName}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt:1 }}>
        {/* Room summary */}
        <Box sx={{ display:'flex', gap:2, mb:2.5, p:2, bgcolor:'#fafafa', borderRadius:2, border:'1px solid #eee' }}>
          <Box sx={{ flex:1 }}>
            <Chip label={roomType} size="small" sx={{ bgcolor: PC_LIGHT, color: PC, fontWeight:700, mb:0.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight:800 }}>{roomName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {fmtVND(roomPrice)} / đêm
            </Typography>
          </Box>
        </Box>

        {/* Date pickers */}
        <Grid container spacing={2} sx={{ mb:2 }}>
          <Grid item xs={6}>
            <TextField fullWidth label="Ngày nhận phòng" type="date" size="small"
              value={form.checkIn}
              onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))}
              InputLabelProps={{ shrink:true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Ngày trả phòng" type="date" size="small"
              value={form.checkOut}
              onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))}
              InputLabelProps={{ shrink:true }}
            />
          </Grid>
        </Grid>

        <TextField fullWidth label="Số khách" type="number" size="small"
          value={form.numGuests}
          onChange={e => setForm(f => ({ ...f, numGuests: Math.max(1, parseInt(e.target.value)||1) }))}
          inputProps={{ min:1 }}
          sx={{ mb:2 }}
        />

        <TextField fullWidth label="Yêu cầu đặc biệt (tuỳ chọn)" multiline rows={2} size="small"
          value={form.specialRequest}
          onChange={e => setForm(f => ({ ...f, specialRequest: e.target.value }))}
          placeholder="Ví dụ: phòng tầng cao, view biển..."
          sx={{ mb:2 }}
        />

        {/* Price summary */}
        {form.checkIn && form.checkOut && nights > 0 && (
          <Box sx={{ p:2, bgcolor: PC_LIGHT, borderRadius:2 }}>
            <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
              <Typography variant="body2" color="text.secondary">{fmtVND(roomPrice)} × {nights} đêm</Typography>
              <Typography variant="body2" sx={{ fontWeight:600 }}>{fmtVND(total)}</Typography>
            </Box>
            <Divider sx={{ my:1 }} />
            <Box sx={{ display:'flex', justifyContent:'space-between' }}>
              <Typography variant="subtitle2" sx={{ fontWeight:800 }}>Tổng cộng</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight:800, color: PC }}>{fmtVND(total)}</Typography>
            </Box>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mt:2, borderRadius:2 }}>{error}</Alert>}
      </DialogContent>

      <DialogActions sx={{ px:3, pb:3 }}>
        <Button onClick={onClose} sx={{ borderRadius:2 }}>Huỷ</Button>
        <Button variant="contained" onClick={handleBook} disabled={submitting}
          sx={{ bgcolor:PC, '&:hover':{ bgcolor:'#a0365a' }, borderRadius:2, fontWeight:700, px:3 }}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {submitting ? 'Đang xử lý...' : 'Xác nhận đặt phòng'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ─── Main ─────────────────────────────────────────────── */
const BookingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rooms, setRooms]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searched, setSearched]       = useState(false);
  const [destIdx, setDestIdx]         = useState(1);
  const [accomIdx, setAccomIdx]       = useState(2);
  const [roomTypes, setRoomTypes]     = useState(['Standard']);
  const [bedTypes,  setBedTypes]      = useState([]);
  const [services,  setServices]      = useState([]);
  const [params, setParams]           = useState({
    destination: 'Hà Nội',
    checkIn:  new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now()+86400000).toISOString().split('T')[0],
    adults: 2, children: 0,
  });

  // Dialog state
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedIsMock, setSelectedIsMock] = useState(false);
  const [snackbar, setSnackbar]       = useState({ open:false, msg:'', severity:'success' });

  useEffect(() => {
    getRoomsApi()
      .then(d => setRooms(Array.isArray(d) ? d : []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  const onParam = (k, v) => setParams(p => ({ ...p, [k]: v }));

  const handleSearch = async () => {
    if (!params.checkIn || !params.checkOut) return;
    setLoading(true); setSearched(true);
    try {
      const d = await getAvailableRoomsApi(params.checkIn, params.checkOut);
      setRooms(Array.isArray(d) ? d : []);
    } catch { setRooms([]); }
    finally { setLoading(false); }
  };

  const openBooking = (room, isMock) => {
    setSelectedRoom(room);
    setSelectedIsMock(isMock);
    setDialogOpen(true);
  };

  const handleBookingSuccess = () => {
    setDialogOpen(false);
    setSnackbar({ open:true, msg:'🎉 Đặt phòng thành công! Kiểm tra email xác nhận của bạn.', severity:'success' });
  };

  const selectDest = (idx) => { setDestIdx(idx); onParam('destination', DESTINATIONS[idx].name); };

  /* ── Room Card ─────────────────────────────────────────── */
  const RoomCard = ({ room, isMock }) => (
    <Card sx={{ borderRadius:3, overflow:'hidden', transition:'all 0.3s',
      '&:hover':{ transform:'translateY(-6px)', boxShadow:'0 12px 30px rgba(0,0,0,0.13)' } }}>
      {isMock
        ? <Box sx={{ height:160, bgcolor: room.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Typography sx={{ fontSize:64 }}>{room.emoji}</Typography>
          </Box>
        : <CardMedia component="img" height="160"
            image={room.image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600'}
            alt={isMock ? room.name : `Phòng ${room.roomNumber}`}
          />
      }
      <CardContent sx={{ p:2 }}>
        <Chip label={isMock ? room.type : (room.roomTypeName||'Standard')} size="small"
          sx={{ bgcolor: PC_LIGHT, color: PC, fontWeight:700, fontSize:11, mb:1 }} />
        <Typography variant="subtitle1" sx={{ fontWeight:800, lineHeight:1.2, mb:0.5 }}>
          {isMock ? room.name : `Phòng ${room.roomNumber}`}
        </Typography>
        <Typography variant="caption" color="text.secondary"
          sx={{ display:'flex', alignItems:'center', gap:0.3, mb:1 }}>
          <LocationOn fontSize="inherit" />
          {isMock ? `${room.location} · ${room.bed}` : (room.province || 'Hà Nội')}
        </Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:0.5, mb:1.5 }}>
          <Rating value={isMock ? room.rating : 5} precision={0.1} readOnly size="small"
            sx={{ '& .MuiRating-iconFilled':{ color: PC } }} />
          <Typography variant="caption" color="text.secondary">
            ({isMock ? room.reviews : 48} đánh giá)
          </Typography>
        </Box>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight:800, color: PC }}>
            {fmtVND(isMock ? room.price : Number(room.pricePerNight || room.priceDay || 0))}
          </Typography>
          <Button size="small" variant="contained" onClick={() => openBooking(room, isMock)}
            sx={{ bgcolor:PC, '&:hover':{ bgcolor:'#a0365a' }, borderRadius:2, fontSize:11, px:1.5 }}>
            Đặt ngay
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display:'flex', minHeight:'100vh', bgcolor:'#f7f8fa' }}>

      {/* Sidebar */}
      <Box sx={{
        width: sidebarOpen ? SIDEBAR_W : 0,
        minWidth: sidebarOpen ? SIDEBAR_W : 0,
        overflow:'hidden',
        transition:'all 0.3s ease',
        flexShrink:0,
        bgcolor:'white',
        borderRight:'1px solid #eee',
        position:'sticky', top:0, maxHeight:'100vh',
      }}>
        <Sidebar params={params} onParam={onParam}
          roomTypes={roomTypes} setRoomTypes={setRoomTypes}
          bedTypes={bedTypes}   setBedTypes={setBedTypes}
          services={services}   setServices={setServices}
          onSearch={handleSearch} loading={loading}
        />
      </Box>

      {/* Main */}
      <Box sx={{ flex:1, overflow:'auto', minWidth:0 }}>
        {/* Hamburger */}
        <Box sx={{ px:2, pt:2, pb:0, display:'flex', alignItems:'center', gap:1 }}>
          <IconButton onClick={() => setSidebarOpen(o => !o)}
            sx={{ bgcolor: PC, color:'white', borderRadius:2, '&:hover':{ bgcolor:'#a0365a' } }}>
            {sidebarOpen ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {sidebarOpen ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </Typography>
        </Box>

        <Box sx={{ px:3, py:2, pb:8 }}>

          {/* Điểm đến phổ biến */}
          <Typography variant="h6" sx={{ fontWeight:800, mb:2 }}>🗺️ Điểm đến phổ biến</Typography>
          <Grid container spacing={2} sx={{ mb:4 }}>
            {DESTINATIONS.map((d, i) => (
              <Grid item xs={6} sm={4} md={2.4} key={d.name}>
                <Card onClick={() => selectDest(i)} sx={{
                  cursor:'pointer', borderRadius:3, textAlign:'center', p:1.5, bgcolor: d.bg,
                  border: destIdx===i ? `2px solid ${PC}` : '2px solid transparent',
                  transition:'all 0.2s',
                  '&:hover':{ transform:'translateY(-4px)', boxShadow:4 },
                  boxShadow: destIdx===i ? `0 0 0 3px ${PC}22` : 1,
                }}>
                  <Typography sx={{ fontSize:36 }}>{d.emoji}</Typography>
                  <Typography variant="body2" sx={{ fontWeight:700, color: destIdx===i ? PC : 'text.primary', mt:0.5 }}>
                    {d.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{d.desc}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Loại chỗ nghỉ */}
          <Typography variant="h6" sx={{ fontWeight:800, mb:2 }}>🏠 Loại chỗ nghỉ</Typography>
          <Box sx={{ display:'flex', gap:2, mb:4, overflowX:'auto', pb:1 }}>
            {ACCOM_TYPES.map((t, i) => (
              <Card key={t.name} onClick={() => setAccomIdx(i)} sx={{
                cursor:'pointer', borderRadius:3, textAlign:'center', p:2, minWidth:100, flexShrink:0,
                border: accomIdx===i ? `2px solid ${PC}` : '2px solid #eee',
                bgcolor: accomIdx===i ? PC_LIGHT : 'white',
                transition:'all 0.2s',
                '&:hover':{ transform:'translateY(-4px)', boxShadow:4 },
              }}>
                <Typography sx={{ fontSize:32 }}>{t.emoji}</Typography>
                <Typography variant="body2" sx={{ fontWeight:600, mt:0.5, color: accomIdx===i ? PC : 'text.primary' }}>
                  {t.name}
                </Typography>
              </Card>
            ))}
          </Box>

          {/* Phòng nổi bật */}
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
            <Typography variant="h6" sx={{ fontWeight:800 }}>
              ⭐ {searched ? 'Phòng còn trống' : 'Phòng nổi bật'}
            </Typography>
            {!loading && (
              <Typography variant="body2" color="text.secondary">
                {rooms.length > 0 ? `${rooms.length} phòng` : `${MOCK_ROOMS.length} phòng mẫu`}
              </Typography>
            )}
          </Box>

          <Grid container spacing={3}>
            {loading ? (
              [...Array(3)].map((_,i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rectangular" height={160} sx={{ borderRadius:3, mb:1 }} />
                  <Skeleton width="70%" height={22} sx={{ mb:0.5 }} />
                  <Skeleton width="50%" height={18} />
                </Grid>
              ))
            ) : rooms.length > 0 ? (
              rooms.map(r => (
                <Grid item xs={12} sm={6} md={4} key={r.id}>
                  <RoomCard room={r} isMock={false} />
                </Grid>
              ))
            ) : searched ? (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ borderRadius:3 }}>
                  Không tìm thấy phòng trống trong thời gian này. Vui lòng thử ngày khác!
                </Alert>
              </Grid>
            ) : (
              MOCK_ROOMS.map(r => (
                <Grid item xs={12} sm={6} md={4} key={r.id}>
                  <RoomCard room={r} isMock={true} />
                </Grid>
              ))
            )}
          </Grid>

        </Box>
      </Box>

      {/* Booking Dialog */}
      <BookingDialog
        open={dialogOpen}
        room={selectedRoom}
        isMock={selectedIsMock}
        searchParams={params}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleBookingSuccess}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(s => ({ ...s, open:false }))}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbar(s => ({ ...s, open:false }))}
          sx={{ borderRadius:2, fontWeight:600 }}>
          {snackbar.msg}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default BookingPage;
