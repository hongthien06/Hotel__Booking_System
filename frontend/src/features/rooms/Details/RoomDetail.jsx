import React from 'react'
import RoomStatus from '../RoomStatus'

const amenityIcons = {
  'WiFi': '📶', 'TV': '📺', 'Điều hòa': '❄️', 'Tủ lạnh': '🧊',
  'Bồn tắm': '🛁', 'Ban công': '🏙️', 'Két an toàn': '🔐',
  'Minibar': '🍷', 'Máy pha cà phê': '☕'
}

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500 font-medium">{label}</span>
    <span className="text-sm text-gray-800 font-semibold">{value}</span>
  </div>
)

const RoomDetail = ({ room, open, onClose, onEdit, canEdit }) => {
  if (!open || !room) return null

  const amenities = room.amenities
    ? (typeof room.amenities === 'string' ? room.amenities.split(',').map(a => a.trim()) : room.amenities)
    : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Drawer */}
      <div
        className="relative z-10 w-full max-w-lg h-full bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'slideIn 0.25s ease-out' }}
      >
        {/* Header image area */}
        <div className="relative h-52 bg-gradient-to-br from-[#ffc7db] to-[#c02860] flex-shrink-0 overflow-hidden">
          {room.imageUrl ? (
            <img
              src={room.imageUrl}
              alt={`Phòng ${room.roomNumber}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl opacity-30 select-none">🏨</span>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm
              hover:bg-white/40 transition-colors flex items-center justify-center text-white font-bold text-lg"
          >
            ✕
          </button>

          {/* Room number badge */}
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-0.5">Phòng</p>
              <h2 className="text-white text-3xl font-black">#{room.roomNumber}</h2>
            </div>
            <RoomStatus status={room.status} size="lg" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Room type & price */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{room.roomType || room.type || 'Standard'}</h3>
              <p className="text-gray-400 text-sm mt-0.5">Tầng {room.floor || '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-[#9a1c48]">
                {room.pricePerNight
                  ? new Intl.NumberFormat('vi-VN').format(room.pricePerNight) + '₫'
                  : '—'
                }
              </p>
              <p className="text-gray-400 text-xs">/ đêm</p>
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-50 rounded-2xl px-4 py-1 mb-5">
            <InfoRow label="Sức chứa" value={`${room.capacity || '—'} khách`} />
            <InfoRow label="Diện tích" value={room.area ? `${room.area} m²` : '—'} />
            <InfoRow label="Loại giường" value={room.bedType || '—'} />
            <InfoRow label="Số phòng ngủ" value={room.bedrooms || '1'} />
            <InfoRow label="Số phòng tắm" value={room.bathrooms || '1'} />
          </div>

          {/* Description */}
          {room.description && (
            <div className="mb-5">
              <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Mô tả</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{room.description}</p>
            </div>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Tiện nghi</h4>
              <div className="flex flex-wrap gap-2">
                {amenities.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ffc7db]/20
                      border border-[#ffc7db] rounded-xl text-xs font-semibold text-[#9a1c48]"
                  >
                    <span>{amenityIcons[item] || '✦'}</span>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {canEdit && (
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0">
            <button
              onClick={() => { onClose(); onEdit(room) }}
              className="w-full py-3 rounded-2xl bg-[#9a1c48] hover:bg-[#c02860] text-white
                font-bold text-sm transition-colors duration-200 tracking-wide"
            >
              ✏️ Chỉnh sửa phòng
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default RoomDetail
