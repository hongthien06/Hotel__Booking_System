import React, { useState, useEffect } from 'react'
import { Box, Button, TextField, Typography, Paper, Alert, IconButton, InputAdornment } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../shared/hooks/useAuth'
import { loginApi } from '../../shared/api/authApi'

const LoginPage = () => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login, isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      const roles = user.roles || []
      const isAdminOrManager = roles.some(r => {
        const roleStr = typeof r === 'string' ? r : (r.roleName || r.authority || '')
        return ['ADMIN', 'MANAGER', 'ROLE_ADMIN', 'ROLE_MANAGER'].includes(roleStr)
      })

      if (isAdminOrManager) {
        navigate('/dashboard')
      } else {
        navigate('/home')
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data = await loginApi(email, password)
      const roles = data.roles || []

      login(data.token, { email: data.email, fullName: data.fullName, roles: roles })
      // Redirection is handled by useEffect based on roles
    } catch (err) {
      const data = err.response?.data
      let errMsg = ''
      if (data) {
        if (data.message) errMsg = data.message
        else if (data.error) errMsg = data.error
        else if (typeof data === 'object' && Object.keys(data).length > 0) errMsg = Object.values(data)[0]
      }
      if (!errMsg) {
        errMsg = err.message || t('login_page.failed')
      }
      if (errMsg === 'Bad credentials' || errMsg === 'User is disabled') {
        errMsg = t('login_page.wrong_password')
      }
      setError(errMsg)
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
          {t('login_page.welcome')}
        </Typography>
        <Typography variant="body1" align="center" color="text.primary" sx={{ mb: 4 }}>
          {t('login_page.subtitle')}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoFocus
          />
          <TextField
            fullWidth
            label={t('login_page.password')}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            sx={{ mb: 4, mt: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -3, mb: 3 }}>
            <Typography
              component={Link}
              to="/forgot-password"
              variant="body2"
              sx={{
                color: 'primary.contrastText',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              {t('login_page.forgot_password')}
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            type="submit"
            size="large"
            disabled={isLoading}
            sx={{
              py: 1.8,
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-1px)',
                bgcolor: 'primary.dark',
                color: 'primary.contrastTextHover',
                boxShadow: '0 6px 20px rgba(231, 78, 134, 0.4)'
              }
            }}
          >
            {isLoading ? t('login_page.logging_in') : t('login_page.login_button')}
          </Button>
        </form>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('login_page.no_account')}{'  '}
            <Box
              component={Link}
              to="/register"
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
              {t('login_page.register_now')}
            </Box>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default LoginPage

