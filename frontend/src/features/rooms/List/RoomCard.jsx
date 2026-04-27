import React from 'react'
import RoomStatus from '../RoomStatus'

const RoomCard = ({ room, onClick, onEdit, canEdit }) => {
  const price = room.pricePerNight
    ? new Intl.NumberFormat('vi-VN').format(room.pricePerNight)
    : '—'

  const amenities = room.amenities
    ? (typeof room.amenities === 'string'
        ? room.amenities.split(',').map(a => a.trim()).filter(Boolean)
        : room.amenities)
    : []

  return (
    <div
      onClick={() => onClick(room)}
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm
        hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Image */}
      <div className="h-36 bg-gradient-to-br from-[#ffc7db]/40 to-[#c02860]/20 relative overflow-hidden">
        {room.imageUrl ? (
          <img
            src={room.imageUrl}
            alt={`Phòng ${room.roomNumber}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-20 select-none">🏨</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <RoomStatus status={room.status} size="sm" />
        </div>

        {/* Edit button */}
        {canEdit && (
          <button
            onClick={e => { e.stopPropagation(); onEdit(room) }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm
              hover:bg-white text-gray-600 hover:text-[#9a1c48] transition-all
              flex items-center justify-center text-sm opacity-0 group-hover:opacity-100"
          >
            ✏️
          </button>
        )}

        {/* Floor tag */}
        {room.floor && (
          <div className="absolute bottom-2 right-3 text-white/80 text-xs font-medium">
            Tầng {room.floor}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-black text-gray-900 text-base">#{room.roomNumber}</h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {room.roomType || room.type || 'Standard'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-black text-[#9a1c48] text-sm">{price}₫</p>
            <p className="text-gray-300 text-xs">/đêm</p>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          {room.capacity && (
            <span className="flex items-center gap-1">
              <span>👥</span> {room.capacity} khách
            </span>
          )}
          {room.area && (
            <span className="flex items-center gap-1">
              <span>📐</span> {room.area}m²
            </span>
          )}
          {room.bedType && (
            <span className="flex items-center gap-1">
              <span>🛏️</span> {room.bedType}
            </span>
          )}
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {amenities.slice(0, 3).map((a, i) => (
              <span key={i} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-lg border border-gray-100">
                {a}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="text-xs text-gray-400 px-1">+{amenities.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomCard
