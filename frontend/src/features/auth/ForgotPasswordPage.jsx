import React, { useState } from 'react'
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { forgotPasswordApi } from '../../shared/api/authApi'

const ForgotPasswordPage = () => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      const response = await forgotPasswordApi(email)
      setMessage(typeof response === 'string' ? response : t('forgot_password.success_msg'))
    } catch (err) {
      const data = err.response?.data;
      let errMsg = t('forgot_password.error_msg');
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
          {t('forgot_password.title')}
        </Typography>
        <Typography variant="body1" align="center" color="text.primary" sx={{ mb: 4 }}>
          {t('forgot_password.subtitle')}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t('forgot_password.email_label')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoFocus
            sx={{ mb: 3 }}
          />
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
            {isLoading ? t('forgot_password.sending') : t('forgot_password.submit_button')}
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

export default ForgotPasswordPage
