import React, { useState } from 'react'
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/hooks/useAuth'
import { loginApi } from '../../shared/api/authApi'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data = await loginApi(email, password)
      login(data.token, { email: data.email, fullName: data.fullName, roles: data.roles || [] })
      navigate('/dashboard') // Or some default page
    } catch (err) {
      const data = err.response?.data;
      let errMsg = 'Đăng nhập thất bại. Xin vui lòng kiểm tra lại thông tin.';
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
      bgcolor: '#d7d0ffff', // Màu nền lớn của cả trang
      p: 2
    }}>
      <Paper elevation={24} sx={{
        p: 5,
        width: '100%',
        maxWidth: 420,
        borderRadius: 4,
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      }}>
        <Typography variant="h4" align="center" color="#9a1c48ff" sx={{ mb: 1, fontWeight: 800, letterSpacing: '-0.5px' }}> {/* Màu chữ Welcome Back */}
          Welcome Back
        </Typography>
        <Typography variant="body1" align="center" color="#000" sx={{ mb: 4 }}>
          Đăng nhập vào tài khoản Hotel Booking của bạn
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
            InputProps={{ sx: { borderRadius: 2 } }}
            sx={{
              backgroundColor: '#d1c8ffff', // Màu nền ô nhập
              borderRadius: 2,
              input: { color: '#000' }, // Màu chữ gõ vào
              '& .MuiInputLabel-root': { color: '#b0305fcd' }, // Màu chữ nhãn
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#b0305fcd', // Màu viền ô nhập
                }
              }
            }}
          />
          <TextField
            fullWidth
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            sx={{
              mb: 4, mt: 2,
              backgroundColor: '#d1c8ffff', // Màu nền ô nhập
              borderRadius: 2,
              input: { color: '#000' }, // Màu chữ gõ vào
              '& .MuiInputLabel-root': { color: '#b0305fcd' }, // Màu chữ nhãn
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#b0305fcd', // Màu viền ô nhập
                }
              }
            }}
            InputProps={{ sx: { borderRadius: 2 } }}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            size="large"
            disabled={isLoading}
            sx={{
              bgcolor: '#e6b1c4ff', // Màu nền nút lúc đầu
              color: '#c2597fcd', // Màu chữ trong nút
              py: 1.8,
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              boxShadow: '0 4px 14px 0 rgba(204, 124, 153, 0.39)',
              '&:hover': {
                transform: 'translateY(-1px)',
                bgcolor: '#c02860ff', // Màu nền nút khi hover
                color: '#fff',
                boxShadow: '0 6px 20px rgba(231, 78, 134, 0.4)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{ color: '#9a1c48ff', textDecoration: 'none', fontWeight: 700 }}> {/* Màu chữ Đăng ký ngay */}
              Đăng ký ngay
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default LoginPage
