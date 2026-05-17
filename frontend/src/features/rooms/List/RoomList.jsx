import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box, Typography, Grid, TextField, Button, MenuItem,
  IconButton, Skeleton, Alert, Snackbar, Tooltip,
  InputAdornment, Paper, Dialog
} from '@mui/material'
import {
  Add, Search, Refresh, KingBed, Layers, Close
} from '@mui/icons-material'
import { getRoomsApi } from '../../../shared/api/roomApi'
import axiosInstance from '../../../shared/api/axiosInstance'
import { useAuth } from '../../../shared/hooks/useAuth'
import RoomCard from './RoomCard'
import RoomDetail from '../Details/RoomDetail'
import RoomForm from '../Form/RoomForm'
import RoomStatus, { STATUS_CONFIG } from '../RoomStatus'
import BookingDialog from '../../bookings/components/BookingDialog'
import LoginPromptModal from '../../../shared/components/modals/LoginPromptModal'
import { useNavigate } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'
const createRoomApi = (data) => axiosInstance.post(`${BASE_URL}/rooms`, data).then(r => r.data)
const updateRoomApi = (id, data) => axiosInstance.put(`${BASE_URL}/rooms/${id}`, data).then(r => r.data)
const deleteRoomApi = (id) => axiosInstance.delete(`${BASE_URL}/rooms/${id}`).then(r => r.data)

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
const EmptyState = ({ onAdd, canEdit }) => {
  const { t } = useTranslation()
  return (
    <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 10 }}>
      <Typography sx={{ fontSize: 56, mb: 2, opacity: 0.25 }}>🏨</Typography>
      <Typography variant="h6" color="text.secondary" fontWeight={600} mb={0.5}>
        {t('rooms.no_rooms_found')}
      </Typography>
      <Typography variant="body2" color="text.disabled" mb={3}>
        {t('rooms.try_changing_filter')}
      </Typography>
      {canEdit && (
        <Button
          variant="contained" startIcon={<Add />}
          onClick={onAdd}
          sx={{ 
            borderRadius: 3, textTransform: 'none', fontWeight: 700,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': { bgcolor: 'primary.dark', color: '#fff' },
            '&:active': { bgcolor: 'primary.dark', color: '#fff' }
          }}
        >
          {t('rooms.add_first_room')}
        </Button>
      )}
    </Box>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const defaultSearchParams = {
  checkIn: new Date().toISOString().split('T')[0],
  checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  adults: 2,
  children: 0
}

const RoomList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
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
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editRoom, setEditRoom] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' })
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, roomId: null, roomNumber: '' })
  const [openAmenityModal, setOpenAmenityModal] = useState(false)
  const [amenities, setAmenities] = useState([])
  const [newAmenity, setNewAmenity] = useState({ amenityName: '', description: '', iconClass: 'star' })

  const showToast = (msg, severity = 'success') =>
    setToast({ open: true, msg, severity })

  // Fetch
  const fetchAmenities = async () => {
    try {
      const res = await axiosInstance.get(`${BASE_URL}/amenities`)
      setAmenities(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchRooms = async () => {
    setLoading(true); setError('')
    try {
      const data = await getRoomsApi()
      setRooms(Array.isArray(data) ? data : (data?.content || []))
    } catch {
      setError(t('rooms.fetch_error'))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { fetchRooms() }, [])
  
  useEffect(() => {
    if (openAmenityModal) fetchAmenities()
  }, [openAmenityModal])

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
      const getType = r => r.typeName || r.roomType || (typeof r.type === 'string' ? r.type : (r.type?.typeName || r.type?.name || ''))
      const q = search.toLowerCase()
      list = list.filter(r => {
        const bedsStr = r.beds ? r.beds.map(b => `${b.quantity} ${b.bedType} ${b.bedSize || ''}`).join(' ') : '';
        return String(r.roomNumber).toLowerCase().includes(q) ||
          getType(r).toLowerCase().includes(q) ||
          (r.hotelName && r.hotelName.toLowerCase().includes(q)) ||
          (r.province && r.province.toLowerCase().includes(q)) ||
          (r.district && r.district.toLowerCase().includes(q)) ||
          (r.address && r.address.toLowerCase().includes(q)) ||
          (r.status && r.status.toLowerCase().includes(q)) ||
          (r.maxGuests && String(r.maxGuests).includes(q)) ||
          bedsStr.toLowerCase().includes(q) ||
          (r.pricePerNight && String(r.pricePerNight).includes(q));
      })
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

  const handleBookClick = (room) => {
    if (!isAuthenticated) {
      setLoginPromptOpen(true)
      return
    }
    setSelectedRoom(room)
    setBookingDialogOpen(true)
    setDetailOpen(false)
  }

  const handleFormSubmit = async (payload) => {
    setFormLoading(true)
    try {
      if (editRoom) {
        const updated = await updateRoomApi(editRoom.roomId || editRoom.id, payload)
        setRooms(prev => prev.map(r =>
          (r.roomId || r.id) === (editRoom.roomId || editRoom.id) ? updated : r
        ))
        showToast(t('rooms.update_success', 'Đã cập nhật phòng #{{roomNumber}}', { roomNumber: updated.roomNumber }))
      } else {
        const created = await createRoomApi(payload)
        setRooms(prev => [...prev, created])
        showToast(t('rooms.create_success', 'Đã tạo phòng #{{roomNumber}}', { roomNumber: created.roomNumber }))
      }
      setFormOpen(false)
    } catch (err) {
      showToast(err?.response?.data?.message || t('rooms.generic_error', 'Có lỗi xảy ra, vui lòng thử lại.'), 'error')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteClick = (room) => {
    setDeleteConfirm({ open: true, roomId: room.roomId || room.id, roomNumber: room.roomNumber })
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteRoomApi(deleteConfirm.roomId)
      setRooms(prev => prev.filter(r => (r.roomId || r.id) !== deleteConfirm.roomId))
      showToast(t('rooms.delete_success', 'Đã xóa phòng #{{roomNumber}}', { roomNumber: deleteConfirm.roomNumber }))
    } catch (err) {
      showToast(err?.response?.data?.message || t('rooms.delete_error', 'Không thể xóa phòng này.'), 'error')
    } finally {
      setDeleteConfirm({ open: false, roomId: null, roomNumber: '' })
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100%' }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="primary.contrastText"
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <KingBed fontSize="large" /> {t('rooms.management')}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {rooms.length} {t('rooms.rooms_in_system')}
          </Typography>
        </Box>
        {canEdit && (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="contained"
              startIcon={<Layers />}
              onClick={() => setOpenAmenityModal(true)}
              sx={{ 
                borderRadius: 3, textTransform: 'none', fontWeight: 700, px: 3, py: 1.25,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark', color: 'primary.contrastTextHover' },
                '&:active': { bgcolor: 'primary.dark', color: 'primary.contrastTextHover' }
              }}
            >
              {t('rooms.manage_amenities')}
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddClick}
              sx={{ 
                borderRadius: 3, textTransform: 'none', fontWeight: 700, px: 3, py: 1.25,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark', color: 'primary.contrastTextHover' },
                '&:active': { bgcolor: 'primary.dark', color: 'primary.contrastTextHover' }
              }}
            >
              {t('rooms.add_room')}
            </Button>
          </Box>
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
              ? { bgcolor: 'primary.contrastText', color: 'white', borderColor: 'primary.contrastText' }
              : {
                bgcolor: 'background.paper', color: 'text.secondary', borderColor: 'divider',
                '&:hover': { borderColor: 'primary.contrastText' }
              }
            )
          }}
        >
          {t('common.all')} ({summary.ALL})
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
              {t(cfg.label)} ({summary[key]})
            </Box>
          ) : null
        )}
      </Box>

      {/* Filter bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          placeholder={t('rooms.search_placeholder')}
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
            <MenuItem value="ALL">{t('rooms.all_types')}</MenuItem>
            {roomTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
        )}

        <TextField
          select size="small" value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        >
          <MenuItem value="roomNumber">{t('rooms.sort_room_number')}</MenuItem>
          <MenuItem value="price">{t('rooms.sort_price_asc')}</MenuItem>
          <MenuItem value="priceDesc">{t('rooms.sort_price_desc')}</MenuItem>
        </TextField>

        <Tooltip title={t('common.reload')}>
          <IconButton
            onClick={fetchRooms}
            sx={{
              border: '1px solid', borderColor: 'divider', borderRadius: 3,
              '&:hover': { borderColor: 'primary.contrastText', color: 'primary.contrastText' }
            }}
          >
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}
          action={
            <Button 
              size="small" 
              onClick={fetchRooms} 
              variant="contained"
              sx={{
                fontWeight: 700,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark', color: '#fff' },
                '&:active': { bgcolor: 'primary.dark', color: '#fff' }
              }}
            >
              {t('common.retry')}
            </Button>
          }>
          {error}
        </Alert>
      )}

      {/* Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 2.5
      }}>
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', minWidth: 0, '& > *': { width: '100%' } }}>
              <SkeletonCard />
            </Box>
          ))
          : filtered.length === 0
            ? <EmptyState onAdd={handleAddClick} canEdit={canEdit} />
            : filtered.map(room => (
              <Box key={room.roomId || room.id || room.roomNumber} sx={{ display: 'flex', minWidth: 0, '& > *': { width: '100%' } }}>
                <RoomCard
                  room={room}
                  onClick={handleCardClick}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  canEdit={canEdit}
                />
              </Box>
            ))
        }
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, roomId: null, roomNumber: '' })}
        PaperProps={{ sx: { borderRadius: 4, px: 1, py: 1 } }}
      >
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={800} color="error.main" mb={1}>
            {t('rooms.delete_confirm_title', 'Xác nhận xóa phòng')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('rooms.delete_confirm_desc', 'Bạn có chắc chắn muốn xóa phòng')} <strong>#{deleteConfirm.roomNumber}</strong>?
            {" "}{t('rooms.delete_confirm_warning', 'Thao tác này sẽ chuyển trạng thái phòng thành INACTIVE.')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setDeleteConfirm({ open: false, roomId: null, roomNumber: '' })}
            sx={{ 
              borderRadius: 3, fontWeight: 700,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'primary.dark', color: 'primary.contrastTextHover' },
              '&:active': { bgcolor: 'primary.dark', color: 'primary.contrastTextHover' }
            }}
          >
            {t('rooms.cancel', 'HỦY BỎ')}
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleConfirmDelete}
            sx={{ 
              borderRadius: 3, fontWeight: 700,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'primary.dark', color: 'primary.contrastTextHover' },
              '&:active': { bgcolor: 'primary.dark', color: 'primary.contrastTextHover' }
            }}
          >
            {t('rooms.delete_room_btn', 'XÓA PHÒNG')}
          </Button>
        </Box>
      </Dialog>

      {/* Amenity Management Modal */}
      <Dialog open={openAmenityModal} onClose={() => setOpenAmenityModal(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={800} mb={2}>
            {t('rooms.amenity_management_title')}
          </Typography>
          
          {/* Form thêm mới */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField
              size="small"
              label={t('rooms.amenity_name')}
              value={newAmenity.amenityName}
              onChange={e => setNewAmenity(p => ({ ...p, amenityName: e.target.value }))}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label={t('rooms.amenity_description')}
              value={newAmenity.description}
              onChange={e => setNewAmenity(p => ({ ...p, description: e.target.value }))}
              sx={{ flex: 2 }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={async () => {
                if (!newAmenity.amenityName.trim()) return;
                try {
                  await axiosInstance.post(`${BASE_URL}/amenities`, newAmenity);
                  setNewAmenity({ amenityName: '', description: '', iconClass: 'star' });
                  fetchAmenities();
                  showToast(t('rooms.amenity_add_success'), 'success');
                } catch (err) {
                  showToast(t('rooms.amenity_add_error'), 'error');
                }
              }}
              sx={{ 
                borderRadius: 3, textTransform: 'none', fontWeight: 700, px: 3, py: 1.25,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark', color: 'primary.contrastTextHover' },
                '&:active': { bgcolor: 'primary.dark', color: 'primary.contrastTextHover' }
              }}
            >
              {t('rooms.amenity_add')}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 300, overflow: 'auto' }}>
            {amenities.map(a => (
              <Box key={a.amenityId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, border: '1px solid #eee', borderRadius: 2 }}>
                <Box>
                  <Typography variant="body1" fontWeight={600}>{a.amenityName}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">{a.description}</Typography>
                </Box>
                <Box>
                  <IconButton size="small" color="error" onClick={async () => {
                    if (window.confirm(t('rooms.amenity_delete_confirm'))) {
                      try {
                        await axiosInstance.delete(`${BASE_URL}/amenities/${a.amenityId}`);
                        fetchAmenities();
                        showToast(t('rooms.amenity_delete_success'), 'success');
                      } catch (err) {
                        showToast(t('rooms.amenity_delete_error'), 'error');
                      }
                    }
                  }}>
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button
              onClick={() => setOpenAmenityModal(false)}
              variant="contained"
              sx={{ 
                borderRadius: 3, textTransform: 'none', fontWeight: 700, px: 3, py: 1.25,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark', color: 'primary.contrastTextHover' },
                '&:active': { bgcolor: 'primary.dark', color: 'primary.contrastTextHover' }
              }}
            >
              {t('common.close')}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Detail Drawer */}
      <RoomDetail
        room={selectedRoom}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={handleEditClick}
        onBook={handleBookClick}
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

      {/* Booking Dialog */}
      <BookingDialog
        open={bookingDialogOpen}
        room={selectedRoom}
        isMock={false}
        searchParams={defaultSearchParams}
        onClose={() => setBookingDialogOpen(false)}
        onSuccess={() => {
          setBookingDialogOpen(false)
          showToast(t('booking_page.booking_success', 'Đặt phòng thành công!'), 'success')
        }}
      />

      {/* Login Prompt Modal */}
      <LoginPromptModal
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        onLogin={() => {
          setLoginPromptOpen(false)
          navigate('/login')
        }}
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
