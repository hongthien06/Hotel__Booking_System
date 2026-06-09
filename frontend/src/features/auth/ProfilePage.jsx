/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
  Chip
} from '@mui/material'
import {
  CameraAlt,
  Email,
  EmojiEvents,
  Info,
  Person,
  Phone,
  Shield,
  VerifiedUser,
  Visibility,
  VisibilityOff,
  Star,
  Verified,
  Diamond,
  WorkspacePremium,
  ArrowForward,
  CardGiftcard
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { changePasswordApi } from '../../shared/api/authApi'
import { getMyMembershipApi } from '../../shared/api/membershipApi'
import { getMyProfileApi, updateMyProfileApi, uploadFileApi } from '../../shared/api/userApi'
import { getMembershipTierName, getMembershipTrackingPhone } from '../../shared/utils/membership'

const TIER_VISUAL = {
  FIRST_TIME: {
    gradient: 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 100%)',
    bg: '#fdf2f8', border: '#f9a8d4',
    icon: <Star sx={{ fontSize: 22 }} />, textColor: '#be185d'
  },
  SILVER: {
    gradient: 'linear-gradient(135deg, #cbd5e1 0%, #64748b 100%)',
    bg: '#f8fafc', border: '#cbd5e1',
    icon: <Verified sx={{ fontSize: 22 }} />, textColor: '#475569'
  },
  GOLD: {
    gradient: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 100%)',
    bg: '#fffbeb', border: '#fde68a',
    icon: <EmojiEvents sx={{ fontSize: 22 }} />, textColor: '#b45309'
  },
  DIAMOND: {
    gradient: 'linear-gradient(135deg, #a5f3fc 0%, #06b6d4 100%)',
    bg: '#ecfeff', border: '#a5f3fc',
    icon: <Diamond sx={{ fontSize: 22 }} />, textColor: '#0e7490'
  },
  VIP: {
    gradient: 'linear-gradient(135deg, #ddd6fe 0%, #7c3aed 100%)',
    bg: '#faf5ff', border: '#ddd6fe',
    icon: <WorkspacePremium sx={{ fontSize: 22 }} />, textColor: '#6d28d9'
  }
}
const defaultVisual = TIER_VISUAL.SILVER
const fmtVND = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)

