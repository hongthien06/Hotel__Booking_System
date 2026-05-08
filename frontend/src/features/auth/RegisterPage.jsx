import React, { useState } from 'react'
import { Box, Button, TextField, Typography, Paper, Alert, IconButton, InputAdornment } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/hooks/useAuth'
import { registerApi } from '../../shared/api/authApi'

const RegisterPage = () => {
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
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp.')
    }
    const { fullName, email, phone, password } = formData;
    setIsLoading(true)
    try {
      const data = await registerApi(fullName, email, phone, password);
      login(data.token, { email: formData.email, fullName: formData.fullName, roles: [{ roleName: 'CUSTOMER' }] })
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data;
      let errMsg = 'Đăng ký thất bại. Xin vui lòng thử lại.';
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
        maxWidth: 600,
        borderRadius: 4
      }}>
        <Typography variant="h4" align="center" color="primary.contrastText" sx={{ mb: 1, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Tạo tài khoản mới
        </Typography>
        <Typography variant="body1" align="center" color="text.primary" sx={{ mb: 4 }}>
          Tham gia cùng chúng tôi để trải nghiệm dịch vụ tốt nhất
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* Sử dụng CSS Grid để kiểm soát vị trí và độ rộng chính xác tuyệt đối */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)', // 2 cột bằng nhau
            gap: 3, // Khoảng cách giữa các ô
            width: '100%'
          }}>
            {/* Dòng 1: Họ tên và Email */}
            <Box sx={{ gridColumn: 'span 1' }}>
              <TextField
                fullWidth
                label="Họ và tên"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Box>
            <Box sx={{ gridColumn: 'span 1' }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Box>

            {/* Dòng 2: Số điện thoại và Mật khẩu */}
            <Box sx={{ gridColumn: 'span 1' }}>
              <TextField
                fullWidth
                label="Số điện thoại"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                inputProps={{ maxLength: 20 }}
              />
            </Box>
            <Box sx={{ gridColumn: 'span 1' }}>
              <TextField
                fullWidth
                label="Mật khẩu"
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

            {/* Dòng 3: Căn trái - Thẳng hàng với ô Họ và tên */}
            <Box sx={{ gridColumn: 'span 1' }}>
              <TextField
                fullWidth
                label="Xác nhận mật khẩu"
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
            variant="contained"
            type="submit"
            size="large"
            disabled={isLoading}
            sx={{
              mt: 4,
              py: 1.8,
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-1px)',
                bgcolor: 'primary.dark',
                boxShadow: '0 6px 20px rgba(231, 78, 134, 0.4)'
              }
            }}
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng ký ngay'}
          </Button>
        </form>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Đã có tài khoản?{'  '}
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
              Đăng nhập
            </Box>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default RegisterPage
