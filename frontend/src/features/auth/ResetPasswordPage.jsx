import React, { useState } from 'react'
import { Box, Button, TextField, Typography, Paper, Alert, IconButton, InputAdornment } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { resetPasswordApi } from '../../shared/api/authApi'

const ResetPasswordPage = () => {
  const { t } = useTranslation()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token) {
      return setError(t('reset_password.token_error'))
    }

    if (newPassword !== confirmPassword) {
      return setError(t('reset_password.match_error'))
    }

    setIsLoading(true)
    try {
      await resetPasswordApi(token, newPassword)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      const data = err.response?.data;
      let errMsg = t('reset_password.generic_error');
      if (data) {
        if (data.message) errMsg = data.message;
        else if (data.error) errMsg = data.error;
        else if (typeof data === 'object' && Object.keys(data).length > 0) errMsg = Object.values(data)[0];
      }
      setError(errMsg);
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
        maxWidth: 420,
        borderRadius: 4
      }}>
        <Typography variant="h4" align="center" color="primary.contrastText" sx={{ mb: 1, fontWeight: 800, letterSpacing: '-0.5px' }}>
          {t('reset_password.title')}
        </Typography>
        <Typography variant="body1" align="center" color="text.primary" sx={{ mb: 4 }}>
          {t('reset_password.subtitle')}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{t('reset_password.success_msg')}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t('reset_password.new_password')}
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
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
          <TextField
            fullWidth
            label={t('reset_password.confirm_new_password')}
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            sx={{ mb: 3 }}
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
          <Button
            fullWidth
            variant="contained"
            type="submit"
            size="large"
            disabled={isLoading || success || !token}
            sx={{
              py: 1.8,
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              transition: 'all 0.2s ease-in-out',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                transform: 'translateY(-1px)',
                bgcolor: 'primary.dark',
                color: 'primary.contrastTextHover',
                boxShadow: '0 6px 20px rgba(231, 78, 134, 0.4)'
              }
            }}
          >
            {isLoading ? t('reset_password.updating') : t('reset_password.update_button')}
          </Button>
        </form>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
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
                  textDecoration: 'underline'
                }
              }}
            >
              {t('forgot_password.back_to_login')}
            </Box>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default ResetPasswordPage
