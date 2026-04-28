import React from 'react'
import {
  Card, CardContent, CardMedia, Box, Typography,
  IconButton, Tooltip, Skeleton
} from '@mui/material'
import { Edit, People, SquareFoot, KingBed } from '@mui/icons-material'
import RoomStatus from '../RoomStatus'

const MetaItem = ({ icon, text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    {React.cloneElement(icon, { sx: { fontSize: 13, color: 'text.secondary' } })}
    <Typography variant="caption" color="text.secondary" fontWeight={500}>{text}</Typography>
  </Box>
)

const RoomCard = ({ room, onClick, onEdit, canEdit }) => {
  const price = room.pricePerNight
    ? new Intl.NumberFormat('vi-VN').format(room.pricePerNight) + '₫'
    : '—'

  const amenities = room.amenities
    ? (typeof room.amenities === 'string'
        ? room.amenities.split(',').map(a => a.trim()).filter(Boolean)
        : room.amenities)
    : []

  return (
    <Card
      onClick={() => onClick(room)}
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(154,28,72,0.12)',
          borderColor: 'primary.main',
        }
      }}
    >
      {/* Image */}
      <Box sx={{ position: 'relative', height: 140, overflow: 'hidden' }}>
        {room.imageUrl ? (
          <CardMedia
            component="img"
            image={room.imageUrl}
            alt={`Phòng ${room.roomNumber}`}
            sx={{ height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.05)' } }}
          />
        ) : (
          <Box sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #ffc7db55 0%, #c0286033 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Typography sx={{ fontSize: 48, opacity: 0.25 }}>🏨</Typography>
          </Box>
        )}

        {/* Gradient overlay */}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)'
        }} />

        {/* Status badge */}
        <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
          <RoomStatus status={room.status} size="sm" />
        </Box>

        {/* Edit button */}
        {canEdit && (
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              onClick={e => { e.stopPropagation(); onEdit(room) }}
              sx={{
                position: 'absolute', top: 6, right: 6,
                bgcolor: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(4px)',
                opacity: 0,
                transition: 'opacity 0.2s',
                '.MuiCard-root:hover &': { opacity: 1 },
                '&:hover': { bgcolor: 'white', color: 'secondary.main' },
                width: 30, height: 30,
              }}
            >
              <Edit sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}

        {/* Floor */}
        {room.floor && (
          <Typography variant="caption" sx={{
            position: 'absolute', bottom: 8, right: 10,
            color: 'rgba(255,255,255,0.85)', fontWeight: 600
          }}>
            Tầng {room.floor}
          </Typography>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h6" fontWeight={900} lineHeight={1.2} display="block">
              #{room.roomNumber}
            </Typography>
            <Typography variant="caption" color="secondary.main" fontWeight={700} display="block">
              {room.hotelName || ''}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">
              {room.typeName || room.roomType || room.type || 'Standard'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1 }}>
            <Typography variant="subtitle2" fontWeight={900} color="secondary.main" lineHeight={1.2} display="block">
              {price}
            </Typography>
            <Typography variant="caption" color="text.disabled" display="block">/đêm</Typography>
          </Box>
        </Box>

        {/* Meta */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: amenities.length ? 1.5 : 0 }}>
          {room.capacity && <MetaItem icon={<People />} text={`${room.capacity} khách`} />}
          {room.area && <MetaItem icon={<SquareFoot />} text={`${room.area}m²`} />}
          {room.bedType && <MetaItem icon={<KingBed />} text={room.bedType} />}
        </Box>

        {/* Amenities */}
        {amenities.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {amenities.slice(0, 3).map((a, i) => (
              <Box key={i} sx={{
                px: 1, py: 0.25,
                bgcolor: 'background.default',
                border: '1px solid', borderColor: 'divider',
                borderRadius: 2,
                fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary'
              }}>
                {a}
              </Box>
            ))}
            {amenities.length > 3 && (
              <Typography variant="caption" color="text.disabled" sx={{ alignSelf: 'center' }}>
                +{amenities.length - 3}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default RoomCard
