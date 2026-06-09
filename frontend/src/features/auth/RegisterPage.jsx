import React, { useState, useEffect, useRef } from 'react'
import { Box, Button, TextField, Typography, Paper, Alert, IconButton, InputAdornment, Fade, CircularProgress } from '@mui/material'
import { Visibility, VisibilityOff, ArrowBack, Email as EmailIcon } from '@mui/icons-material'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../shared/hooks/useAuth'
import { registerInitApi, registerVerifyApi } from '../../shared/api/authApi'

const OTP_LENGTH = 6
const RESEND_COUNTDOWN = 60

const RegisterPage = () => {
  const { t } = useTranslation()
  const [step, setStep] = useState(1) // 1 = form, 2 = OTP
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''))
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()
  const { login } = useAuth()
  const otpRefs = useRef([])

  // Countdown timer cho nút gửi lại OTP
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Xử lý Step 1: Gửi form đăng ký → nhận OTP
  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      return setError(t('register.match_error'))
    }
    const { fullName, email, phone, password } = formData
    setIsLoading(true)
    try {
      await registerInitApi(fullName, email, phone, password)
      setStep(2)
      setCountdown(RESEND_COUNTDOWN)
    } catch (err) {
      const data = err.response?.data
      let errMsg = t('register.failed')
      if (data) {
        if (data.message) errMsg = data.message
        else if (data.error) errMsg = data.error
        else if (typeof data === 'object' && Object.keys(data).length > 0) errMsg = Object.values(data)[0]
      }
      setError(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // Xử lý nhập OTP
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otpValues]
    newOtp[index] = value.slice(-1)
    setOtpValues(newOtp)

    // Tự động focus ô tiếp theo
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (pastedData) {
      const newOtp = [...otpValues]
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtpValues(newOtp)
      const nextIndex = Math.min(pastedData.length, OTP_LENGTH - 1)
      otpRefs.current[nextIndex]?.focus()
    }
  }

  // Xử lý Step 2: Xác nhận OTP
  const handleVerifyOtp = async () => {
    setError('')
    const otpCode = otpValues.join('')
    if (otpCode.length !== OTP_LENGTH) {
      return setError(t('register.otp_incomplete'))
    }
    setIsLoading(true)
    try {
      const data = await registerVerifyApi(formData.email, otpCode)
      login(data.token, { email: data.email, fullName: data.fullName, roles: [{ roleName: 'CUSTOMER' }] })
      navigate('/home')
    } catch (err) {
      const data = err.response?.data
      let errMsg = t('register.otp_invalid')
      if (data) {
        if (data.message) errMsg = data.message
        else if (data.error) errMsg = data.error
      }
      setError(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // Gửi lại OTP
  const handleResendOtp = async () => {
    setError('')
    setOtpValues(Array(OTP_LENGTH).fill(''))
    setIsLoading(true)
    try {
      const { fullName, email, phone, password } = formData
      await registerInitApi(fullName, email, phone, password)
      setCountdown(RESEND_COUNTDOWN)
    } catch (err) {
      const data = err.response?.data
      setError(data?.message || t('register.resend_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      p: 2
    }}>
      <Paper elevation={24} sx={{
        p: 5,
        width: '100%',
        maxWidth: step === 1 ? 600 : 480,
        borderRadius: 4,
        transition: 'max-width 0.3s ease'
      }}>
        {/* ── Step 1: Form đăng ký ── */}
        {step === 1 && (
          <Fade in={step === 1}>
            <Box>
              <Typography variant="h4" align="center" color="primary.contrastText" sx={{ mb: 1, fontWeight: 800, letterSpacing: '-0.5px' }}>
                {t('register.title')}
              </Typography>
              <Typography variant="body1" align="center" color="text.primary" sx={{ mb: 4 }}>
                {t('register.subtitle')}
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

              <form onSubmit={handleSubmitForm}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 3,
                  width: '100%'
                }}>
                  <Box sx={{ gridColumn: 'span 1' }}>
                    <TextField
                      fullWidth
                      label={t('register.full_name')}
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </Box>
                  <Box sx={{ gridColumn: 'span 1' }}>
                    <TextField
                      fullWidth
                      label={t('profile.email')}
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Box>

                  <Box sx={{ gridColumn: 'span 1' }}>
                    <TextField
                      fullWidth
                      label={t('register.phone')}
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      inputProps={{ maxLength: 20 }}
                    />
                  </Box>
                  <Box sx={{ gridColumn: 'span 1' }}>
                    <TextField
                      fullWidth
                      label={t('login_page.password')}
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box sx={{ gridColumn: 'span 1' }}>
                    <TextField
                      fullWidth
                      label={t('register.confirm_password')}
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="registerButton"
                  type="submit"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    mt: 4,
                    py: 1.8,
                    borderRadius: 2,
                    fontSize: '1.1rem'
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : t('register.submit_button')}
                </Button>
              </form>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('register.have_account')}{'  '}
                  <Box
                    component={Link}
                    to="/login"
                    sx={{
                      color: 'primary.contrastText',
                      textDecoration: 'none',
                      fontWeight: 700,
                      display: 'inline-block',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        color: 'primary.dark',
                        textShadow: '0 2px 10px rgba(154, 28, 72, 0.2)',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {t('register.login_link')}
                  </Box>
                </Typography>
              </Box>
            </Box>
          </Fade>
        )}

        {/* ── Step 2: Nhập OTP ── */}
        {step === 2 && (
          <Fade in={step === 2}>
            <Box sx={{ textAlign: 'center' }}>
              {/* Nút quay lại */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <IconButton onClick={() => { setStep(1); setError('') }} size="small" sx={{ color: 'text.secondary' }}>
                  <ArrowBack />
                </IconButton>
              </Box>

              {/* Icon email */}
              <Box sx={{
                width: 72, height: 72, borderRadius: '50%', mx: 'auto', mb: 3,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'primary.main', color: 'primary.contrastText'
              }}>
                <EmailIcon sx={{ fontSize: 36 }} />
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'primary.contrastText' }}>
                {t('register.otp_title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 360, mx: 'auto' }}>
                {t('register.otp_subtitle')}{' '}
                <strong>{formData.email}</strong>
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

              {/* OTP Input - 6 ô riêng biệt */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 4 }}>
                {otpValues.map((val, i) => (
                  <TextField
                    key={i}
                    inputRef={(el) => (otpRefs.current[i] = el)}
                    value={val}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    inputProps={{
                      maxLength: 1,
                      style: {
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        padding: '12px 0',
                        caretColor: '#9a1c48'
                      }
                    }}
                    sx={{
                      width: 52,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.contrastText',
                          borderWidth: 2
                        }
                      }
                    }}
                  />
                ))}
              </Box>

              {/* Nút xác nhận */}
              <Button
                fullWidth
                variant="registerButton"
                size="large"
                disabled={isLoading || otpValues.join('').length !== OTP_LENGTH}
                onClick={handleVerifyOtp}
                sx={{
                  py: 1.8,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  mb: 3
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : t('register.otp_verify')}
              </Button>

              {/* Gửi lại OTP */}
              <Typography variant="body2" color="text.secondary">
                {t('register.otp_not_received')}{' '}
                {countdown > 0 ? (
                  <Box component="span" sx={{ fontWeight: 700, color: 'primary.contrastText' }}>
                    {t('register.otp_resend_in')} {countdown}s
                  </Box>
                ) : (
                  <Box
                    component="span"
                    onClick={handleResendOtp}
                    sx={{
                      fontWeight: 700,
                      color: 'primary.contrastText',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      '&:hover': { color: 'primary.dark' }
                    }}
                  >
                    {t('register.otp_resend')}
                  </Box>
                )}
              </Typography>
            </Box>
          </Fade>
        )}
      </Paper>
    </Box>
  )
}

export default RegisterPage
