import React, { useState, useEffect, useMemo } from 'react'
import { getRoomsApi, getRoomByIdApi } from '../../../shared/api/roomApi'
import { useAuth } from '../../../shared/hooks/useAuth'
import RoomCard from './RoomCard'
import RoomDetail from '../Details/RoomDetail'
import RoomForm from '../Form/RoomForm'
import RoomStatus, { STATUS_CONFIG } from '../RoomStatus'
import axiosInstance from '../../../shared/api/axiosInstance'

// API helpers (thêm/sửa — mở rộng roomApi nếu cần)
const createRoomApi = (data) =>
  axiosInstance.post('/rooms', data).then(r => r.data)
const updateRoomApi = (id, data) =>
  axiosInstance.put(`/rooms/${id}`, data).then(r => r.data)

// ─── Skeleton Card ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-36 bg-gray-100" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </div>
  </div>
)

// ─── Empty state ─────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd, canEdit }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
    <span className="text-6xl mb-4 opacity-30">🏨</span>
    <h3 className="text-gray-500 font-semibold text-lg mb-1">Không tìm thấy phòng nào</h3>
    <p className="text-gray-400 text-sm mb-6">Thử thay đổi bộ lọc hoặc thêm phòng mới</p>
    {canEdit && (
      <button
        onClick={onAdd}
        className="px-6 py-2.5 bg-[#9a1c48] text-white rounded-2xl font-bold text-sm hover:bg-[#c02860] transition-colors"
      >
        ➕ Thêm phòng đầu tiên
      </button>
    )}
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
const RoomList = () => {
  const { user } = useAuth()
  const canEdit = user?.roles?.some(r =>
    ['ADMIN', 'ROLE_ADMIN', 'MANAGER', 'ROLE_MANAGER'].includes(typeof r === 'string' ? r : r?.roleName)
  )

  // State
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterType, setFilterType] = useState('ALL')
  const [sortBy, setSortBy] = useState('roomNumber')

  // Detail modal
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Form modal
  const [formOpen, setFormOpen] = useState(false)
  const [editRoom, setEditRoom] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState(null)

  // Fetch
  const fetchRooms = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getRoomsApi()
      setRooms(Array.isArray(data) ? data : data?.content || [])
    } catch {
      setError('Không thể tải danh sách phòng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRooms() }, [])

  // Derived values
  const roomTypes = useMemo(() => {
    const types = [...new Set(rooms.map(r => r.roomType || r.type).filter(Boolean))]
    return types
  }, [rooms])

  const filtered = useMemo(() => {
    let list = [...rooms]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        String(r.roomNumber).toLowerCase().includes(q) ||
        (r.roomType || r.type || '').toLowerCase().includes(q)
      )
    }
    if (filterStatus !== 'ALL') list = list.filter(r => r.status === filterStatus)
    if (filterType !== 'ALL') list = list.filter(r => (r.roomType || r.type) === filterType)

    list.sort((a, b) => {
      if (sortBy === 'price') return (a.pricePerNight || 0) - (b.pricePerNight || 0)
      if (sortBy === 'priceDesc') return (b.pricePerNight || 0) - (a.pricePerNight || 0)
      return String(a.roomNumber).localeCompare(String(b.roomNumber), undefined, { numeric: true })
    })

    return list
  }, [rooms, search, filterStatus, filterType, sortBy])

  // Summary counts
  const summary = useMemo(() =>
    Object.keys(STATUS_CONFIG).reduce((acc, s) => ({
      ...acc, [s]: rooms.filter(r => r.status === s).length
    }), { ALL: rooms.length }),
    [rooms]
  )

  // Handlers
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCardClick = (room) => {
    setSelectedRoom(room)
    setDetailOpen(true)
  }

  const handleEditClick = (room) => {
    setEditRoom(room)
    setFormOpen(true)
    setDetailOpen(false)
  }

  const handleAddClick = () => {
    setEditRoom(null)
    setFormOpen(true)
  }

  const handleFormSubmit = async (payload) => {
    setFormLoading(true)
    try {
      if (editRoom) {
        const updated = await updateRoomApi(editRoom.roomId || editRoom.id, payload)
        setRooms(prev => prev.map(r =>
          (r.roomId || r.id) === (editRoom.roomId || editRoom.id) ? updated : r
        ))
        showToast(`Đã cập nhật phòng #${updated.roomNumber}`)
      } else {
        const created = await createRoomApi(payload)
        setRooms(prev => [...prev, created])
        showToast(`Đã tạo phòng #${created.roomNumber}`)
      }
      setFormOpen(false)
    } catch (err) {
      showToast(
        err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.',
        'error'
      )
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-[#ccebff] px-6 py-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl shadow-lg text-white text-sm font-semibold
          transition-all ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}
          style={{ animation: 'popIn 0.2s ease-out' }}
        >
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý phòng</h1>
          <p className="text-gray-400 text-sm mt-0.5">{rooms.length} phòng trong hệ thống</p>
        </div>
        {canEdit && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#9a1c48] hover:bg-[#c02860]
              text-white rounded-2xl font-bold text-sm transition-colors shadow-md"
          >
            ➕ Thêm phòng
          </button>
        )}
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all
            ${filterStatus === 'ALL'
              ? 'bg-[#9a1c48] text-white border-[#9a1c48]'
              : 'bg-white text-gray-600 border-gray-200 hover:border-[#9a1c48]'
            }`}
        >
          Tất cả ({summary.ALL})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          summary[key] > 0 && (
            <button
              key={key}
              onClick={() => setFilterStatus(filterStatus === key ? 'ALL' : key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all
                ${filterStatus === key
                  ? `${cfg.bg} ${cfg.text} ${cfg.border} scale-105`
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
            >
              {cfg.label} ({summary[key]})
            </button>
          )
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm
              outline-none focus:border-[#b0305f] focus:ring-2 focus:ring-[#ffc7db]/40 transition-all"
            placeholder="Tìm theo số phòng, loại phòng..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Type filter */}
        {roomTypes.length > 0 && (
          <select
            className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-600
              outline-none focus:border-[#b0305f] transition-all"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="ALL">Tất cả loại phòng</option>
            {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}

        {/* Sort */}
        <select
          className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-600
            outline-none focus:border-[#b0305f] transition-all"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="roomNumber">Sắp xếp: Số phòng</option>
          <option value="price">Giá: Thấp → Cao</option>
          <option value="priceDesc">Giá: Cao → Thấp</option>
        </select>

        {/* Refresh */}
        <button
          onClick={fetchRooms}
          className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-500
            hover:border-[#9a1c48] hover:text-[#9a1c48] transition-all text-sm"
          title="Tải lại"
        >
          🔄
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium">
          ⚠️ {error}
          <button onClick={fetchRooms} className="ml-3 underline font-bold">Thử lại</button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.length === 0
            ? <EmptyState onAdd={handleAddClick} canEdit={canEdit} />
            : filtered.map(room => (
                <RoomCard
                  key={room.roomId || room.id || room.roomNumber}
                  room={room}
                  onClick={handleCardClick}
                  onEdit={handleEditClick}
                  canEdit={canEdit}
                />
              ))
        }
      </div>

      {/* Detail Drawer */}
      <RoomDetail
        room={selectedRoom}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={handleEditClick}
        canEdit={canEdit}
      />

      {/* Form Modal */}
      <RoomForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        editRoom={editRoom}
        loading={formLoading}
      />

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.92) translateY(-6px); opacity: 0; }
          to   { transform: scale(1)    translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default RoomList
