import React, { useState, useEffect } from 'react'
import RoomStatus, { STATUS_CONFIG } from '../RoomStatus'

const ROOM_TYPES = ['Standard', 'Deluxe', 'Superior', 'Suite', 'Family', 'Presidential']
const BED_TYPES = ['Single', 'Double', 'Queen', 'King', 'Twin', 'Bunk']

const InputField = ({ label, required, error, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
      {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
  </div>
)

const inputClass = `w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#e8f6ff]
  text-sm text-gray-800 font-medium outline-none transition-all duration-200
  focus:border-[#b0305f] focus:ring-2 focus:ring-[#ffc7db]/40
  placeholder:text-gray-300`

const RoomForm = ({ open, onClose, onSubmit, editRoom, loading }) => {
  const isEdit = !!editRoom

  const emptyForm = {
    roomNumber: '', roomType: 'Standard', floor: '',
    capacity: '', area: '', pricePerNight: '',
    bedType: 'Double', bedrooms: '1', bathrooms: '1',
    status: 'AVAILABLE', description: '', amenities: '', imageUrl: ''
  }

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      if (isEdit && editRoom) {
        setForm({
          roomNumber: editRoom.roomNumber || '',
          roomType: editRoom.roomType || editRoom.type || 'Standard',
          floor: editRoom.floor || '',
          capacity: editRoom.capacity || '',
          area: editRoom.area || '',
          pricePerNight: editRoom.pricePerNight || '',
          bedType: editRoom.bedType || 'Double',
          bedrooms: editRoom.bedrooms || '1',
          bathrooms: editRoom.bathrooms || '1',
          status: editRoom.status || 'AVAILABLE',
          description: editRoom.description || '',
          amenities: Array.isArray(editRoom.amenities)
            ? editRoom.amenities.join(', ')
            : (editRoom.amenities || ''),
          imageUrl: editRoom.imageUrl || ''
        })
      } else {
        setForm(emptyForm)
      }
      setErrors({})
    }
  }, [open, editRoom])

  const validate = () => {
    const e = {}
    if (!form.roomNumber.trim()) e.roomNumber = 'Số phòng không được để trống'
    if (!form.pricePerNight || isNaN(form.pricePerNight) || Number(form.pricePerNight) <= 0)
      e.pricePerNight = 'Giá phòng phải lớn hơn 0'
    if (!form.capacity || isNaN(form.capacity) || Number(form.capacity) <= 0)
      e.capacity = 'Sức chứa phải lớn hơn 0'
    return e
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    const payload = {
      ...form,
      floor: Number(form.floor) || null,
      capacity: Number(form.capacity),
      area: Number(form.area) || null,
      pricePerNight: Number(form.pricePerNight),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      amenities: form.amenities
        ? form.amenities.split(',').map(a => a.trim()).filter(Boolean)
        : []
    }
    onSubmit(payload)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl
          flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'popIn 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              {isEdit ? `Chỉnh sửa phòng #${editRoom?.roomNumber}` : 'Thêm phòng mới'}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {isEdit ? 'Cập nhật thông tin phòng' : 'Điền đầy đủ thông tin để tạo phòng mới'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors
              flex items-center justify-center text-gray-500 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">

          {/* Row 1: số phòng + loại phòng */}
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Số phòng" required error={errors.roomNumber}>
              <input
                className={inputClass}
                placeholder="VD: 101, A201..."
                value={form.roomNumber}
                onChange={e => handleChange('roomNumber', e.target.value)}
              />
            </InputField>
            <InputField label="Loại phòng">
              <select
                className={inputClass}
                value={form.roomType}
                onChange={e => handleChange('roomType', e.target.value)}
              >
                {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </InputField>
          </div>

          {/* Row 2: tầng + giá */}
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Tầng">
              <input
                className={inputClass}
                type="number" min="1" placeholder="VD: 3"
                value={form.floor}
                onChange={e => handleChange('floor', e.target.value)}
              />
            </InputField>
            <InputField label="Giá / đêm (₫)" required error={errors.pricePerNight}>
              <input
                className={inputClass}
                type="number" min="0" placeholder="VD: 800000"
                value={form.pricePerNight}
                onChange={e => handleChange('pricePerNight', e.target.value)}
              />
            </InputField>
          </div>

          {/* Row 3: sức chứa + diện tích */}
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Sức chứa (khách)" required error={errors.capacity}>
              <input
                className={inputClass}
                type="number" min="1" placeholder="VD: 2"
                value={form.capacity}
                onChange={e => handleChange('capacity', e.target.value)}
              />
            </InputField>
            <InputField label="Diện tích (m²)">
              <input
                className={inputClass}
                type="number" min="0" placeholder="VD: 35"
                value={form.area}
                onChange={e => handleChange('area', e.target.value)}
              />
            </InputField>
          </div>

          {/* Row 4: loại giường + phòng ngủ + phòng tắm */}
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Loại giường">
              <select
                className={inputClass}
                value={form.bedType}
                onChange={e => handleChange('bedType', e.target.value)}
              >
                {BED_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </InputField>
            <InputField label="Phòng ngủ">
              <input
                className={inputClass}
                type="number" min="1" max="10"
                value={form.bedrooms}
                onChange={e => handleChange('bedrooms', e.target.value)}
              />
            </InputField>
            <InputField label="Phòng tắm">
              <input
                className={inputClass}
                type="number" min="1" max="10"
                value={form.bathrooms}
                onChange={e => handleChange('bathrooms', e.target.value)}
              />
            </InputField>
          </div>

          {/* Trạng thái */}
          <InputField label="Trạng thái phòng">
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChange('status', key)}
                  className={`transition-all duration-150 rounded-full border-2 px-1 py-0.5
                    ${form.status === key
                      ? 'border-[#9a1c48] scale-105 shadow-sm'
                      : 'border-transparent hover:border-gray-200'
                    }`}
                >
                  <RoomStatus status={key} size="md" />
                </button>
              ))}
            </div>
          </InputField>

          {/* Tiện nghi */}
          <InputField label="Tiện nghi (cách nhau bằng dấu phẩy)">
            <input
              className={inputClass}
              placeholder="VD: WiFi, TV, Điều hòa, Tủ lạnh"
              value={form.amenities}
              onChange={e => handleChange('amenities', e.target.value)}
            />
          </InputField>

          {/* Ảnh */}
          <InputField label="URL ảnh phòng">
            <input
              className={inputClass}
              placeholder="https://..."
              value={form.imageUrl}
              onChange={e => handleChange('imageUrl', e.target.value)}
            />
          </InputField>

          {/* Mô tả */}
          <InputField label="Mô tả">
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Mô tả ngắn về phòng..."
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
            />
          </InputField>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600
              font-bold text-sm hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-[#9a1c48] hover:bg-[#c02860] text-white
              font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? '⏳ Đang lưu...'
              : isEdit ? '✅ Lưu thay đổi' : '➕ Tạo phòng'
            }
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.95) translateY(8px); opacity: 0; }
          to   { transform: scale(1)    translateY(0);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default RoomForm
