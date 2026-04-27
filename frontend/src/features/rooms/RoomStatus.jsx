import React from 'react'
import { Chip } from '@mui/material'
import { Circle } from '@mui/icons-material'

export const STATUS_CONFIG = {
  AVAILABLE:   { label: 'Còn trống', color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
  OCCUPIED:    { label: 'Đang thuê', color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
  MAINTENANCE: { label: 'Bảo trì',   color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  INACTIVE:    { label: 'Ngừng HĐ',  color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' },
}

const sizeMap = {
  sm: { fontSize: '0.65rem', height: 20, iconSize: 8 },
  md: { fontSize: '0.72rem', height: 24, iconSize: 9 },
  lg: { fontSize: '0.8rem',  height: 28, iconSize: 10 },
}

const RoomStatus = ({ status, size = 'md' }) => {
  const cfg = STATUS_CONFIG[status] || { label: status || 'Không rõ', color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' }
  const sz  = sizeMap[size] || sizeMap.md

  return (
    <Chip
      size="small"
      icon={
        <Circle sx={{ fontSize: `${sz.iconSize}px !important`, color: `${cfg.color} !important`, ml: '6px !important' }} />
      }
      label={cfg.label}
      sx={{
        height: sz.height,
        fontSize: sz.fontSize,
        fontWeight: 700,
        color: cfg.color,
        bgcolor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: '999px',
        '& .MuiChip-label': { px: 1 },
      }}
    />
  )
}

export default RoomStatus
