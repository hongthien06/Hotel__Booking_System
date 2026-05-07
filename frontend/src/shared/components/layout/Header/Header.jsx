import React from 'react'
import { Box, Typography, Button, Avatar, Tooltip, IconButton } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../../shared/hooks/useAuth'
import { Home, EventNote, AccountBalanceWallet, Dashboard, Logout, KingBed, History, Menu as MenuIcon, Person } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../LanguageSwitcher'
import { Menu, MenuItem, Divider } from '@mui/material'

const navItems = [
  { label: 'header.home', path: '/home', icon: <Home fontSize="small" /> },
  { label: 'header.bookings', path: '/bookings', icon: <EventNote fontSize="small" /> },
]

const adminNavItems = [
  { label: 'header.dashboard', path: '/dashboard', icon: <Dashboard fontSize="small" />, roles: ['ADMIN', 'MANAGER'] },
  { label: 'header.rooms', path: '/rooms', icon: <KingBed fontSize="small" />, roles: ['ADMIN', 'MANAGER'] },
  { label: 'header.users', path: '/admin/users', icon: <Person fontSize="small" />, roles: ['MANAGER'] },
]

const Header = () => {
  const { t } = useTranslation()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const hasRole = (roles) => {
    if (!user || !user.roles) return false
    const userRoleStrings = user.roles.map(r => {
      if (typeof r === 'string') return r
      return r.roleName || r.authority || ''
    }).filter(Boolean)

    return userRoleStrings.some(role => {
      const norm = role.startsWith('ROLE_') ? role : `ROLE_${role}`
      return roles.some(target => {
        const targetNorm = target.startsWith('ROLE_') ? target : `ROLE_${target}`
        return norm === targetNorm
      })
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
        onClick={() => navigate('/home')}
      >
        🏨 Hotel Booking
      </Typography>

      {/* Navigation Links */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {/* Chỉ hiện Home/Booking cho Customer hoặc Guest */}
        {!hasRole(['ADMIN', 'MANAGER']) && navItems.map((item) => (
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
              minWidth: 100,
              backgroundColor: isActive(item.path) ? '#9a1c48' : 'transparent',
              '&:hover': {
                color: '#fff',
                backgroundColor: '#c02860',
              }
            }}
          >
            {t(item.label)}
          </Button>
        ))}

        {/* Admin/Manager items */}
        {adminNavItems.filter(item => hasRole(item.roles)).map((item) => (
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
            {t(item.label)}
          </Button>
        ))}
      </Box>

      {/* Right Section - User info / Login */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isAuthenticated && user ? (
          <>
            <Tooltip title="Menu">
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  color: '#9a1c48',
                  backgroundColor: 'rgba(154,28,72,0.05)',
                  '&:hover': { backgroundColor: 'rgba(154,28,72,0.15)' }
                }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  borderRadius: 3,
                  minWidth: 180,
                  boxShadow: '0 8px 24px rgba(154,28,72,0.15)',
                  border: '1px solid rgba(154,28,72,0.1)'
                }
              }}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }} sx={{ py: 1.2, gap: 1.5, fontWeight: 600 }}>
                <Person fontSize="small" color="primary" /> {t("header.profile") || "Trang cá nhân"}
              </MenuItem>

              {/* Chỉ hiện Lịch sử đặt phòng cho Customer/Guest */}
              {!hasRole(['ADMIN', 'MANAGER']) && (
                <MenuItem onClick={() => { navigate('/booking-history'); handleMenuClose(); }} sx={{ py: 1.2, gap: 1.5, fontWeight: 600 }}>
                  <History fontSize="small" color="primary" /> {t("header.bookings_history") || "Lịch sử đặt phòng"}
                </MenuItem>
              )}

              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={handleLogout} sx={{ py: 1.2, gap: 1.5, fontWeight: 600, color: 'error.main' }}>
                <Logout fontSize="small" /> {t("header.logout")}
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/login')}
            sx={{
              fontWeight: 700, textTransform: 'none',
              bgcolor: '#9a1c48', color: '#fff',
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: '#c02860' }
            }}
          >
            {t("header.login")}
          </Button>
        )}

        {/* Language Switcher at the very corner */}
        <Box sx={{ ml: 1, pl: 1, borderLeft: '1px solid rgba(154,28,72,0.2)' }}>
          <LanguageSwitcher />
        </Box>
      </Box>
    </Box>
  )
}

export default Header