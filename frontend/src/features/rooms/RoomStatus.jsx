import React from 'react'

const STATUS_CONFIG = {
  AVAILABLE: {
    label: 'Còn trống',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200'
  },
  OCCUPIED: {
    label: 'Đang thuê',
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    border: 'border-rose-200'
  },
  MAINTENANCE: {
    label: 'Bảo trì',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200'
  },
  CLEANING: {
    label: 'Đang dọn',
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    dot: 'bg-sky-500',
    border: 'border-sky-200'
  },
  RESERVED: {
    label: 'Đã đặt',
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    dot: 'bg-violet-500',
    border: 'border-violet-200'
  }
}

const RoomStatus = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Không rõ',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
    border: 'border-gray-200'
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  }

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  }

  return (
    <span className={`inline-flex items-center rounded-full font-semibold border
      ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}>
      <span className={`rounded-full shrink-0 ${config.dot} ${dotSizes[size]}`} />
      {config.label}
    </span>
  )
}

export default RoomStatus
export { STATUS_CONFIG }
