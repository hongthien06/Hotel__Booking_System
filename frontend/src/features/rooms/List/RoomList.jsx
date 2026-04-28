import React, { useState, useEffect, useMemo } from 'react'
import {
  Box, Typography, Grid, TextField, Button, MenuItem,
  IconButton, Skeleton, Alert, Snackbar, Tooltip,
  InputAdornment, Paper
} from '@mui/material'
import {
  Add, Search, Refresh, KingBed
} from '@mui/icons-material'
import { getRoomsApi } from '../../../shared/api/roomApi'
import axiosInstance from '../../../shared/api/axiosInstance'
import { useAuth } from '../../../shared/hooks/useAuth'
import RoomCard from './RoomCard'
import RoomDetail from '../Details/RoomDetail'
import RoomForm from '../Form/RoomForm'
import RoomStatus, { STATUS_CONFIG } from '../RoomStatus'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'
const createRoomApi = (data) => axiosInstance.post(`${BASE_URL}/rooms`, data).then(r => r.data)
const updateRoomApi = (id, data) => axiosInstance.put(`${BASE_URL}/rooms/${id}`, data).then(r => r.data)

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <Box sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
    <Skeleton variant="rectangular" height={140} />
    <Box sx={{ p: 2 }}>
      <Skeleton width="50%" height={24} />
      <Skeleton width="75%" height={16} sx={{ mt: 0.5 }} />
      <Skeleton width="40%" height={16} sx={{ mt: 1 }} />
    </Box>
  </Box>
)

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd, canEdit }) => (
  <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 10 }}>
    <Typography sx={{ fontSize: 56, mb: 2, opacity: 0.25 }}>🏨</Typography>
    <Typography variant="h6" color="text.secondary" fontWeight={600} mb={0.5}>
      Không tìm thấy phòng nào
    </Typography>
    <Typography variant="body2" color="text.disabled" mb={3}>
      Thử thay đổi bộ lọc hoặc thêm phòng mới
    </Typography>
    {canEdit && (
      <Button
        variant="contained" color="secondary" startIcon={<Add />}
        onClick={onAdd}
        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
      >
        Thêm phòng đầu tiên
      </Button>
    )}
  </Box>
)

// ─── Main ─────────────────────────────────────────────────────────────────────
const RoomList = () => {
  const { user } = useAuth()
  const canEdit = user?.roles?.some(r =>
    ['ADMIN', 'ROLE_ADMIN', 'MANAGER', 'ROLE_MANAGER'].includes(
      typeof r === 'string' ? r : (r?.roleName || r?.authority || '')
    )
  )

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterType, setFilterType] = useState('ALL')
  const [sortBy, setSortBy] = useState('roomNumber')

  const [selectedRoom, setSelectedRoom] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editRoom, setEditRoom] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' })

  const showToast = (msg, severity = 'success') =>
    setToast({ open: true, msg, severity })

  // Fetch
  const fetchRooms = async () => {
    setLoading(true); setError('')
    try {
      const data = await getRoomsApi()
      setRooms(Array.isArray(data) ? data : (data?.content || []))
    } catch {
      setError('Không thể tải danh sách phòng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { fetchRooms() }, [])

  // Derived
  const roomTypes = useMemo(() =>
    [...new Set(rooms.map(r => r.roomType || (typeof r.type === 'string' ? r.type : (r.type?.typeName || r.type?.name || ''))).filter(Boolean))],
    [rooms]
  )

  const summary = useMemo(() =>
    Object.keys(STATUS_CONFIG).reduce((acc, s) => ({
      ...acc, [s]: rooms.filter(r => r.status === s).length
    }), { ALL: rooms.length }),
    [rooms]
  )

  const filtered = useMemo(() => {
    let list = [...rooms]
    if (search.trim()) {
      const getType = r => r.roomType || (typeof r.type === 'string' ? r.type : (r.type?.typeName || r.type?.name || ''))
      const q = search.toLowerCase()
      list = list.filter(r =>
        String(r.roomNumber).toLowerCase().includes(q) ||
        getType(r).toLowerCase().includes(q)
      )
    }
    const getType = r => r.roomType || (typeof r.type === 'string' ? r.type : (r.type?.typeName || r.type?.name || ''))
    if (filterStatus !== 'ALL') list = list.filter(r => r.status === filterStatus)
    if (filterType !== 'ALL') list = list.filter(r => getType(r) === filterType)
    list.sort((a, b) => {
      if (sortBy === 'price') return (a.pricePerNight || 0) - (b.pricePerNight || 0)
      if (sortBy === 'priceDesc') return (b.pricePerNight || 0) - (a.pricePerNight || 0)
      return String(a.roomNumber).localeCompare(String(b.roomNumber), undefined, { numeric: true })
    })
    return list
  }, [rooms, search, filterStatus, filterType, sortBy])

  // Handlers
  const handleCardClick = (room) => { setSelectedRoom(room); setDetailOpen(true) }
  const handleEditClick = (room) => { setEditRoom(room); setFormOpen(true); setDetailOpen(false) }
  const handleAddClick = () => { setEditRoom(null); setFormOpen(true) }

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
      showToast(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.', 'error')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100%' }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="secondary.main"
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <KingBed fontSize="large" /> Quản lý phòng
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {rooms.length} phòng trong hệ thống
          </Typography>
        </Box>
        {canEdit && (
          <Button
            variant="contained" color="secondary"
            startIcon={<Add />}
            onClick={handleAddClick}
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, px: 3, py: 1.25 }}
          >
            Thêm phòng
          </Button>
        )}
      </Box>

      {/* Status summary pills */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {/* All pill */}
        <Box
          onClick={() => setFilterStatus('ALL')}
          sx={{
            px: 2, py: 0.75, borderRadius: '999px', cursor: 'pointer',
            border: '1px solid',
            fontWeight: 700, fontSize: '0.75rem',
            transition: 'all 0.15s',
            ...(filterStatus === 'ALL'
              ? { bgcolor: 'secondary.main', color: 'white', borderColor: 'secondary.main' }
              : {
                bgcolor: 'background.paper', color: 'text.secondary', borderColor: 'divider',
                '&:hover': { borderColor: 'secondary.main' }
              }
            )
          }}
        >
          Tất cả ({summary.ALL})
        </Box>

        {Object.entries(STATUS_CONFIG).map(([key, cfg]) =>
          summary[key] > 0 ? (
            <Box
              key={key}
              onClick={() => setFilterStatus(filterStatus === key ? 'ALL' : key)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.75,
                px: 2, py: 0.75, borderRadius: '999px', cursor: 'pointer',
                border: '1px solid',
                fontWeight: 700, fontSize: '0.75rem',
                transition: 'all 0.15s',
                ...(filterStatus === key
                  ? { bgcolor: cfg.bg, color: cfg.color, borderColor: cfg.border, transform: 'scale(1.05)' }
                  : {
                    bgcolor: 'background.paper', color: 'text.secondary', borderColor: 'divider',
                    '&:hover': { borderColor: cfg.border }
                  }
                )
              }}
            >
              {cfg.label} ({summary[key]})
            </Box>
          ) : null
        )}
      </Box>

      {/* Filter bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Tìm theo số phòng, loại phòng..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 18, color: 'text.disabled' }} />
              </InputAdornment>
            ),
            sx: { borderRadius: 3 }
          }}
        />

        {roomTypes.length > 0 && (
          <TextField
            select size="small" value={filterType}
            onChange={e => setFilterType(e.target.value)}
            sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          >
            <MenuItem value="ALL">Tất cả loại phòng</MenuItem>
            {roomTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
        )}

        <TextField
          select size="small" value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        >
          <MenuItem value="roomNumber">Sắp xếp: Số phòng</MenuItem>
          <MenuItem value="price">Giá: Thấp → Cao</MenuItem>
          <MenuItem value="priceDesc">Giá: Cao → Thấp</MenuItem>
        </TextField>

        <Tooltip title="Tải lại">
          <IconButton
            onClick={fetchRooms}
            sx={{
              border: '1px solid', borderColor: 'divider', borderRadius: 3,
              '&:hover': { borderColor: 'secondary.main', color: 'secondary.main' }
            }}
          >
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}
          action={<Button size="small" onClick={fetchRooms} color="error" fontWeight={700}>Thử lại</Button>}>
          {error}
        </Alert>
      )}

      {/* Grid */}
      <Grid container spacing={2.5}>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={i} sx={{ display: 'flex' }}>
              <SkeletonCard />
            </Grid>
          ))
          : filtered.length === 0
            ? <EmptyState onAdd={handleAddClick} canEdit={canEdit} />
            : filtered.map(room => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={room.roomId || room.id || room.roomNumber} sx={{ display: 'flex' }}>
                <RoomCard
                  room={room}
                  onClick={handleCardClick}
                  onEdit={handleEditClick}
                  canEdit={canEdit}
                />
              </Grid>
            ))
        }
      </Grid>

      {/* Detail Drawer */}
      <RoomDetail
        room={selectedRoom}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={handleEditClick}
        canEdit={canEdit}
      />

      {/* Form Dialog */}
      <RoomForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        editRoom={editRoom}
        loading={formLoading}
      />

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast(t => ({ ...t, open: false }))}
          sx={{ borderRadius: 3, fontWeight: 600 }}
          elevation={6}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default RoomList
