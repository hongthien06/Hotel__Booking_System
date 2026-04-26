import React from 'react'
import { Box, Typography, Button, Avatar, Tooltip, IconButton } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../../shared/hooks/useAuth'
import { Home, EventNote, AccountBalanceWallet, Dashboard, Logout } from '@mui/icons-material'

const navItems = [
  { label: 'Trang chủ', path: '/home', icon: <Home fontSize="small" /> },
  { label: 'Đặt phòng', path: '/bookings', icon: <EventNote fontSize="small" /> },
  { label: 'Thanh toán', path: '/payment', icon: <AccountBalanceWallet fontSize="small" /> },
]

const adminNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <Dashboard fontSize="small" />, roles: ['ADMIN', 'MANAGER'] },
]

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const hasAdminAccess = () => {
    if (!user || !user.roles) return false
    const userRoleStrings = user.roles.map(r => {
      if (typeof r === 'string') return r
      return r.roleName || r.authority || ''
    }).filter(Boolean)

    return userRoleStrings.some(role => {
      const norm = role.startsWith('ROLE_') ? role : `ROLE_${role}`
      return norm === 'ROLE_ADMIN' || norm === 'ROLE_MANAGER'
    })
  }

  const isActive = (path) => location.pathname === path

  return (
    <Box sx={{
      height: '58px',
      minHeight: '58px',
      maxHeight: '58px',
      width: '100%',
      px: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#ffc7db',
      color: '#9a1c48',
      boxShadow: '0 2px 8px rgba(154, 28, 72, 0.15)',
      zIndex: (theme) => theme.zIndex.drawer + 1,
      flexShrink: 0,
      boxSizing: 'border-box'
    }}>
      {/* Logo */}
      <Typography 
        variant="h6" 
        sx={{ fontWeight: 800, cursor: 'pointer', letterSpacing: '-0.5px', color: '#9a1c48' }} 
        onClick={() => navigate(isAuthenticated ? '/home' : '/login')}
      >
        🏨 Hotel Booking
      </Typography>

      {/* Navigation Links - chỉ hiện khi đã đăng nhập */}
      {isAuthenticated && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                color: isActive(item.path) ? '#fff' : '#9a1c48',
                fontWeight: isActive(item.path) ? 800 : 600,
                fontSize: '0.85rem',
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 0.8,
                backgroundColor: isActive(item.path) ? '#9a1c48' : 'transparent',
                '&:hover': { 
                  color: '#fff',
                  backgroundColor: '#c02860',
                }
              }}
            >
              {item.label}
            </Button>
          ))}

          {/* Admin/Manager items */}
          {hasAdminAccess() && adminNavItems.map((item) => (
            <Button
              key={item.path}
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                color: isActive(item.path) ? '#fff' : '#9a1c48',
                fontWeight: isActive(item.path) ? 800 : 600,
                fontSize: '0.85rem',
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 0.8,
                backgroundColor: isActive(item.path) ? '#9a1c48' : 'transparent',
                borderLeft: '1px solid rgba(154,28,72,0.2)',
                ml: 1,
                '&:hover': { 
                  color: '#fff',
                  backgroundColor: '#c02860',
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      )}

      {/* Right Section - User info / Login */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {isAuthenticated && user ? (
          <>
            <Tooltip title="Trang cá nhân">
              <IconButton
                onClick={() => navigate('/profile')}
                sx={{ 
                  p: 0.5,
                  '&:hover': { opacity: 0.8 }
                }}
              >
                <Avatar sx={{ width: 34, height: 34, bgcolor: '#9a1c48', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {user.fullName?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#9a1c48', display: { xs: 'none', md: 'block' } }}>
              {user.fullName}
            </Typography>
            <Tooltip title="Đăng xuất">
              <IconButton
                onClick={handleLogout}
                sx={{ 
                  color: '#9a1c48',
                  '&:hover': { backgroundColor: 'rgba(154,28,72,0.1)' } 
                }}
              >
                <Logout fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Button 
            variant="contained" 
            size="small"
            onClick={() => navigate('/login')}
            sx={{ 
              fontWeight: 700, textTransform: 'none',
              bgcolor: '#9a1c48', color: '#fff',
              '&:hover': { bgcolor: '#c02860' }
            }}
          >
            Đăng nhập
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default Header