const ProfilePage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({ fullName: '', phone: '', avatarUrl: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ type: '', content: '' })
  const [membership, setMembership] = useState(null)
  const [openPwDialog, setOpenPwDialog] = useState(false)
  const [pwData, setPwData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false })
  const fileInputRef = useRef(null)

  const membershipTierName = getMembershipTierName(membership?.tier, i18n.language)
  const membershipPhone = getMembershipTrackingPhone(membership)

  const fetchProfile = async () => {
    try {
      const data = await getMyProfileApi()
      setProfile(data)
      setFormData({
        fullName: data.fullName || '',
        phone: data.phone || '',
        avatarUrl: data.avatarUrl || ''
      })
    } catch (err) {
      console.error('Fetch profile error:', err)
      setMessage({ type: 'error', content: t('profile.fetch_error') })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    getMyMembershipApi().then(setMembership).catch(() => {})
  }, [])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      setMessage({ type: 'info', content: 'Đang tải ảnh lên...' })
      try {
        const res = await uploadFileApi(file)
        if (res?.url) {
          setFormData((prev) => ({ ...prev, avatarUrl: res.url }))
          setMessage({ type: 'success', content: 'Tải ảnh lên thành công! Hãy nhấn Lưu thay đổi để lưu lại.' })
        }
      } catch (err) {
        console.error('Upload avatar error:', err)
        setMessage({ type: 'error', content: 'Có lỗi xảy ra khi tải ảnh lên.' })
      } finally {
        setUploading(false)
      }
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
        phone: updated.phone || '',
        avatarUrl: updated.avatarUrl || ''
      })
      const latestMembership = await getMyMembershipApi().catch(() => null)
      if (latestMembership) setMembership(latestMembership)
      setMessage({ type: 'success', content: t('profile.update_success') })
    } catch (err) {
      console.error('Update profile error:', err)
      setMessage({ type: 'error', content: err.response?.data?.message || t('profile.update_error') })
    } finally {
      setSaving(false)
    }
  }

  const handlePwChange = (e) => {
    setPwData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePwSubmit = async () => {
    setPwError('')
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwError(t('profile.pw_not_match'))
      return
    }
    if (pwData.newPassword.length < 6) {
      setPwError(t('profile.pw_too_short'))
      return
    }

    setPwLoading(true)
    try {
      await changePasswordApi(pwData.oldPassword, pwData.newPassword)
      setOpenPwDialog(false)
      setPwData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setMessage({ type: 'success', content: t('profile.pw_success') })
    } catch (err) {
      setPwError(err.response?.data?.message || t('profile.pw_old_wrong'))
    } finally {
      setPwLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress color="primary" />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: 'auto',
        my: 5,
        px: 4,
        py: 4,
        bgcolor: 'background.paper',
        borderRadius: 10,
        border: (theme) => `1px solid ${theme.palette.primary.main}`,
        boxShadow: (theme) => `0 15px 45px ${theme.palette.primary.contrastText}08`
      }}
    >
      <Box sx={{ mb: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
        <VerifiedUser sx={{ color: 'primary.contrastText', fontSize: 50 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.contrastText' }}>
            {t('profile.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('profile.subtitle')}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={5} justifyContent="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 10,
              bgcolor: 'white',
              border: (theme) => `1px solid ${theme.palette.primary.main}`,
              height: '100%',
              boxShadow: (theme) => `0 10px 20px ${theme.palette.primary.contrastText}10`
            }}
          >
            <Box sx={{ position: 'relative', width: 180, height: 180, mx: 'auto', mb: 3 }}>
              <Avatar
                src={formData.avatarUrl || profile?.avatarUrl}
                sx={{
                  width: 180,
                  height: 180,
                  bgcolor: 'primary.contrastText',
                  fontSize: '4rem',
                  fontWeight: 700,
                  boxShadow: (theme) => `0 15px 35px ${theme.palette.primary.contrastText}33`,
                  border: (theme) => `6px solid ${theme.palette.primary.main}40`
                }}
              >
                {profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              {uploading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    bgcolor: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2
                  }}
                >
                  <CircularProgress size={40} sx={{ color: 'white' }} />
                </Box>
              )}
              <Tooltip title={t('profile.avatar_tooltip')}>
                <IconButton
                  onClick={handleAvatarClick}
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    bgcolor: 'white',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.main', transform: 'scale(1.1)' },
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

            <Typography variant="h5" sx={{ fontWeight: 800, color: '#333', mb: 1 }}>
              {profile?.fullName}
            </Typography>

            <Chip
              label={profile?.roles?.[0]?.replace('ROLE_', '') || 'User'}
              sx={{ fontWeight: 700, bgcolor: (theme) => `${theme.palette.primary.contrastText}1a`, color: 'primary.contrastText' }}
            />

            {/* Membership Section (Simplified) */}
            {membership?.tier ? (() => {
              const tier = membership.tier
              const v = TIER_VISUAL[tier.tierCode] || defaultVisual
              return (
                <Box sx={{ mt: 2, borderRadius: 4, overflow: 'hidden', border: `2px solid ${v.border}`, textAlign: 'left', width: '100%' }}>
                  {/* Gradient header */}
                  <Box sx={{
                    background: v.gradient, px: 2, py: 1.5,
                    display: 'flex', flexDirection: 'column', gap: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: 28, height: 28, borderRadius: '50%',
                          bgcolor: 'rgba(255,255,255,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', flexShrink: 0
                        }}>
                          {v.icon}
                        </Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                          {t('profile.membership_tier')}
                        </Typography>
                      </Box>
                      <Chip
                        label={`-${tier.discountPct}%`}
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: v.textColor, fontWeight: 800, fontSize: 11, flexShrink: 0 }}
                      />
                    </Box>
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 900, lineHeight: 1.1, fontSize: '0.95rem', pl: 4.5, whiteSpace: 'nowrap', mt: -0.5 }}>
                      {membershipTierName}
                    </Typography>
                  </Box>

                    {/* View details button only */}
                    <Box sx={{ px: 2, py: 2, bgcolor: v.bg }}>
                      <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        endIcon={<ArrowForward />}
                        onClick={() => navigate('/membership')}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                            color: 'primary.contrastTextHover'
                          },
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          justifyContent: 'center',
                          py: 0.8
                        }}
                      >
                        {t('profile.view_membership_details')}
                      </Button>
                    </Box>
                </Box>
              )
            })() : (
              /* No membership yet — invitation card */
              <Box sx={{ mt: 2, p: 2.5, borderRadius: 4, bgcolor: '#fdf2f8', border: '1px solid #f9a8d4', textAlign: 'center' }}>
                <CardGiftcard sx={{ fontSize: 36, color: '#be185d', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#831843', mb: 0.5 }}>
                  {t('profile.membership_invite_title')}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  {t('profile.membership_invite_desc')}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => navigate('/bookings')}
                  sx={{
                    borderRadius: 2, fontWeight: 700, fontSize: '0.75rem',
                    bgcolor: '#be185d', '&:hover': { bgcolor: '#9f1239' }
                  }}
                >
                  {t('common.book_now')}
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 3, borderColor: 'primary.main' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {t('profile.member_since')}: {new Date().getFullYear()}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 10,
              bgcolor: 'white',
              border: (theme) => `1px solid ${theme.palette.primary.main}`,
              height: '100%',
              boxShadow: (theme) => `0 10px 20px ${theme.palette.primary.contrastText}10`
            }}
          >
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Info sx={{ color: 'primary.contrastText' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#333' }}>
                {t('profile.personal_info')}
              </Typography>
            </Box>

            {message.content && (
              <Alert severity={message.type} sx={{ mb: 4, borderRadius: 3 }}>
                {message.content}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label={t('profile.full_name')}
                  name="fullName"
                  value={formData.fullName || ''}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'primary.contrastText' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#e3f2fd' } }}
                />

                <TextField
                  fullWidth
                  label={t('profile.email')}
                  value={profile?.email || ''}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'primary.contrastText' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#e3f2fd' } }}
                />

                <TextField
                  fullWidth
                  label={t('profile.phone')}
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: 'primary.contrastText' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#e3f2fd' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  sx={{
                    px: 8,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 800,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark', color: 'primary.contrastTextHover' }
                  }}
                >
                  {saving ? t('profile.saving') : t('profile.save_changes')}
                </Button>
              </Box>
            </form>

            <Divider sx={{ my: 5, borderColor: 'primary.main', borderStyle: 'dashed' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Shield sx={{ color: 'primary.contrastText' }} />
                <Typography sx={{ fontWeight: 700 }}>{t('profile.security')}</Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => setOpenPwDialog(true)}
                sx={{
                  borderRadius: 3,
                  fontWeight: 800,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark', color: 'primary.contrastTextHover' },
                  px: 4
                }}
              >
                {t('profile.change_password')}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={openPwDialog}
        onClose={() => setOpenPwDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 6, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>{t('profile.change_password')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {pwError && <Alert severity="error">{pwError}</Alert>}

            <TextField
              fullWidth
              label={t('profile.old_password')}
              name="oldPassword"
              type={showPw.old ? 'text' : 'password'}
              value={pwData.oldPassword}
              onChange={handlePwChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 5 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw((prev) => ({ ...prev, old: !prev.old }))}>
                      {showPw.old ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label={t('profile.new_password')}
              name="newPassword"
              type={showPw.new ? 'text' : 'password'}
              value={pwData.newPassword}
              onChange={handlePwChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 5 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw((prev) => ({ ...prev, new: !prev.new }))}>
                      {showPw.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label={t('profile.confirm_password')}
              name="confirmPassword"
              type={showPw.confirm ? 'text' : 'password'}
              value={pwData.confirmPassword}
              onChange={handlePwChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 5 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw((prev) => ({ ...prev, confirm: !prev.confirm }))}>
                      {showPw.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setOpenPwDialog(false)} sx={{ borderRadius: 3 }}>
            {t('profile.cancel')}
          </Button>
          <Button
            onClick={handlePwSubmit}
            variant="contained"
            disabled={pwLoading}
            sx={{
              bgcolor: 'primary.contrastText',
              color: 'white',
              borderRadius: 3,
              px: 4,
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            {pwLoading ? <CircularProgress size={24} color="inherit" /> : t('profile.update_now')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProfilePage
