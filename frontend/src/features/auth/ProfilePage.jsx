import React, { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, Paper, TextField, Button, Avatar,
  Grid, Divider, Alert, CircularProgress, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, InputAdornment, Tooltip
} from '@mui/material'
import {
  Person, Phone, Email, Shield, Save, Lock,
  Visibility, VisibilityOff, CameraAlt, VerifiedUser, Info
} from '@mui/icons-material'
import { getMyProfileApi, updateMyProfileApi } from '../../shared/api/userApi'
import { changePasswordApi } from '../../shared/api/authApi'

const ProfilePage = () => {
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({ fullName: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', content: '' })
  const fileInputRef = useRef(null)

  const [openPwDialog, setOpenPwDialog] = useState(false)
  const [pwData, setPwData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await getMyProfileApi()
      setProfile(data)
      setFormData({
        fullName: data.fullName || '',
        phone: data.phone || ''
      })
    } catch (err) {
      console.error('Fetch profile error:', err)
      setMessage({ type: 'error', content: 'Không thể tải thông tin cá nhân.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAvatarClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setMessage({ type: 'success', content: 'Đã chọn ảnh mới. Tính năng lưu ảnh sẽ sớm hoàn thiện!' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', content: '' })
    try {
      const updated = await updateMyProfileApi(formData)
      setProfile(updated)
      setFormData({
        fullName: updated.fullName || '',
        phone: updated.phone || ''
      })
      setMessage({ type: 'success', content: 'Cập nhật thông tin thành công!' })
    } catch (err) {
      console.error('Update profile error:', err)
      setMessage({ type: 'error', content: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.' })
    } finally {
      setSaving(false)
    }
  }

  const handlePwChange = (e) => {
    setPwData({ ...pwData, [e.target.name]: e.target.value })
  }

  const handlePwSubmit = async () => {
    setPwError('')
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwError('Mật khẩu xác nhận không khớp!')
      return
    }
    if (pwData.newPassword.length < 6) {
      setPwError('Mật khẩu mới phải có ít nhất 6 ký tự!')
      return
    }

    setPwLoading(true)
    try {
      await changePasswordApi(pwData.oldPassword, pwData.newPassword)
      setOpenPwDialog(false)
      setPwData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setMessage({ type: 'success', content: 'Đổi mật khẩu thành công!' })
    } catch (err) {
      setPwError(err.response?.data?.message || 'Mật khẩu cũ không chính xác.')
    } finally {
      setPwLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: '#9a1c48' }} />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', my: 4, mb: 10, p: { xs: 2, md: 2 }, bgcolor: '#fff9fa' }}>
      <Box sx={{ mb: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
        <VerifiedUser sx={{ color: '#9a1c48', fontSize: 50 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#9a1c48' }}>
            Quản lý tài khoản
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cập nhật thông tin cá nhân và quản lý bảo mật
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {/* KHUNG TRÁI: AVATAR (Đã tăng width lên md=3.5) */}
        <Grid item xs={14} sm={5} md={5}>
          <Paper elevation={0} sx={{
            p: 4, textAlign: 'center', borderRadius: 6, bgcolor: 'white',
            border: '1px solid #ffdae5',
            boxShadow: '0 10px 20px rgba(154, 28, 72, 0.05)'
          }}>
            <Box sx={{ position: 'relative', width: 160, height: 160, mx: 'auto', mb: 3 }}>
              <Avatar
                sx={{
                  width: 160, height: 160,
                  bgcolor: '#9a1c48', fontSize: '4rem', fontWeight: 700,
                  boxShadow: '0 15px 35px rgba(154, 28, 72, 0.2)',
                  border: '6px solid #fce4ec'
                }}
              >
                {profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Tooltip title="Thay đổi ảnh đại diện">
                <IconButton
                  onClick={handleAvatarClick}
                  sx={{
                    position: 'absolute', bottom: 8, right: 8,
                    bgcolor: 'white', color: '#9a1c48',
                    '&:hover': { bgcolor: '#fce4ec', transform: 'scale(1.1)' },
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    p: 1.5
                  }}
                >
                  <CameraAlt fontSize="small" />
                </IconButton>
              </Tooltip>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#333', mb: 1 }}>{profile?.fullName}</Typography>
            <Chip
              label={profile?.roles?.[0]?.replace('ROLE_', '') || 'User'}
              sx={{ fontWeight: 700, bgcolor: 'rgba(154, 28, 72, 0.1)', color: '#9a1c48' }}
            />
            <Divider sx={{ my: 3, borderColor: '#ffdae5' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Thành viên từ: {new Date().getFullYear()}
            </Typography>
          </Paper>
        </Grid>

        {/* KHUNG PHẢI: THÔNG TIN CHI TIẾT (Đã tăng width lên md=8.5) */}
        <Grid item xs={12} sm={7} md={9}>
          <Paper elevation={0} sx={{
            p: { xs: 3, md: 5 }, borderRadius: 6, bgcolor: 'white',
            border: '1px solid #ffdae5',
            boxShadow: '0 10px 20px rgba(154, 28, 72, 0.05)'
          }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Info sx={{ color: '#9a1c48' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#333' }}>
                Thông tin cá nhân
              </Typography>
            </Box>

            {message.content && <Alert severity={message.type} sx={{ mb: 4, borderRadius: 3 }}>{message.content}</Alert>}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth label="Họ và tên" name="fullName"
                  value={formData.fullName || ''} onChange={handleChange} required
                  InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#9a1c48' }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#e3f2fd' } }}
                />
                <TextField
                  fullWidth label="Email" value={profile?.email || ''} disabled
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#9a1c48' }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#e3f2fd' } }}
                />
                <TextField
                  fullWidth label="Số điện thoại" name="phone"
                  value={formData.phone || ''} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ color: '#9a1c48' }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#e3f2fd' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Button
                  type="submit" variant="contained" disabled={saving}
                  sx={{
                    px: 8, py: 1.5, borderRadius: 3, fontWeight: 800,
                    bgcolor: '#fce4ec', color: '#9a1c48',
                    '&:hover': { bgcolor: '#9a1c48', color: 'white' }
                  }}
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </Box>
            </form>

            <Divider sx={{ my: 5, borderColor: '#ffdae5', borderStyle: 'dashed' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Shield sx={{ color: '#9a1c48' }} />
                <Typography sx={{ fontWeight: 700 }}>Bảo mật tài khoản</Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => setOpenPwDialog(true)}
                sx={{
                  borderRadius: 3, fontWeight: 800,
                  bgcolor: '#fce4ec', color: '#9a1c48',
                  '&:hover': { bgcolor: '#9a1c48', color: 'white' },
                  px: 4
                }}
              >
                Đổi mật khẩu
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openPwDialog} onClose={() => setOpenPwDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>Thay đổi mật khẩu</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {pwError && <Alert severity="error">{pwError}</Alert>}
            <TextField
              fullWidth label="Mật khẩu cũ" name="oldPassword" type={showPw.old ? 'text' : 'password'}
              value={pwData.oldPassword} onChange={handlePwChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw({ ...showPw, old: !showPw.old })}>
                      {showPw.old ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth label="Mật khẩu mới" name="newPassword" type={showPw.new ? 'text' : 'password'}
              value={pwData.newPassword} onChange={handlePwChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw({ ...showPw, new: !showPw.new })}>
                      {showPw.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth label="Xác nhận mật khẩu" name="confirmPassword" type={showPw.confirm ? 'text' : 'password'}
              value={pwData.confirmPassword} onChange={handlePwChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw({ ...showPw, confirm: !showPw.confirm })}>
                      {showPw.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setOpenPwDialog(false)}>Hủy</Button>
          <Button onClick={handlePwSubmit} variant="contained" disabled={pwLoading} sx={{ bgcolor: '#9a1c48', color: 'white' }}>
            {pwLoading ? <CircularProgress size={24} color="inherit" /> : 'Cập nhật ngay'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProfilePage
