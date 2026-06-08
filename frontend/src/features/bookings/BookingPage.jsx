import React, { useState, useEffect, useRef } from 'react'
import imgHCM from '../../assets/TP_HCM.png'
import imgNoResults from '../../assets/KhongthayKQ.png'
import imgHaNoi from '../../assets/HA_NOI.jpg'
import imgDaLat from '../../assets/DA_LAT.webp'
import imgDaNang from '../../assets/DA_NANG.jpg'
import imgNhaTrang from '../../assets/NHA_TRANG.png'
import imgPhuQuoc from '../../assets/PHU_QUOC.png'
import imgSapa from '../../assets/SAPA.png'
import imgHue from '../../assets/HUE.png'
import imgQuangNinh from '../../assets/QUANG_NINH.jpg'
import imgCaoBang from '../../assets/CAO_BANG.jpg'
import imgHaNam from '../../assets/HA_NAM.webp'
import imgHaTinh from '../../assets/HA_TINH.png'
import imgQuangNam from '../../assets/QUANG_NAM.jpeg'
import imgCanTho from '../../assets/CAN_THO.jpg'
import imgThanhHoa from '../../assets/THANH_HOA.jpg'
import imgDienBien from '../../assets/DIEN_BIEN.jpg'
import imgSonLa from '../../assets/SON_LA.jpg'
import imgBinhThuan from '../../assets/BINH_THUAN.jpg'
import {
  Box, Typography, Grid, TextField, Button, Card, CardContent, CardMedia,
  Rating, Chip, Checkbox, FormControlLabel, FormGroup, IconButton,
  Divider, InputAdornment, Skeleton, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Slider, MenuItem, Popover,
  useMediaQuery, useTheme, Drawer
} from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { useTranslation } from 'react-i18next'
import { Search, LocationOn, ChevronLeft, ChevronRight, Close, FilterList, ArrowForward, EmojiEvents, Phone, Hotel as HotelIcon } from '@mui/icons-material'
import { getRoomsApi, getAvailableRoomsApi, getFeaturedRoomsApi, getTopRatedRoomsApi, getWeekendDealsApi, getBudgetRoomsApi } from '../../shared/api/roomApi'
import { getOccupiedRoomsApi } from '../../shared/api/bookingApi'
import { getAmenitiesApi } from '../../shared/api/amenityApi'
import { createBookingApi, getBookedDatesApi } from '../../shared/api/bookingApi'
import { getMyMembershipApi } from '../../shared/api/membershipApi'
import { useAuth } from '../../shared/hooks/useAuth'
import LoginPromptModal from '../../shared/components/modals/LoginPromptModal'
import { useNavigate, useLocation } from 'react-router-dom'
import RoomDetail from '../rooms/Details/RoomDetail'
import BookingDialog from './components/BookingDialog'
import i18n from 'i18next'
import { formatCurrency as formatCurrencyShared } from '../../shared/utils/formatters'
import { getMembershipTierName, getMembershipTrackingPhone } from '../../shared/utils/membership'
const PC = '#c0496e'
const PC_LIGHT = '#fce4ec'
const SIDEBAR_W = 300

const DESTINATIONS = [
  { key: 'caobang', province: 'Cao Bằng', img: imgCaoBang, bg: '#f0f8ff' },
  { key: 'hanam', province: 'Hà Nam', img: imgHaNam, bg: '#fff9f0' },
  { key: 'hanoi', province: 'Hà Nội', img: imgHaNoi, bg: '#f0f4ff' },
  { key: 'quangninh', province: 'Quảng Ninh', img: imgQuangNinh, bg: '#f0fff9' },
  { key: 'hatinh', province: 'Hà Tĩnh', img: imgHaTinh, bg: '#fff0f8' },
  { key: 'danang', province: 'Đà Nẵng', img: imgDaNang, bg: '#f5f0ff' },
  { key: 'quangnam', province: 'Quảng Nam', img: imgQuangNam, bg: '#fffef0' },
  { key: 'nhatrang', province: 'Khánh Hòa', img: imgNhaTrang, bg: '#f0f9ff' },
  { key: 'cantho', province: 'Cần Thơ', img: imgCanTho, bg: '#f0fff0' },
  { key: 'hcm', province: 'TP. Hồ Chí Minh', img: imgHCM, bg: '#fff0f3' },
  { key: 'thanhhoa', province: 'Thanh Hóa', img: imgThanhHoa, bg: '#f8f0ff' },
  { key: 'dalat', province: 'Lâm Đồng', img: imgDaLat, bg: '#fff8f0' },
  { key: 'phuquoc', province: 'Kiên Giang', img: imgPhuQuoc, bg: '#f0fff4' },
  { key: 'dienbien', province: 'Điện Biên', img: imgDienBien, bg: '#fff0f0' },
  { key: 'sonla', province: 'Sơn La', img: imgSonLa, bg: '#f0f0ff' },
  { key: 'sapa', province: 'Lào Cai', img: imgSapa, bg: '#f5f5f5' },
  { key: 'hue', province: 'Thừa Thiên Huế', img: imgHue, bg: '#fff5f0' },
  { key: 'binhtuan', province: 'Bình Thuận', img: imgBinhThuan, bg: '#fff4f0' }
]


const ROOM_TYPES = [
  { key: 'Standard', label: 'room_types.standard', img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400' },
  { key: 'Deluxe', label: 'room_types.deluxe', img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400' },
  { key: 'Superior', label: 'room_types.superior', img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400' },
  { key: 'Family Room', label: 'room_types.family', img: 'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=400' },
  { key: 'Presidential Suite', label: 'room_types.president', img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400' }
]
const BED_TYPES = [
  { key: 'SINGLE', label: 'rooms.bed_single' },
  { key: 'DOUBLE', label: 'rooms.bed_double' },
  { key: 'TRIPLE', label: 'rooms.bed_triple' },
  { key: 'KING', label: 'rooms.bed_king' },
  { key: 'QUEEN', label: 'rooms.bed_queen' }
]
const BED_TYPE_LABELS = (t) => ({
  'SINGLE': t('rooms.bed_single'),
  'DOUBLE': t('rooms.bed_double'),
  'TRIPLE': t('rooms.bed_triple'),
  'KING': t('rooms.bed_king'),
  'QUEEN': t('rooms.bed_queen')
})
const formatCurrency = (n, lang) => {
  const currency = lang ? (lang === 'vi' ? 'VND' : 'USD') : null;
  return formatCurrencyShared(n, currency);
}

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
  { id: 'm10', name: 'Luxury Penthouse', location: 'Nha Trang', bed: 'King', reviews: 34, rating: 5.0, type: 'President', price: 8000000, bg: '#faf5ff', emoji: '💎' }
]

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
  { id: 'w10', name: 'Wellness Spa Retreat', location: 'Huế', province: 'Thừa Thiên Huế', bed: 'Queen', reviews: 88, rating: 9.2, type: 'Superior', pricePerNight: 2100000, image: 'https://images.unsplash.com/photo-1601053081350-c1e37a5e7e99?w=400' }
]

const stablePriceMultiplier = (id) => {
  const n = String(id).split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffff, 0)
  return 1.2 + (n % 150) / 1000
}

const nightsBetween = (a, b) => {
  const diff = new Date(b) - new Date(a)
  return diff > 0 ? Math.round(diff / 86400000) : 1
}

// Tra cứu key destination trong DESTINATIONS để hỗ trợ i18n
const getDestinationKey = (destinationStr) => {
  if (!destinationStr) return null
  const found = DESTINATIONS.find(d => d.province === destinationStr || d.name === destinationStr)
  return found ? found.key : null
}

/* ─── RoomCard ─────────────────────────────────────────── */
const RoomCard = ({
  room,
  isMock,
  oldPrice,
  showBookButton = true,
  selectable = false,
  selected = false,
  onToggleSelect,
  onOpenDetail,
  onOpenBooking,
  params = {},
  searched = false
  ,
  isUnavailable = false
}) => {
  const { t, i18n } = useTranslation()

  // Tạo data đánh giá từ MOCK_ROOMS để tránh bị trùng nhau nếu không phải isMock
  const numericId = parseInt(String(room.id || room.roomId || 0).replace(/\D/g, '') || 0)
  const mockData = MOCK_ROOMS[numericId % MOCK_ROOMS.length] || MOCK_ROOMS[0]
  const ratingValue = isMock ? room.rating : mockData.rating
  const reviewCount = isMock ? room.reviews : mockData.reviews

  // 1 child per room stays for free (does not count towards capacity limit)
  const effectiveGuestsForRoom = Number(params.adults || 0) + Math.max(0, Number(params.children || 0) - 1)
  const isCapacityInsufficient = searched && !isMock && room.maxGuests < effectiveGuestsForRoom

  return (
    <Card
      onClick={() => onOpenDetail?.(room, isMock)}
      sx={{
        cursor: 'pointer',
        position: 'relative',
        borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s',
        boxShadow: 1,
        border: selected ? `2px solid ${PC}` : '2px solid transparent',
        '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 30px rgba(0,0,0,0.13)' },
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 360, md: 400 },
        width: '100%',
      }}
    >
      {selectable && (
        <Checkbox
          checked={selected}
          onClick={(e) => { e.stopPropagation(); onToggleSelect?.(room) }}
          disabled={isUnavailable}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            bgcolor: 'rgba(255,255,255,0.9)',
            borderRadius: '50%',
            color: PC,
            '&.Mui-checked': { color: PC },
            '&:hover': { bgcolor: 'white' }
          }}
        />
      )}
      <Box sx={{ position: 'relative', height: { xs: 140, md: 180 }, overflow: 'hidden', flexShrink: 0, bgcolor: 'grey.100' }}>
        {isMock ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: 64 }}>{room.emoji}</Typography>
          </Box>
        ) : (
          (() => {
            const src = (room.imageUrls && room.imageUrls.length > 0) ? room.imageUrls[0] : (room.image || room.imageUrl || room.img || room.imageUrlSmall)
            return src ? (
              <CardMedia
                component="img"
                image={src}
                alt={room.roomName || room.name || (isMock ? room.name : `${t('booking_page.room')} ${room.roomNumber}`)}
                sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HotelIcon sx={{ fontSize: 48, color: 'grey.400' }} />
              </Box>
            )
          })()
        )}
      </Box>
      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          <Chip label={isMock ? t(`room_types.${room.type.toLowerCase()}`) : t(room.typeName || 'Standard')} size="small"
            sx={{ bgcolor: PC_LIGHT, color: PC, fontWeight: 700, fontSize: 11 }} />
          {isCapacityInsufficient && (
            <Chip label={t('booking_page.insufficient_capacity')} size="small" color="error" variant="outlined"
              sx={{ fontWeight: 700, fontSize: 10 }} />
          )}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
          {isMock ? room.name : `${t('booking_page.room')} ${room.roomNumber}`}
        </Typography>
        <Typography variant="caption" color="text.secondary"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mb: 1 }}>
          <LocationOn fontSize="inherit" />
          {isMock
            ? (() => {
              const key = getDestinationKey(room.location)
              const loc = key ? t(`destinations.${key}.name`) : room.location
              return `${loc} · ${room.bed}`
            })()
            : (() => {
              const rawProv = room.province || 'Hà Nội'
              const key = getDestinationKey(rawProv)
              const loc = key ? t(`destinations.${key}.name`) : rawProv
              const beds = room.beds && room.beds.length > 0
                ? room.beds.map(b => `${b.quantity} ${b.bedType}`).join(' + ')
                : (room.typeName || 'Standard')
              return `${loc} · ${beds}`
            })()}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
          <Rating value={ratingValue} precision={0.1} readOnly size="small"
            sx={{ '& .MuiRating-iconFilled': { color: PC } }} />
          <Typography variant="caption" color="text.secondary">
            ({reviewCount} {t('room_detail.reviews')})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: PC }}>
            {oldPrice && (
              <Typography component="span" variant="caption" sx={{ textDecoration: 'line-through', color: '#d32f2f', mr: 1, fontWeight: 500, fontSize: '0.75rem' }}>
                {formatCurrency(oldPrice, i18n.language)}
              </Typography>
            )}
            {formatCurrency(isMock ? room.price : Number(room.pricePerNight || room.priceDay || 0), i18n.language)}
          </Typography>
          {showBookButton && (
            <Button
              size="small" variant="contained" color="primary"
              disabled={isCapacityInsufficient || isUnavailable}
              onClick={(e) => { e.stopPropagation(); onOpenBooking?.(room, isMock) }}
              sx={{ borderRadius: 2, fontSize: 11, px: 1.5 }}
            >
              {isCapacityInsufficient ? t('booking_page.insufficient_capacity') : t('common.book_now')}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

/* ─── Sidebar ─────────────────────────────────────────── */
const Sidebar = ({ params, onParam, roomTypes, setRoomTypes, bedTypes, setBedTypes,
  amenities, selectedAmenities, setSelectedAmenities,
  minPrice, setMinPrice, maxPrice, setMaxPrice, onSearch, loading, onClose }) => {
  const { t } = useTranslation()
  const toggle = (list, setList, v) =>
    setList(list.includes(v) ? list.filter(x => x !== v) : [...list, v])
  const labelSx = { fontWeight: 700, color: '#888', letterSpacing: 1, fontSize: 11, display: 'block', mb: 0.5 }

  return (
    <Box sx={{ width: SIDEBAR_W, p: 2.5, height: '100%', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Search sx={{ color: PC }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: PC }}>{t('booking_page.search_title')}</Typography>
        </Box>
        {onClose && (
          <IconButton onClick={onClose} size="small" sx={{ color: '#999' }}>
            <Close fontSize="small" />
          </IconButton>
        )}
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
          )
        }}
        SelectProps={{
          native: false,
          MenuProps: { PaperProps: { sx: { maxHeight: 300, borderRadius: 2 } } }
        }}
      >
        <MenuItem value="" sx={{ fontSize: 13, fontWeight: 700, color: PC }}>
          {t('booking_page.anywhere')}
        </MenuItem>
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
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={i18n.language}>
              <DatePicker
                value={params[k] ? dayjs(params[k]) : null}
                onChange={(newValue) => onParam(k, newValue ? newValue.format('YYYY-MM-DD') : '')}
                minDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    variant: 'outlined',
                    inputProps: { style: { fontSize: 12 } }
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
        {[['adults', 'booking_page.adults', 1], ['children', 'booking_page.children', 0]].map(([k, lblKey, min]) => (
          <Box sx={{ flex: 1 }} key={k}>
            <Typography sx={labelSx}>{t(lblKey)}</Typography>
            <TextField fullWidth size="small" type="number" value={params[k]}
              onChange={e => onParam(k, Math.max(min, parseInt(e.target.value) || min))}
              inputProps={{ min }}
            />
          </Box>
        ))}
      </Box>

      <Typography sx={{ fontWeight: 700, color: PC, mb: 1, display: 'block' }}>
        {t('booking_page.price_per_night')}
      </Typography>
      <Box sx={{ px: 1, mb: 1 }}>
        <Slider
          value={[minPrice || 0, maxPrice || 10000000]}
          onChange={(e, newValue) => {
            setMinPrice(newValue[0])
            setMaxPrice(newValue[1])
          }}
          valueLabelDisplay="auto"
          min={0}
            max={100000000}
          step={500000}
          sx={{
            color: PC,
            '& .MuiSlider-thumb': {
              bgcolor: 'white',
              border: `2px solid ${PC}`,
              '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 8px ${PC}33` }
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

      {/* Loại phòng */}
      {[
        ['booking_page.room_type', ROOM_TYPES, roomTypes, setRoomTypes],
        ['booking_page.bed_type', BED_TYPES, bedTypes, setBedTypes]
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

      {/* Tiện ích khách sạn — dynamic từ API */}
      {amenities && amenities.length > 0 && (
        <Box>
          <Typography sx={{ ...labelSx, color: PC, mb: 1 }}>
            {t('booking_page.amenities')}
          </Typography>
          <FormGroup sx={{ mb: 1 }}>
            {amenities.map(a => (
              <FormControlLabel key={a.amenityId}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedAmenities.includes(a.amenityName)}
                    onChange={() => toggle(selectedAmenities, setSelectedAmenities, a.amenityName)}
                    sx={{ color: PC, '&.Mui-checked': { color: PC } }}
                  />
                }
                label={<Typography variant="body2">{t(`hotel_amenities.${a.amenityName}`, a.amenityName)}</Typography>}
                sx={{ mb: 0.1 }}
              />
            ))}
          </FormGroup>
          <Divider sx={{ mb: 2 }} />
        </Box>
      )}

      <Button fullWidth variant="contained" color="primary" onClick={onSearch} disabled={loading}
        startIcon={<Search />}
        sx={{ borderRadius: 2, py: 1.2, fontWeight: 700 }}
      >
        {loading ? t('booking_page.searching') : t('booking_page.find_room')}
      </Button>
    </Box>
  )
}


const OffersSection = ({ membership, lang, onOpenMembership }) => {
  const { t } = useTranslation()
  const tierName = getMembershipTierName(membership?.tier, lang)
  const trackingPhone = getMembershipTrackingPhone(membership)

  return (
    <Box sx={{ mb: 6, px: { xs: 2, md: 6 } }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
        {t('banners.offers_title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('banners.offers_subtitle')}
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
        <Box sx={{ flex: 1, p: { xs: 2.5, md: 4 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {membership?.tier && (
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                icon={<EmojiEvents sx={{ fontSize: '16px !important' }} />}
                label={`${t('banners.membership_badge_label')}: ${tierName}`}
                onClick={onOpenMembership}
                sx={{
                  fontWeight: 800,
                  bgcolor: '#fdf2f8',
                  color: '#be185d',
                  border: '1px solid #f9a8d4',
                  cursor: 'pointer'
                }}
              />
              {trackingPhone && (
                <Chip
                  icon={<Phone sx={{ fontSize: '16px !important' }} />}
                  label={trackingPhone}
                  sx={{ fontWeight: 700, bgcolor: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1' }}
                />
              )}
            </Box>
          )}
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
            {t('banners.no_strings_attached')}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#1a1a1a' }}>
            {t('banners.travel_offer_title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 450 }}>
            {t('banners.travel_offer_desc')}
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
            {t('banners.save_for_next_trip')}
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
  )
}



/* ─── Main ─────────────────────────────────────────────── */
const BookingPage = () => {
  const { t } = useTranslation()
  const currentLang = i18n.language || 'vi'
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const { isAuthenticated } = useAuth()
  const [membership, setMembership] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const [rooms, setRooms] = useState([])
  const [allTypeNames, setAllTypeNames] = useState([])
  const [loading, setLoading] = useState(true)
  const [searched, setSearched] = useState(false)
  const [destIdx, setDestIdx] = useState(-1)
  const [roomTypes, setRoomTypes] = useState([])
  const [bedTypes, setBedTypes] = useState([])

  // Amenities state
  const [amenities, setAmenities] = useState([])
  const [selectedAmenities, setSelectedAmenities] = useState([])

  // Sections fetched from backend (featured / top rated / weekend / budget)
  const [featuredList, setFeaturedList] = useState([])
  const [topRatedList, setTopRatedList] = useState([])
  const [weekendList, setWeekendList] = useState([])
  const [budgetList, setBudgetList] = useState([])
  const [sectionsLoading, setSectionsLoading] = useState(false)
  const isFetchingSectionsRef = useRef(false)
  const [occupiedRoomIds, setOccupiedRoomIds] = useState([])

  const fetchSections = async (limit = 10) => {
    if (isFetchingSectionsRef.current) return
    isFetchingSectionsRef.current = true
    setSectionsLoading(true)
    try {
      const [f, t, w, b] = await Promise.all([
        getFeaturedRoomsApi(limit).catch(() => []),
        getTopRatedRoomsApi(limit).catch(() => []),
        getWeekendDealsApi(limit).catch(() => []),
        getBudgetRoomsApi(limit).catch(() => [])
      ])
      setFeaturedList(Array.isArray(f) ? f : [])
      setTopRatedList(Array.isArray(t) ? t : [])
      setWeekendList(Array.isArray(w) ? w : [])
      setBudgetList(Array.isArray(b) ? b : [])
    } catch (err) {
      setFeaturedList([])
      setTopRatedList([])
      setWeekendList([])
      setBudgetList([])
    } finally {
      setSectionsLoading(false)
      isFetchingSectionsRef.current = false
    }
  }

  const [minPrice, setMinPrice] = useState(undefined)
  const [maxPrice, setMaxPrice] = useState(undefined)
  const [params, setParams] = useState(() => ({
    destination: location.state?.destination || '',
    hotelName: location.state?.hotelName || '',
    checkIn: dayjs().format('YYYY-MM-DD'),
    checkOut: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    adults: location.state?.adults ?? 2,
    children: location.state?.children ?? 0
  }))

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [selectedIsMock, setSelectedIsMock] = useState(false)
  const [selectedRoomsForOrder, setSelectedRoomsForOrder] = useState([])
  const totalGuests = Number(params.adults || 0) + Number(params.children || 0)
  const selectedCapacity = selectedRoomsForOrder.reduce((acc, r) => acc + (r.maxGuests || 0), 0)
  const numSelectedRooms = selectedRoomsForOrder.length
  // 1 child per room stays for free (does not count towards capacity limit)
  const effectiveGuests = Number(params.adults || 0) + Math.max(0, Number(params.children || 0) - numSelectedRooms)
  const isTotalCapacityInsufficient = searched && numSelectedRooms > 0 && selectedCapacity < effectiveGuests

  const getRemainingGuests = () => {
    let remainingAdults = Number(params.adults || 0)
    let remainingChildren = Number(params.children || 0)
    
    // Sort selected rooms by capacity descending to allocate larger rooms first
    const sortedRooms = [...selectedRoomsForOrder].sort((a, b) => (b.maxGuests || 0) - (a.maxGuests || 0))
    
    for (const r of sortedRooms) {
      // 1 child per room stays for free
      const freeChild = Math.min(remainingChildren, 1)
      remainingChildren -= freeChild

      const cap = Number(r.maxGuests || 0)
      if (cap <= 0) continue
      
      const total = remainingAdults + remainingChildren
      if (total <= 0) break
      
      // Proportional allocation:
      let allocatedAdults = Math.round(cap * (remainingAdults / total))
      allocatedAdults = Math.min(remainingAdults, allocatedAdults)
      
      let allocatedChildren = cap - allocatedAdults
      allocatedChildren = Math.min(remainingChildren, allocatedChildren)
      
      const leftCap = cap - allocatedAdults - allocatedChildren
      if (leftCap > 0 && remainingAdults > allocatedAdults) {
        const extraAdults = Math.min(remainingAdults - allocatedAdults, leftCap)
        allocatedAdults += extraAdults
      }
      
      remainingAdults -= allocatedAdults
      remainingChildren -= allocatedChildren
    }
    
    return { remainingAdults, remainingChildren }
  }

  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' })
  const destScrollRef = useRef(null)
  const [destCanLeft, setDestCanLeft] = useState(false)
  const [destCanRight, setDestCanRight] = useState(false)
  const scrollDest = (dir) => {
    if (destScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = destScrollRef.current
      const itemsPerView = isMobile ? 1.5 : 4
      const scrollAmount = (clientWidth + 20) / itemsPerView
      if (dir > 0 && scrollLeft + clientWidth >= scrollWidth - 10) return
      if (dir < 0 && scrollLeft <= 10) return
      destScrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' })
    }
  }

  const roomScrollRef = useRef(null)
  const [roomCanLeft, setRoomCanLeft] = useState(false)
  const [roomCanRight, setRoomCanRight] = useState(false)
  const scrollRooms = (dir) => {
    if (roomScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = roomScrollRef.current
      const itemsPerView = isMobile ? 1.2 : 4
      const scrollAmount = (clientWidth + 24) / itemsPerView
      if (dir > 0 && scrollLeft + clientWidth >= scrollWidth - 10) return
      if (dir < 0 && scrollLeft <= 10) return
      roomScrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' })
    }
  }

  const typeScrollRef = useRef(null)
  const [typeCanLeft, setTypeCanLeft] = useState(false)
  const [typeCanRight, setTypeCanRight] = useState(false)
  const scrollTypes = (dir) => {
    if (typeScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = typeScrollRef.current
      const itemsPerView = isMobile ? 2.5 : 4
      const scrollAmount = (clientWidth + 16) / itemsPerView
      if (dir > 0 && scrollLeft + clientWidth >= scrollWidth - 10) return
      if (dir < 0 && scrollLeft <= 10) return
      typeScrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' })
    }
  }

  const budgetScrollRef = useRef(null)
  const [budgetCanLeft, setBudgetCanLeft] = useState(false)
  const [budgetCanRight, setBudgetCanRight] = useState(false)
  const scrollBudget = (dir) => {
    if (budgetScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = budgetScrollRef.current
      const itemsPerView = isMobile ? 1.2 : 4
      const scrollAmount = (clientWidth + 24) / itemsPerView
      if (dir > 0 && scrollLeft + clientWidth >= scrollWidth - 10) return
      if (dir < 0 && scrollLeft <= 10) return
      budgetScrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' })
    }
  }

  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recent_searches')
    return saved ? JSON.parse(saved) : []
  })

  const budgetRooms = React.useMemo(() => {
    if (searched && rooms.length === 0) return []
    const list = budgetList && budgetList.length > 0 ? budgetList : (rooms.length > 0 ? rooms : MOCK_ROOMS)
    return [...list].sort((a, b) => {
      const pA = Number(a.pricePerNight || a.priceDay || a.price || 0)
      const pB = Number(b.pricePerNight || b.priceDay || b.price || 0)
      return pA - pB
    }).slice(0, 10)
  }, [rooms, searched])

  const featuredRooms = React.useMemo(() => {
    if (searched && rooms.length === 0) return []
    const list = featuredList && featuredList.length > 0 ? featuredList : (rooms.length > 0 ? rooms : MOCK_ROOMS)
    return list.slice(0, 10)
  }, [rooms, searched])

  const topRatedRooms = React.useMemo(() => {
    if (searched && rooms.length === 0) return []
    const list = topRatedList && topRatedList.length > 0 ? topRatedList : (rooms.length > 0 ? rooms : MOCK_ROOMS)
    return [...list].sort((a, b) => {
      const rA = Number(a.rating || 0)
      const rB = Number(b.rating || 0)
      if (rB !== rA) return rB - rA
      const revA = Number(a.reviews || 0)
      const revB = Number(b.reviews || 0)
      return revB - revA
    }).slice(0, 10)
  }, [rooms, searched])

  const weekendDeals = React.useMemo(() => {
    if (weekendList && weekendList.length > 0) return weekendList.slice(0, 10)
    const sortedReal = [...rooms].sort((a, b) => {
      const ha = String(a.roomId || a.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
      const hb = String(b.roomId || b.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
      return ha - hb
    })
    const realRooms = sortedReal.slice(0, 10).map(r => ({
      ...r,
      _isMockCard: false,
      oldPrice: Number(r.pricePerNight || r.priceDay || 0) * stablePriceMultiplier(r.roomId || r.id)
    }))
    const needed = Math.max(0, 10 - realRooms.length)
    const mockFill = MOCK_WEEKEND_DEALS.slice(0, needed).map(r => ({
      ...r,
      _isMockCard: true,
      oldPrice: Number(r.pricePerNight || 0) * stablePriceMultiplier(r.id)
    }))
    return [...realRooms, ...mockFill]
  }, [rooms])


  const recentScrollRef = useRef(null)
  const [recentCanLeft, setRecentCanLeft] = useState(false)
  const [recentCanRight, setRecentCanRight] = useState(false)
  const scrollRecent = (dir) => {
    if (recentScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = recentScrollRef.current
      const itemsPerView = isMobile ? 1.5 : 4
      const scrollAmount = (clientWidth + 16) / itemsPerView
      if (dir > 0 && scrollLeft + clientWidth >= scrollWidth - 10) return
      if (dir < 0 && scrollLeft <= 10) return
      recentScrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' })
    }
  }

  const weekendScrollRef = useRef(null)
  const [weekendCanLeft, setWeekendCanLeft] = useState(false)
  const [weekendCanRight, setWeekendCanRight] = useState(false)
  const scrollWeekend = (dir) => {
    if (weekendScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = weekendScrollRef.current
      const itemsPerView = isMobile ? 1.2 : 4
      const scrollAmount = (clientWidth + 24) / itemsPerView
      if (dir > 0 && scrollLeft + clientWidth >= scrollWidth - 10) return
      if (dir < 0 && scrollLeft <= 10) return
      weekendScrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' })
    }
  }

  const topRatedScrollRef = useRef(null)
  const [topRatedCanLeft, setTopRatedCanLeft] = useState(false)
  const [topRatedCanRight, setTopRatedCanRight] = useState(false)
  const scrollTopRated = (dir) => {
    if (topRatedScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = topRatedScrollRef.current
      const itemsPerView = isMobile ? 1.2 : 4
      const scrollAmount = (clientWidth + 24) / itemsPerView
      if (dir > 0 && scrollLeft + clientWidth >= scrollWidth - 10) return
      if (dir < 0 && scrollLeft <= 10) return
      topRatedScrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    getRoomsApi()
      .then(d => {
        const list = Array.isArray(d) ? d : []
        setRooms(list)
        // Lấy danh sách các loại phòng duy nhất từ server để hỗ trợ lọc thông minh
        const types = [...new Set(list.map(r => r.typeName).filter(Boolean))]
        setAllTypeNames(types)
      })
      .catch(() => setRooms([]))
      .finally(() => setLoading(false))
    // Fetch section lists for UI (featured, top-rated, weekend, budget)
    fetchSections()

    // Fetch amenities for the sidebar
    getAmenitiesApi()
      .then(d => setAmenities(Array.isArray(d) ? d : []))
      .catch(() => { })
  }, [])

  // Update scroll button visibility on resize and attach scroll listeners
  useEffect(() => {
    const updateScrollState = (ref, setLeft, setRight) => {
      const el = ref && ref.current
      if (!el) {
        setLeft(false)
        setRight(false)
        return
      }
      const { scrollLeft, scrollWidth, clientWidth } = el
      setLeft(scrollLeft > 10)
      setRight(scrollLeft + clientWidth < scrollWidth - 10)
    }

    const handleResize = () => {
      updateScrollState(destScrollRef, setDestCanLeft, setDestCanRight)
      updateScrollState(recentScrollRef, setRecentCanLeft, setRecentCanRight)
      updateScrollState(typeScrollRef, setTypeCanLeft, setTypeCanRight)
      updateScrollState(roomScrollRef, setRoomCanLeft, setRoomCanRight)
      updateScrollState(topRatedScrollRef, setTopRatedCanLeft, setTopRatedCanRight)
      updateScrollState(budgetScrollRef, setBudgetCanLeft, setBudgetCanRight)
      updateScrollState(weekendScrollRef, setWeekendCanLeft, setWeekendCanRight)
    }

    const attach = (ref, setLeft, setRight) => {
      const el = ref && ref.current
      if (!el) return null
      const handler = () => {
        const { scrollLeft, scrollWidth, clientWidth } = el
        setLeft(scrollLeft > 10)
        setRight(scrollLeft + clientWidth < scrollWidth - 10)
      }
      el.addEventListener('scroll', handler)
      handler()
      return () => el.removeEventListener('scroll', handler)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const cleans = [
      attach(destScrollRef, setDestCanLeft, setDestCanRight),
      attach(recentScrollRef, setRecentCanLeft, setRecentCanRight),
      attach(typeScrollRef, setTypeCanLeft, setTypeCanRight),
      attach(roomScrollRef, setRoomCanLeft, setRoomCanRight),
      attach(topRatedScrollRef, setTopRatedCanLeft, setTopRatedCanRight),
      attach(budgetScrollRef, setBudgetCanLeft, setBudgetCanRight),
      attach(weekendScrollRef, setWeekendCanLeft, setWeekendCanRight),
    ].filter(Boolean)

    return () => {
      window.removeEventListener('resize', handleResize)
      cleans.forEach(c => c && c())
    }
  }, [destScrollRef, recentScrollRef, typeScrollRef, roomScrollRef, topRatedScrollRef, budgetScrollRef, weekendScrollRef])

  const weekendSubtitle = React.useMemo(() => {
    try {
      let start = dayjs().day(5) // Friday
      if (start.isBefore(dayjs(), 'day')) start = start.add(7, 'day')
      const end = start.add(2, 'day') // Sunday
      if (i18n.language && i18n.language.startsWith('vi')) {
        return `Tiết kiệm cho chỗ nghỉ từ ngày ${start.date()} tháng ${start.month() + 1} - ngày ${end.date()} tháng ${end.month() + 1}`
      }
      return `Save on stays from ${start.format('MMM D')} - ${end.format('MMM D')}`
    } catch (e) {
      return t('booking_page.weekend_deals_subtitle')
    }
  }, [i18n.language, t])

  // Hàm bổ trợ để mở rộng loại phòng được chọn (ví dụ: "Deluxe" -> ["Deluxe King", "Deluxe Twin", ...])
  useEffect(() => {
    if (!isAuthenticated) {
      setMembership(null)
      return
    }
    getMyMembershipApi()
      .then(setMembership)
      .catch(() => setMembership(null))
  }, [isAuthenticated])

  const expandRoomTypes = (selectedTypes) => {
    if (!selectedTypes || selectedTypes.length === 0) return undefined
    const expanded = []
    selectedTypes.forEach(st => {
      let searchStr = st
      if (st === 'Family Room') searchStr = 'Family'
      if (st === 'Presidential Suite') searchStr = 'President'

      const matches = allTypeNames.filter(name =>
        name.toLowerCase().includes(searchStr.toLowerCase())
      )
      if (matches.length > 0) {
        expanded.push(...matches)
      } else {
        expanded.push(st)
      }
    })
    return [...new Set(expanded)]
  }

  const onParam = (k, v) => {
    setParams(p => {
      const newP = { ...p, [k]: v }
      if (k === 'destination') {
        newP.hotelName = '' // Clear hotel filter if destination changes manually
      }
      return newP
    })
    if (k === 'destination') {
      const idx = DESTINATIONS.findIndex(d => (d.province || d.name) === v)
      setDestIdx(idx)
    }
  }

  const handleSearch = async (overrideParams) => {
    // Distinguish between a search object and a React event
    const isOverride = overrideParams && typeof overrideParams === 'object' && 'checkIn' in overrideParams
    const searchParams = isOverride ? overrideParams : params

    if (!searchParams.checkIn || !searchParams.checkOut) return
    setLoading(true)
    setSearched(true)

    // Save to history (only for new manual searches)
    if (!isOverride) {
      const newHistory = [searchParams, ...recentSearches.filter(s => s.destination !== searchParams.destination)].slice(0, 10)
      setRecentSearches(newHistory)
      localStorage.setItem('recent_searches', JSON.stringify(newHistory))
    }

    try {
      const d = await getAvailableRoomsApi(
        searchParams.checkIn,
        searchParams.checkOut,
        searchParams.destination || undefined,
        minPrice,
        maxPrice,
        expandRoomTypes(roomTypes),
        bedTypes.length > 0 ? bedTypes : undefined,
        selectedAmenities.length > 0 ? selectedAmenities : undefined,
        searchParams.adults,
        searchParams.children
      )
      let fetched = Array.isArray(d) ? d : []
      if (searchParams.hotelName) {
        fetched = fetched.filter(r => r.hotelName === searchParams.hotelName)
      }
      setRooms(fetched)
      // fetch occupied room ids for selected range to disable selection in UI
      try {
        const occ = await getOccupiedRoomsApi(searchParams.checkIn, searchParams.checkOut)
        setOccupiedRoomIds(Array.isArray(occ) ? occ : [])
      } catch (err) {
        setOccupiedRoomIds([])
      }
    } catch { setRooms([]) }
    finally {
      setLoading(false)
      // refresh UI sections so scroll lists reflect latest availability
      fetchSections()
    }
  }

  // Handle auto search from location state
  useEffect(() => {
    if (location.state?.autoSearch && location.state?.destination) {
      // Find index of destination
      const idx = DESTINATIONS.findIndex(d => (d.province || d.name) === location.state.destination)
      if (idx !== -1) setDestIdx(idx)
      
      const newParams = {
        ...params,
        destination: location.state.destination,
        hotelName: location.state.hotelName || '',
        adults: location.state.adults ?? params.adults,
        children: location.state.children ?? params.children
      }
      setParams(newParams)
      handleSearch(newParams)
      // Clear state so it doesn't run again if we refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // Handle auto book from location state
  useEffect(() => {
    if (location.state?.autoBookRoom) {
      const roomToBook = location.state.autoBookRoom
      setSelectedRoom(roomToBook)
      setSelectedIsMock(false)
      setSelectedRoomsForOrder([])
      setDialogOpen(true)
      if (roomToBook.province || roomToBook.location) {
        setParams(p => ({
          ...p,
          destination: roomToBook.province || roomToBook.location || ''
        }))
      }
      // Clear state so it doesn't run again if we refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const handleClearSearch = () => {
    setSearched(false)
    // Optionally reset rooms to all rooms, or just let them be
    getRoomsApi()
      .then(d => setRooms(Array.isArray(d) ? d : []))
      .catch(() => setRooms([]))
  }

  const handleRecentSearchClick = (s) => {
    setParams(s)
    handleSearch(s)
  }

  const openBooking = (room, isMock) => {
    if (!isAuthenticated) {
      setLoginPromptOpen(true)
      return
    }
    setSelectedRoomsForOrder([])
    setSelectedRoom(room)
    setSelectedIsMock(isMock)
    setDialogOpen(true)
  }
  const toggleRoomSelection = (room) => {
    const id = room.roomId || room.id
    setSelectedRoomsForOrder(prev =>
      prev.some(item => (item.roomId || item.id) === id)
        ? prev.filter(item => (item.roomId || item.id) !== id)
        : [...prev, room]
    )
  }
  const openSelectedRoomsBooking = () => {
    if (!isAuthenticated) {
      setLoginPromptOpen(true)
      return
    }
    if (selectedRoomsForOrder.length === 0) return
    // Prevent booking if any selected room is already occupied for the chosen dates
    const conflict = selectedRoomsForOrder.some(r => occupiedRoomIds.includes((r.roomId || r.id)))
    if (conflict) {
      setSnackbar({ open: true, msg: t('booking_page.conflict_selected_rooms'), severity: 'error' })
      return
    }
    setSelectedRoom(selectedRoomsForOrder[0])
    setSelectedIsMock(false)
    setDialogOpen(true)
    setDetailOpen(false)
  }

  const openDetail = (room, isMock) => {
    setSelectedRoom(room)
    setSelectedIsMock(isMock)
    setDetailOpen(true)
  }

  const handleBookingSuccess = () => {
    setDialogOpen(false)
    setSelectedRoomsForOrder([])
    setSnackbar({ open: true, msg: t('booking_page.booking_success'), severity: 'success' })
    // refresh section lists after a booking — availability / deals may change
    fetchSections()
  }

  const handleTypeClick = async (typeKey) => {
    setRoomTypes([typeKey])
    setLoading(true)
    setSearched(true)
    try {
      const d = await getAvailableRoomsApi(
        params.checkIn,
        params.checkOut,
        params.destination || undefined,
        minPrice,
        maxPrice,
        expandRoomTypes([typeKey]),
        bedTypes.length > 0 ? bedTypes : undefined,
        selectedAmenities.length > 0 ? selectedAmenities : undefined,
        params.adults,
        params.children
      )
      setRooms(Array.isArray(d) ? d : [])
    } catch {
      setRooms([])
    } finally {
      setLoading(false)
      fetchSections()
    }
  }

  return (
    <Box sx={{ display: 'flex', position: 'relative', bgcolor: 'background.default', minHeight: '100vh' }}>

      {/* Sidebar — Desktop cố định, Mobile dùng Drawer */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          PaperProps={{ sx: { width: SIDEBAR_W, border: 'none' } }}
        >
          <Sidebar params={params} onParam={onParam}
            roomTypes={roomTypes} setRoomTypes={setRoomTypes}
            bedTypes={bedTypes} setBedTypes={setBedTypes}
            amenities={amenities}
            selectedAmenities={selectedAmenities}
            setSelectedAmenities={setSelectedAmenities}
            minPrice={minPrice} setMinPrice={setMinPrice}
            maxPrice={maxPrice} setMaxPrice={setMaxPrice}
            onSearch={handleSearch} loading={loading}
            onClose={() => setSidebarOpen(false)}
          />
        </Drawer>
      ) : (
        <Box sx={{
          position: 'fixed',
          top: '58px', left: 0,
          width: sidebarOpen ? SIDEBAR_W : 0,
          height: 'calc(100vh - 58px)',
          overflowY: sidebarOpen ? 'auto' : 'hidden',
          overflowX: 'hidden',
          transition: 'width 0.3s ease',
          bgcolor: 'white',
          borderRight: '1px solid #eee',
          zIndex: 100,
          boxShadow: sidebarOpen ? '2px 0 12px rgba(0,0,0,0.07)' : 'none'
        }}>
          <Sidebar params={params} onParam={onParam}
            roomTypes={roomTypes} setRoomTypes={setRoomTypes}
            bedTypes={bedTypes} setBedTypes={setBedTypes}
            amenities={amenities}
            selectedAmenities={selectedAmenities}
            setSelectedAmenities={setSelectedAmenities}
            minPrice={minPrice} setMinPrice={setMinPrice}
            maxPrice={maxPrice} setMaxPrice={setMaxPrice}
            onSearch={handleSearch} loading={loading}
          />
        </Box>
      )}

      {/* Main — đẩy sang phải theo chiều rộng sidebar (chỉ trên desktop) */}
      <Box sx={{
        flex: 1, minWidth: 0,
        marginLeft: isMobile ? 0 : (sidebarOpen ? `${SIDEBAR_W}px` : 0),
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Filter toggle - Sticky */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 90, pl: 0.5, pt: 0.5, pb: 0, width: 'fit-content' }}>
          <IconButton onClick={() => setSidebarOpen(o => !o)}
            sx={{ bgcolor: PC, color: 'white', borderRadius: 2, boxShadow: 3, '&:hover': { bgcolor: '#a0365a' } }}>
            <FilterList />
          </IconButton>
        </Box>

        <Box sx={{ px: { xs: 1.5, sm: 3 }, py: 2, pb: 8 }}>
          <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto' }}>

            {!searched ? (
              <>
                {/* 1. Tìm kiếm gần đây */}
                {recentSearches.length > 0 && (
                  <>
                    <Box sx={{ mb: 2, pl: { xs: 1, sm: 6 } }}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('booking_page.recent_searches')}</Typography>
                      <Typography variant="body2" color="text.secondary">{t('booking_page.recent_searches_sub')}</Typography>
                    </Box>
                    <Box sx={{ position: 'relative', mb: 5, px: { xs: 3, sm: 6 } }}>
                      {recentCanLeft && (
                        <IconButton onClick={() => scrollRecent(-1)} sx={{
                          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                          zIndex: 2, bgcolor: 'white', boxShadow: 3,
                          '&:hover': { bgcolor: PC_LIGHT }
                        }}>
                          <ChevronLeft sx={{ color: PC }} />
                        </IconButton>
                      )}

                        <Box ref={recentScrollRef} sx={{
                          display: 'flex', gap: 2, overflowX: 'auto', pb: 1,
                          justifyContent: 'flex-start',
                          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                          scrollSnapType: { xs: 'x mandatory', md: 'none' }
                        }}>
                        {recentSearches.map((s, i) => (
                          <Card key={i} onClick={() => handleRecentSearchClick(s)} sx={{
                            cursor: 'pointer', borderRadius: 3, flexShrink: 0,
                            width: { xs: '200px', sm: 'calc((100% - 48px) / 4)' }, p: 2,
                            scrollSnapAlign: { xs: 'start', md: 'none' }, scrollSnapStop: { xs: 'always', md: 'normal' }, boxShadow: 1,
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
                              {(() => {
                                const key = getDestinationKey(s.destination)
                                return key
                                  ? t(`destinations.${key}.name`)
                                  : (s.destination || t('booking_page.anywhere'))
                              })()}
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

                      {recentCanRight && (
                        <IconButton onClick={() => scrollRecent(1)} sx={{
                          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                          zIndex: 2, bgcolor: 'white', boxShadow: 3,
                          '&:hover': { bgcolor: PC_LIGHT }
                        }}>
                          <ChevronRight sx={{ color: PC }} />
                        </IconButton>
                      )}
                    </Box>
                  </>
                )}

                {/* 2. Điểm đến phổ biến */}
                <Box sx={{ mb: 2, pl: { xs: 1, sm: 6 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('destinations.title')}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('destinations.subtitle')}</Typography>
                </Box>
                <Box sx={{ position: 'relative', mb: 5, px: { xs: 3, sm: 6 } }}>
                  {destCanLeft && (
                    <IconButton onClick={() => scrollDest(-1)} sx={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 2, bgcolor: 'white', boxShadow: 3,
                      '&:hover': { bgcolor: PC_LIGHT }
                    }}>
                      <ChevronLeft sx={{ color: PC }} />
                    </IconButton>
                  )}

                  {/* Scroll container */}
                  <Box ref={destScrollRef} sx={{
                    display: 'flex', gap: 2.5, overflowX: 'auto', pb: 1,
                    justifyContent: 'flex-start',
                    scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                    scrollSnapType: { xs: 'x mandatory', md: 'none' }
                  }}>
                    {DESTINATIONS.map((d, i) => (
                      <Card key={d.key} onClick={() => selectDest(i)} sx={{
                        cursor: 'pointer', borderRadius: 3, flexShrink: 0,
                        width: { xs: '220px', sm: 'calc((100% - 60px) / 4)' }, height: { xs: 160, sm: 216 },
                        position: 'relative', overflow: 'hidden',
                        scrollSnapAlign: { xs: 'start', md: 'none' },
                        scrollSnapStop: { xs: 'always', md: 'normal' },
                        border: destIdx === i ? `3px solid ${PC}` : '3px solid transparent',
                        transition: 'all 0.2s',
                        boxShadow: destIdx === i ? `0 0 0 3px ${PC}44` : 1
                      }}>
                        {/* Ảnh tràn kín */}
                        <img
                          src={d.img}
                          alt={d.province}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {/* Gradient overlay */}
                        <Box sx={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)'
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

                  {destCanRight && (
                    <IconButton onClick={() => scrollDest(1)} sx={{
                      position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 2, bgcolor: 'white', boxShadow: 3,
                      '&:hover': { bgcolor: PC_LIGHT }
                    }}>
                      <ChevronRight sx={{ color: PC }} />
                    </IconButton>
                  )}
                </Box>


                <OffersSection
                  membership={membership}
                  lang={currentLang}
                  onOpenMembership={() => navigate('/membership')}
                />


                {/* 3. Tìm kiếm theo loại phòng */}
                <Box sx={{ mb: 2, pl: { xs: 1, sm: 6 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('booking_page.room_type')}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('booking_page.room_type_sub')}</Typography>
                </Box>
                <Box sx={{ position: 'relative', mb: 5, px: { xs: 3, sm: 6 } }}>
                  {typeCanLeft && (
                    <IconButton onClick={() => scrollTypes(-1)} sx={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 2, bgcolor: 'white', boxShadow: 3,
                      '&:hover': { bgcolor: PC_LIGHT }
                    }}>
                      <ChevronLeft sx={{ color: PC }} />
                    </IconButton>
                  )}

                    <Box ref={typeScrollRef} sx={{
                    display: 'flex', gap: 2, overflowX: 'auto', pb: 1,
                    justifyContent: 'flex-start',
                    scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                    scrollSnapType: { xs: 'x mandatory', md: 'none' }
                  }}>
                    {ROOM_TYPES.map((type) => (
                      <Card key={type.key} onClick={() => handleTypeClick(type.key)} sx={{
                        cursor: 'pointer', borderRadius: 4, flexShrink: 0,
                        width: { xs: '200px', sm: 'calc((100% - 48px) / 4)' }, height: { xs: 140, sm: 180 },
                        position: 'relative', overflow: 'hidden',
                        scrollSnapAlign: { xs: 'start', md: 'none' },
                        boxShadow: 1,
                        border: roomTypes.includes(type.key) ? `3px solid ${PC}` : '3px solid transparent',
                        transition: 'all 0.2s'
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

                  {typeCanRight && (
                    <IconButton onClick={() => scrollTypes(1)} sx={{
                      position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 2, bgcolor: 'white', boxShadow: 3,
                      '&:hover': { bgcolor: PC_LIGHT }
                    }}>
                      <ChevronRight sx={{ color: PC }} />
                    </IconButton>
                  )}
                </Box>

                {/* 4. Phòng nổi bật */}
                <Box sx={{ mb: 2, pl: { xs: 1, sm: 6 } }}>
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
                        '&:hover': {
                          bgcolor: 'primary.dark',
                          color: 'primary.contrastTextHover'
                        },
                        '&:active': {
                          bgcolor: 'primary.dark',
                          color: 'primary.contrastTextHzover'
                        }
                      }}
                    >
                      {t('common.see_all')}
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ position: 'relative', mb: 4, px: { xs: 3, sm: 6 } }}>
                  {roomCanLeft && (
                    <IconButton onClick={() => scrollRooms(-1)} sx={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 2, bgcolor: 'white', boxShadow: 3,
                      '&:hover': { bgcolor: PC_LIGHT }
                    }}>
                      <ChevronLeft sx={{ color: PC }} />
                    </IconButton>
                  )}

                  <Box ref={roomScrollRef} sx={{
                    display: 'flex', gap: 2, overflowX: 'auto', pb: 2, pt: 1,
                    justifyContent: 'flex-start',
                    scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                    scrollSnapType: { xs: 'x mandatory', md: 'none' }
                  }}>
                        {(loading || sectionsLoading) ? (
                          [...Array(4)].map((_, i) => (
                            <Box key={i} sx={{ width: { xs: '240px', sm: 'calc((100% - 48px) / 4)' }, flexShrink: 0 }}>
                              <RoomCardSkeleton />
                            </Box>
                          ))
                        ) : (
                          featuredRooms.length === 0 ? (
                            <Box sx={{ width: '100%', py: 6, textAlign: 'center' }}>
                              <Alert severity="info" sx={{ borderRadius: 3, display: 'inline-flex', px: 4 }}>
                                {t('booking_page.no_featured_rooms')}
                              </Alert>
                            </Box>
                          ) : (
                            featuredRooms.map(r => (
                              <Box key={r.id || r.roomId} sx={{ width: { xs: '240px', sm: 'calc((100% - 48px) / 4)' }, flexShrink: 0, scrollSnapAlign: { xs: 'start', md: 'none' }, scrollSnapStop: { xs: 'always', md: 'normal' }, display: 'flex', alignItems: 'stretch' }}>
                                <RoomCard room={r} isMock={rooms.length === 0} showBookButton={false} onOpenDetail={openDetail} />
                              </Box>
                            ))
                          )
                        )}
                  </Box>

                  {roomCanRight && (
                    <IconButton onClick={() => scrollRooms(1)} sx={{
                      position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 2, bgcolor: 'white', boxShadow: 3,
                      '&:hover': { bgcolor: PC_LIGHT }
                    }}>
                      <ChevronRight sx={{ color: PC }} />
                    </IconButton>
                  )}
                </Box>


                {/* 5. Phòng được đánh giá cao nhất */}
                <>
                  <Box sx={{ mb: 2, pl: { xs: 1, sm: 6 } }}>
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
                          '&:hover': {
                            bgcolor: 'primary.dark',
                            color: 'primary.contrastTextHover'
                          },
                          '&:active': {
                            bgcolor: 'primary.dark',
                            color: 'primary.contrastTextHover'
                          }
                        }}
                      >
                        {t('common.see_all')}
                      </Button>
                    </Box>
                  </Box>
                  <Box sx={{ position: 'relative', mb: 5, px: { xs: 3, sm: 6 } }}>
                    {topRatedCanLeft && (
                      <IconButton onClick={() => scrollTopRated(-1)} sx={{
                        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                        zIndex: 2, bgcolor: 'white', boxShadow: 3,
                        '&:hover': { bgcolor: PC_LIGHT }
                      }}>
                        <ChevronLeft sx={{ color: PC }} />
                      </IconButton>
                    )}

                    <Box ref={topRatedScrollRef} sx={{
                      display: 'flex', gap: 2, overflowX: 'auto', pb: 2, pt: 1,
                      justifyContent: 'flex-start',
                      scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                      scrollSnapType: { xs: 'x mandatory', md: 'none' }
                    }}>
                      {(sectionsLoading) ? (
                        [...Array(4)].map((_, i) => (
                          <Box key={i} sx={{ width: { xs: '240px', sm: 'calc((100% - 48px) / 4)' }, flexShrink: 0 }}>
                            <RoomCardSkeleton />
                          </Box>
                        ))
                      ) : topRatedRooms.length === 0 ? (
                        <Box sx={{ width: '100%', py: 6, textAlign: 'center' }}>
                          <Alert severity="info" sx={{ borderRadius: 3, display: 'inline-flex', px: 4 }}>
                            {t('booking_page.no_top_rated')}
                          </Alert>
                        </Box>
                      ) : (
                        topRatedRooms.map(r => (
                          <Box key={r.id || r.roomId} sx={{ width: { xs: '240px', sm: 'calc((100% - 48px) / 4)' }, flexShrink: 0, scrollSnapAlign: { xs: 'start', md: 'none' }, scrollSnapStop: { xs: 'always', md: 'normal' }, display: 'flex', alignItems: 'stretch' }}>
                            <RoomCard room={r} isMock={rooms.length === 0} showBookButton={false} onOpenDetail={openDetail} />
                          </Box>
                        ))
                      )}
                    </Box>

                    {topRatedCanRight && (
                      <IconButton onClick={() => scrollTopRated(1)} sx={{
                        position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                        zIndex: 2, bgcolor: 'white', boxShadow: 3,
                        '&:hover': { bgcolor: PC_LIGHT }
                      }}>
                        <ChevronRight sx={{ color: PC }} />
                      </IconButton>
                    )}
                  </Box>
                </>


                {/* 6. Phòng có giá ưu đãi nhất */}
                {budgetRooms.length > 0 && (
                  <>
                    <Box sx={{ mb: 2, pl: { xs: 1, sm: 6 } }}>
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
                            '&:hover': {
                              bgcolor: 'primary.dark',
                              color: 'primary.contrastTextHover'
                            },
                            '&:active': {
                              bgcolor: 'primary.dark',
                              color: 'primary.contrastTextHover'
                            }
                          }}
                        >
                          {t('common.see_all') || 'Xem tất cả'}
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ position: 'relative', mb: 5, px: { xs: 3, sm: 6 } }}>
                      {budgetCanLeft && (
                        <IconButton onClick={() => scrollBudget(-1)} sx={{
                          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                          zIndex: 2, bgcolor: 'white', boxShadow: 3,
                          '&:hover': { bgcolor: PC_LIGHT }
                        }}>
                          <ChevronLeft sx={{ color: PC }} />
                        </IconButton>
                      )}

                      <Box ref={budgetScrollRef} sx={{
                        display: 'flex', gap: 2, overflowX: 'auto', pb: 2, pt: 1,
                        justifyContent: 'flex-start',
                        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                        scrollSnapType: { xs: 'x mandatory', md: 'none' }
                      }}>
                            {(sectionsLoading) ? (
                              [...Array(4)].map((_, i) => (
                                  <Box key={i} sx={{ width: { xs: '240px', sm: 'calc((100% - 48px) / 4)' }, flexShrink: 0 }}>
                                    <RoomCardSkeleton />
                                  </Box>
                                ))
                            ) : budgetRooms.length === 0 ? (
                              <Box sx={{ width: '100%', py: 6, textAlign: 'center' }}>
                                <Alert severity="info" sx={{ borderRadius: 3, display: 'inline-flex', px: 4 }}>
                                  {t('booking_page.no_budget_rooms')}
                                </Alert>
                              </Box>
                            ) : (
                              budgetRooms.map(r => (
                                <Box key={r.id || r.roomId} sx={{ width: { xs: '240px', sm: 'calc((100% - 48px) / 4)' }, flexShrink: 0, scrollSnapAlign: { xs: 'start', md: 'none' }, scrollSnapStop: { xs: 'always', md: 'normal' }, display: 'flex', alignItems: 'stretch' }}>
                                  <RoomCard room={r} isMock={rooms.length === 0} showBookButton={false} onOpenDetail={openDetail} />
                                </Box>
                              ))
                            )}
                      </Box>

                      {budgetCanRight && (
                        <IconButton onClick={() => scrollBudget(1)} sx={{
                          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                          zIndex: 2, bgcolor: 'white', boxShadow: 3,
                          '&:hover': { bgcolor: PC_LIGHT }
                        }}>
                          <ChevronRight sx={{ color: PC }} />
                        </IconButton>
                      )}
                    </Box>
                  </>
                )}

                {/* 7. Ưu đãi cho cuối tuần */}
                <Box sx={{ mb: 2, pl: { xs: 1, sm: 6 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('booking_page.weekend_deals_title')}</Typography>
                  <Typography variant="body2" color="text.secondary">{weekendSubtitle}</Typography>
                </Box>
                <Box sx={{ position: 'relative', mb: 8, px: { xs: 3, sm: 6 } }}>
                  {weekendCanLeft && (
                  <IconButton onClick={() => scrollWeekend(-1)} sx={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    zIndex: 2, bgcolor: 'white', boxShadow: 3,
                    '&:hover': { bgcolor: PC_LIGHT }
                  }}>
                    <ChevronLeft sx={{ color: PC }} />
                  </IconButton>
                  )}

                  <Box ref={weekendScrollRef} sx={{
                    display: 'flex', gap: 2, overflowX: 'auto', pb: 2, pt: 1,
                    justifyContent: 'flex-start',
                    scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                    scrollSnapType: { xs: 'x mandatory', md: 'none' }
                  }}>
                    {(sectionsLoading) ? (
                      [...Array(4)].map((_, i) => (
                        <Box key={i} sx={{ width: { xs: '240px', sm: 'calc((100% - 48px) / 4)' }, flexShrink: 0 }}>
                          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3, mb: 1 }} />
                          <Skeleton width="70%" height={22} sx={{ mb: 0.5 }} />
                          <Skeleton width="50%" height={18} />
                        </Box>
                      ))
                    ) : weekendDeals.length === 0 ? (
                      <Box sx={{ width: '100%', py: 6, textAlign: 'center' }}>
                        <Alert severity="info" sx={{ borderRadius: 3, display: 'inline-flex', px: 4 }}>
                          {t('booking_page.no_weekend_deals') || 'Không có ưu đãi cuối tuần.'}
                        </Alert>
                      </Box>
                    ) : (
                      weekendDeals.map(r => (
                        <Box key={r.id || r.roomId} sx={{ width: { xs: '240px', sm: 'calc((100% - 48px) / 4)' }, flexShrink: 0, scrollSnapAlign: { xs: 'start', md: 'none' }, scrollSnapStop: { xs: 'always', md: 'normal' }, display: 'flex', alignItems: 'stretch' }}>
                          <RoomCard room={r} isMock={r._isMockCard} oldPrice={r.oldPrice} showBookButton={false} onOpenDetail={openDetail} />
                        </Box>
                      ))
                    )}
                  </Box>

                  {weekendCanRight && (
                  <IconButton onClick={() => scrollWeekend(1)} sx={{
                    position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                    zIndex: 2, bgcolor: 'white', boxShadow: 3,
                    '&:hover': { bgcolor: PC_LIGHT }
                  }}>
                    <ChevronRight sx={{ color: PC }} />
                  </IconButton>
                  )}
                </Box>
              </>
            ) : (
              /* Search Results View */
              <Box sx={{ px: { xs: 3, sm: 6 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: PC, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
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
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        color: 'primary.contrastTextHover',
                        borderColor: 'primary.dark'
                      },
                      '&:active': {
                        bgcolor: 'primary.dark',
                        color: 'primary.contrastTextHover',
                        borderColor: 'primary.dark'
                      }
                    }}
                  >
                    {t('booking_page.back_to_home')}
                  </Button>
                </Box>
                {params.hotelName && (
                  <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }} onClose={() => {
                    const newParams = { ...params, hotelName: '' }
                    setParams(newParams)
                    handleSearch(newParams)
                  }}>
                    Khách sạn: <strong>{params.hotelName}</strong>
                  </Alert>
                )}
                {rooms.length > 0 && (
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: '#fff',
                    border: '1px solid #f3d1dc',
                    gap: 2,
                    flexWrap: 'wrap'
                  }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: PC }}>
                        {t('booking_page.selected_rooms_count', { count: selectedRoomsForOrder.length })}
                        {selectedRoomsForOrder.length > 0 ? `: ${selectedRoomsForOrder.map(r => `#${r.roomNumber}`).join(', ')}` : ''}
                      </Typography>
                      {searched && selectedRoomsForOrder.length > 0 && (() => {
                        const { remainingAdults, remainingChildren } = getRemainingGuests()
                        return (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontWeight: 700, 
                              color: isTotalCapacityInsufficient ? 'error.main' : 'success.main',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              flexWrap: 'wrap'
                            }}
                          >
                            {t('booking_page.selected_capacity_status', { selected: selectedCapacity + Math.min(Number(params.children || 0), numSelectedRooms), required: totalGuests })}
                            {isTotalCapacityInsufficient 
                              ? ` (${t('booking_page.insufficient_capacity')})` 
                              : ` (${t('common.success')})`}
                            {isTotalCapacityInsufficient && (
                              <span style={{ marginLeft: '8px', color: '#d32f2f' }}>
                                ({t('booking_page.missing_guests_short', { adults: remainingAdults, children: remainingChildren })})
                              </span>
                            )}
                          </Typography>
                        )
                      })()}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      {isTotalCapacityInsufficient && (() => {
                        const { remainingAdults, remainingChildren } = getRemainingGuests()
                        return (
                          <Typography variant="caption" color="error.main" sx={{ fontWeight: 600, maxWidth: 280, textAlign: { xs: 'left', sm: 'right' } }}>
                            {t('booking_page.remaining_guests_needed', { adults: remainingAdults, children: remainingChildren })}
                          </Typography>
                        )
                      })()}
                      <Button
                        variant="contained"
                        disabled={selectedRoomsForOrder.length === 0 || isTotalCapacityInsufficient}
                        onClick={openSelectedRoomsBooking}
                        sx={{ borderRadius: 2, bgcolor: PC, color: '#fff', fontWeight: 800 }}
                      >
                        {t('booking_page.book_selected_rooms')}
                      </Button>
                    </Box>
                  </Box>
                )}

                {loading ? (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                        {[...Array(4)].map((_, i) => (
                      <RoomCardSkeleton key={i} />
                    ))}
                  </Box>
                ) : rooms.length > 0 ? (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                    {rooms.map(r => (
                      <RoomCard
                        key={r.id || r.roomId}
                        room={r}
                        isMock={false}
                        showBookButton
                        selectable
                        selected={selectedRoomsForOrder.some(item => (item.roomId || item.id) === (r.roomId || r.id))}
                        onToggleSelect={toggleRoomSelection}
                        onOpenDetail={openDetail}
                        onOpenBooking={openBooking}
                        params={params}
                        searched={searched}
                        isUnavailable={occupiedRoomIds.includes((r.roomId || r.id))}
                      />
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <Card sx={{ width: '100%', p: 0, display: 'flex', gap: 2, alignItems: 'stretch', mx: 'auto', borderRadius: 3, boxShadow: 1, overflow: 'hidden', minHeight: { xs: 'calc(120px + 3cm)', sm: 'calc(160px + 3cm)' } }}>
                      <Box component="img" src={imgNoResults} alt={t('booking_page.no_rooms_found')}
                        sx={{ width: { xs: 120, sm: 280 }, height: '100%', objectFit: 'cover', flexShrink: 0, display: 'block' }}
                      />
                      <Box sx={{ textAlign: 'left', flex: 1, p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: PC }}>
                          {t('booking_page.no_rooms_found') || 'Không tìm thấy phòng phù hợp'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {t('booking_page.no_rooms_found_sub') || 'Rất tiếc, hiện tại không có phòng nào phù hợp với nhu cầu của bạn.'}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {t('booking_page.try_suggestions') || 'Bạn có thể thử thay đổi ngày lưu trú hoặc điều chỉnh bộ lọc để tìm thêm lựa chọn.'}
                        </Typography>
                      </Box>
                    </Card>
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
        isCapacityInsufficient={selectedRoom && searched && !selectedIsMock && selectedRoom.maxGuests < (Number(params.adults || 0) + Math.max(0, Number(params.children || 0) - 1))}
        totalGuests={totalGuests}
      />

      {/* Booking Dialog */}
      <BookingDialog
        open={dialogOpen}
        room={selectedRoom}
        rooms={selectedRoomsForOrder.length > 0 ? selectedRoomsForOrder : []}
        isMock={selectedIsMock}
        searchParams={params}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleBookingSuccess}
      />

      {/* Login Prompt Modal */}
      <LoginPromptModal
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
      />

      {/* Success Popover (Anchored to Nav Menu) */}
      <Popover
        open={snackbar.open}
        anchorEl={document.getElementById('nav-menu-button')}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        PaperProps={{
          sx: {
            mt: 1.5,
            p: 2,
            bgcolor: '#edf7ed',
            color: '#1e4620',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '1px solid #c3e6cb',
            overflow: 'visible',
            maxWidth: 300,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid #edf7ed',
              zIndex: 1
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: -9.5,
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderBottom: '9px solid #c3e6cb',
              zIndex: 0
            }
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
            {snackbar.msg}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setSnackbar(s => ({ ...s, open: false }))}
            sx={{ ml: 1, color: '#1e4620', opacity: 0.7 }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Popover>

    </Box>
  )
}

// Skeleton that matches RoomCard layout (image + content)
const RoomCardSkeleton = () => (
  <Box>
    <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3, mb: 1 }} />
    <Skeleton width="60%" height={18} sx={{ mb: 0.5 }} />
    <Skeleton width="40%" height={16} />
  </Box>
)

export default BookingPage
