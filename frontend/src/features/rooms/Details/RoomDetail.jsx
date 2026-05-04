import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, Box, Typography, Button,
  IconButton, Chip
} from '@mui/material'
import { Close, Edit, People, SquareFoot, KingBed, Layers, Bathtub, Business, LocationOn, ChevronLeft, ChevronRight } from '@mui/icons-material'
import RoomStatus from '../RoomStatus'

const InfoRow = ({ label, value, icon }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.25,
    borderBottom: '1px solid', borderColor: 'divider', '&:last-of-type': { border: 0 } }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon && React.cloneElement(icon, { sx: { fontSize: 16, color: 'text.secondary' } })}
      <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
    </Box>
    <Typography variant="body2" fontWeight={700} color="text.primary">{value}</Typography>
  </Box>
)

const RoomDetail = ({ room, open, onClose, onEdit, canEdit, onBook }) => {
  const { t, i18n } = useTranslation()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (open) setCurrentImageIndex(0)
  }, [open, room])

  const handlePrevImage = (e) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? room.imageUrls.length - 1 : prev - 1))
  }

  const handleNextImage = (e) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === room.imageUrls.length - 1 ? 0 : prev + 1))
  }

  if (!room) return null

  const amenities = room.amenities
    ? (typeof room.amenities === 'string'
        ? room.amenities.split(',').map(a => a.trim()).filter(Boolean)
        : room.amenities)
    : []

  const price = room.pricePerNight
    ? new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { 
        style: 'currency', 
        currency: i18n.language === 'vi' ? 'VND' : 'USD' 
      }).format(i18n.language === 'vi' ? room.pricePerNight : room.pricePerNight / 25000)
    : '—'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 5,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }
      }}
    >
      {/* Hero image */}
      <Box sx={{ position: 'relative', height: 210, flexShrink: 0, overflow: 'hidden',
        background: 'linear-gradient(135deg, #ffc7db 0%, #c02860 100%)' }}>
        {room.imageUrls && room.imageUrls.length > 0 ? (
          <>
            <Box
              component="img"
              src={room.imageUrls[currentImageIndex]}
              alt={`${t('booking_page.room')} ${room.roomNumber}`}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {room.imageUrls.length > 1 && (
              <>
                <IconButton onClick={handlePrevImage} size="small" sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.3)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' }, zIndex: 2 }}>
                  <ChevronLeft />
                </IconButton>
                <IconButton onClick={handleNextImage} size="small" sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.3)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' }, zIndex: 2 }}>
                  <ChevronRight />
                </IconButton>
                <Box sx={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 0.5, zIndex: 2 }}>
                  {room.imageUrls.map((_, idx) => (
                    <Box key={idx} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: idx === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)' }} />
                  ))}
                </Box>
              </>
            )}
          </>
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: 72, opacity: 0.25 }}>🏨</Typography>
          </Box>
        )}
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)' }} />

        <IconButton onClick={onClose} size="small" sx={{
          position: 'absolute', top: 12, right: 12,
          bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)',
          color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
        }}>
          <Close fontSize="small" />
        </IconButton>

        <Box sx={{ position: 'absolute', bottom: 16, left: 20, right: 20,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase', letterSpacing: 2, display: 'block', mb: 0.25 }}>
              {t('booking_page.room')}
            </Typography>
            <Typography variant="h4" fontWeight={900} color="white">
              #{room.roomNumber}
            </Typography>
          </Box>
          <RoomStatus status={room.status} size="lg" />
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
        {/* Title & price */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="text.primary">
              {t(room.typeName || room.roomType || room.type || 'Standard')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('rooms.floor')} {room.floor || '—'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" fontWeight={900} color="secondary.main" lineHeight={1.1}>
              {price}
            </Typography>
            <Typography variant="caption" color="text.disabled">{t('rooms.per_night')}</Typography>
          </Box>
        </Box>

        {/* Details */}
        <Box sx={{ bgcolor: 'background.default', borderRadius: 3, px: 2, py: 0.5, mb: 2.5 }}>
          <InfoRow label={t('room_detail.hotel')} value={room.hotelName || '—'} icon={<Business />} />
          <InfoRow label={t('room_detail.address')} value={room.address || '—'} icon={<LocationOn />} />
          <InfoRow label={t('room_detail.capacity')} value={`${room.capacity || '—'} ${t('rooms.guests')}`} icon={<People />} />
          <InfoRow label={t('room_detail.area')} value={room.area ? `${room.area} m²` : '—'} icon={<SquareFoot />} />
          <InfoRow label={t('room_detail.bed_type')} value={t(room.bedType) || '—'} icon={<KingBed />} />
          <InfoRow label={t('room_detail.bedrooms')} value={room.bedrooms || '1'} icon={<Layers />} />
          <InfoRow label={t('room_detail.bathrooms')} value={room.bathrooms || '1'} icon={<Bathtub />} />
        </Box>

        {/* Description */}
        {room.description && (
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
              {t('room_detail.description')}
            </Typography>
            <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
              {room.description}
            </Typography>
          </Box>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1.5 }}>
              {t('room_detail.amenities')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {amenities.map((item, i) => (
                <Chip
                  key={i}
                  label={item}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: 'primary.main',
                    color: 'secondary.main',
                    bgcolor: '#ffc7db18',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    borderRadius: 2,
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0, display: 'flex', gap: 2 }}>
        {canEdit ? (
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            startIcon={<Edit />}
            onClick={() => { onClose(); onEdit(room) }}
            sx={{ borderRadius: 4, py: 1.5, fontWeight: 800, textTransform: 'none', fontSize: '0.875rem',
              boxShadow: '0 8px 25px rgba(216,27,96,0.3)' }}
          >
            {t('room_detail.edit_room')}
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            onClick={() => { onClose(); onBook(room) }}
            sx={{ 
              borderRadius: 4, py: 1.5, fontWeight: 800, textTransform: 'none', fontSize: '0.875rem',
              bgcolor: '#9a1c48', '&:hover': { bgcolor: '#c02860' },
              boxShadow: '0 8px 25px rgba(216,27,96,0.3)'
            }}
          >
            {t('common.book_now')}
          </Button>
        )}
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ borderRadius: 4, py: 1.5, fontWeight: 800, textTransform: 'none', fontSize: '0.875rem', px: 3,
            border: '2px solid', '&:hover': { border: '2px solid' } }}
        >
          {t('common.cancel')}
        </Button>
      </Box>
    </Dialog>
  )
}

export default RoomDetail
