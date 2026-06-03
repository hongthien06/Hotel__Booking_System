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
  LinearProgress,
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
import { getMyProfileApi, updateMyProfileApi } from '../../shared/api/userApi'
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
  const [formData, setFormData] = useState({ fullName: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  useEffect(() => {
    fetchProfile()
    getMyMembershipApi().then(setMembership).catch(() => {})
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
      setMessage({ type: 'error', content: t('profile.fetch_error') })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setMessage({ type: 'success', content: `${t('profile.update_success')} (Avatar feature coming soon!)` })
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

            {membership?.tier ? (() => {
              const tier = membership.tier
              const v = TIER_VISUAL[tier.tierCode] || defaultVisual
              const isVIP = tier.tierCode === 'VIP'
              const nextTier = membership.nextTier
              const spentToNext = Number(membership.spentToNextTier || 0)
              const bookingsToNext = Number(membership.bookingsToNextTier || 0)
              const spentProgress = nextTier
                ? Math.min(100, Math.max(5, 100 - (spentToNext / (Number(nextTier.minTotalSpent) || 1)) * 100))
                : 100
              const bookingProgress = nextTier && bookingsToNext > 0
                ? Math.min(100, Math.max(5, (membership.bookingCount / (membership.bookingCount + bookingsToNext)) * 100))
                : 100
              const nextTierName = nextTier ? getMembershipTierName(nextTier, i18n.language) : null

              return (
                <Box sx={{ mt: 2, borderRadius: 4, overflow: 'hidden', border: `2px solid ${v.border}`, textAlign: 'left' }}>
                  {/* Gradient header */}
                  <Box sx={{
                    background: v.gradient, px: 2.5, py: 2,
                    display: 'flex', alignItems: 'center', gap: 1.5
                  }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white'
                    }}>
                      {v.icon}
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {t('profile.membership_tier')}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 900, lineHeight: 1.1 }}>
                        {membershipTierName}
                      </Typography>
                    </Box>
                    <Chip
                      label={`-${tier.discountPct}%`}
                      size="small"
                      sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.9)', color: v.textColor, fontWeight: 800, fontSize: 12 }}
                    />
                  </Box>

                  {/* Stats */}
                  <Box sx={{ px: 2, py: 2, bgcolor: v.bg }}>
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 4 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 900, color: v.textColor }}>{membership.bookingCount ?? 0}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{t('membership.total_bookings')}</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 900, color: v.textColor }}>{tier.discountPct}%</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{t('membership.discount_rate')}</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: v.textColor, fontSize: '0.75rem' }}>{fmtVND(membership.totalSpent)}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{t('membership.total_spent')}</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Progress bars */}
                    {!isVIP && nextTier && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: v.textColor, display: 'block', mb: 1 }}>
                          {t('membership.progress_to')} {nextTierName}
                        </Typography>
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                            <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>{t('membership.spent_progress')}</Typography>
                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: v.textColor }}>{fmtVND(spentToNext)} {t('membership.more')}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate" value={spentProgress}
                            sx={{ height: 6, borderRadius: 3, bgcolor: v.border, '& .MuiLinearProgress-bar': { background: v.gradient, borderRadius: 3 } }}
                          />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                            <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>{t('membership.booking_progress')}</Typography>
                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: v.textColor }}>{bookingsToNext} {t('membership.bookings_more')}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate" value={bookingProgress}
                            sx={{ height: 6, borderRadius: 3, bgcolor: v.border, '& .MuiLinearProgress-bar': { background: v.gradient, borderRadius: 3 } }}
                          />
                        </Box>
                      </Box>
                    )}

                    {isVIP && (
                      <Typography variant="caption" sx={{ color: v.textColor, fontWeight: 700, display: 'block', textAlign: 'center' }}>
                        🏆 {t('membership.vip_congrats')}
                      </Typography>
                    )}

                    <Button
                      fullWidth
                      size="small"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/membership')}
                      sx={{
                        mt: 1, borderRadius: 2, fontWeight: 700, fontSize: '0.75rem',
                        color: v.textColor, borderColor: v.border,
                        '&:hover': { bgcolor: `${v.border}40` }
                      }}
                      variant="outlined"
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
