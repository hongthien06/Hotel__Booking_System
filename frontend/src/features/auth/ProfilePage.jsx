import React, { useState, useEffect } from 'react'
import { 
  Box, Typography, Paper, TextField, Button, Avatar, 
  Grid, Divider, Alert, CircularProgress, Chip 
} from '@mui/material'
import { Person, Phone, Email, Shield, Save } from '@mui/icons-material'
import { getMyProfileApi, updateMyProfileApi } from '../../shared/api/userApi'

const ProfilePage = () => {
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({ fullName: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', content: '' })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await getMyProfileApi()
      setProfile(data)
      setFormData({ fullName: data.fullName, phone: data.phone || '' })
    } catch (err) {
      setMessage({ type: 'error', content: 'Không thể tải thông tin cá nhân.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', content: '' })
    try {
      const updated = await updateMyProfileApi(formData)
      setProfile(updated)
      setMessage({ type: 'success', content: 'Cập nhật thông tin thành công!' })
    } catch (err) {
      setMessage({ type: 'error', content: 'Có lỗi xảy ra khi cập nhật.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress color="secondary" />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: 'secondary.main' }}>
        Trang cá nhân
      </Typography>

      <Grid container spacing={4}>
        {/* Cột trái: Thông tin tổng quan */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 4, 
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 2, 
                bgcolor: 'secondary.main',
                fontSize: '3rem',
                boxShadow: '0 8px 24px rgba(231, 78, 134, 0.2)'
              }}
            >
              {profile?.fullName?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{profile?.fullName}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{profile?.email}</Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
              {profile?.roles?.map(role => (
                <Chip 
                  key={role} 
                  label={role} 
                  size="small" 
                  color="secondary" 
                  variant="outlined" 
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Cột phải: Form chỉnh sửa */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ 
            p: 4, 
            borderRadius: 4, 
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
              <Person color="secondary" /> Thông tin cơ bản
            </Typography>

            {message.content && (
              <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }}>
                {message.content}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'text.disabled' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile?.email}
                    disabled
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.disabled' }} />
                    }}
                    helperText="Email không thể thay đổi"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.disabled' }} />
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="secondary"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  sx={{ 
                    px: 4, 
                    py: 1.2, 
                    borderRadius: 2,
                    fontWeight: 'bold',
                    textTransform: 'none'
                  }}
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </Box>
            </form>
          </Paper>

          {/* Card bảo mật (Mở rộng sau) */}
          <Paper elevation={0} sx={{ 
            p: 4, 
            mt: 3,
            borderRadius: 4, 
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Shield color="secondary" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Bảo mật tài khoản</Typography>
                <Typography variant="body2" color="text.secondary">Thay đổi mật khẩu định kỳ để bảo vệ tài khoản</Typography>
              </Box>
            </Box>
            <Button variant="outlined" color="secondary" sx={{ borderRadius: 2, fontWeight: 700 }}>
              Đổi mật khẩu
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ProfilePage
