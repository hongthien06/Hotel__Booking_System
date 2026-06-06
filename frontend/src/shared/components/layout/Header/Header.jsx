import React from 'react'
import { Box, Typography, Button, Avatar, Tooltip, IconButton } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../../shared/hooks/useAuth'
import { Home, EventNote, AccountBalanceWallet, Dashboard, Logout, KingBed, History, Menu as MenuIcon, Person, EmojiEvents, RateReview } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../LanguageSwitcher'
import { Menu, MenuItem, Divider } from '@mui/material'

const navItems = [
  { label: 'header.home', path: '/home', icon: <Home fontSize="small" /> },
  { label: 'header.bookings', path: '/bookings', icon: <EventNote fontSize="small" /> },
  { label: 'header.reviews', path: '/reviews', icon: <RateReview fontSize="small" /> },
]

const adminNavItems = [
  { label: 'header.bookings', path: '/bookings', icon: <EventNote fontSize="small" />, roles: ['ADMIN', 'MANAGER'] },
  { label: 'header.rooms', path: '/rooms', icon: <KingBed fontSize="small" />, roles: ['ADMIN', 'MANAGER'] },
  { label: 'header.dashboard', path: '/dashboard', icon: <Dashboard fontSize="small" />, roles: ['ADMIN', 'MANAGER'] },
  { label: 'header.review_management', path: '/admin/reviews', icon: <RateReview fontSize="small" />, roles: ['ADMIN', 'MANAGER'] },
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
      backgroundColor: 'primary.main',
      color: 'primary.contrastText',
      boxShadow: (theme) => `0 2px 8px ${theme.palette.primary.contrastText}26`,
      zIndex: (theme) => theme.zIndex.drawer + 1,
      flexShrink: 0,
      boxSizing: 'border-box'
    }}>
      {/* Logo */}
      <Typography
        variant="h6"
        noWrap
        sx={{
          fontWeight: 800, cursor: 'pointer', letterSpacing: '-0.5px', color: 'primary.contrastText',
          fontSize: { xs: '1rem', sm: '1.25rem' },
          flexShrink: 0,
          maxWidth: { xs: 120, sm: 'none' }
        }}
        onClick={() => navigate('/home')}
      >
        🏨 <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{t('header.logo_text')}</Box>
      </Typography>

      {/* Navigation Links */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {/* Home / Bookings — Bookings hidden for Admin (shown in admin section) */}
        {navItems
          .filter((item) => !(item.path === '/bookings' && hasRole(['ADMIN', 'MANAGER'])))
          .map((item) => (
          <Button
            key={item.path}
            startIcon={item.icon}
            onClick={() => navigate(item.path)}
            sx={{
              color: isActive(item.path) ? 'primary.contrastTextHover' : 'primary.contrastText',
              fontWeight: isActive(item.path) ? 800 : 600,
              fontSize: '0.85rem',
              textTransform: 'none',
              borderRadius: 2,
              px: { xs: 1, sm: 2 },
              py: 0.8,
              width: { xs: 'auto', sm: 145 },
              whiteSpace: 'nowrap',
              backgroundColor: isActive(item.path) ? 'primary.contrastText' : 'transparent',
              '&:hover': {
                color: 'primary.contrastTextHover',
                backgroundColor: 'primary.dark',
              }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {t(item.label)}
            </Box>
          </Button>
        ))}

        {/* Admin/Manager items */}
        {adminNavItems.filter(item => hasRole(item.roles)).map((item) => (
          <Button
            key={item.path}
            startIcon={item.icon}
            onClick={() => navigate(item.path)}
            sx={{
              color: isActive(item.path) ? 'primary.contrastTextHover' : 'primary.contrastText',
              fontWeight: isActive(item.path) ? 800 : 600,
              fontSize: '0.85rem',
              textTransform: 'none',
              borderRadius: 2,
              px: { xs: 1, sm: 2 },
              py: 0.8,
              width: { xs: 'auto', sm: 145 },
              whiteSpace: 'nowrap',
              backgroundColor: isActive(item.path) ? 'primary.contrastText' : 'transparent',
              borderLeft: (theme) => `1px solid ${theme.palette.primary.contrastText}33`,
              ml: 1,
              '&:hover': {
                color: 'primary.contrastTextHover',
                backgroundColor: 'primary.dark',
              }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {t(item.label)}
            </Box>
          </Button>
        ))}
      </Box>

      {/* Right Section - User info / Login */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isAuthenticated && user ? (
          <>
            <Tooltip title="Menu">
              <IconButton
                id="nav-menu-button"
                onClick={handleMenuOpen}
                sx={{
                  color: 'primary.contrastText',
                  backgroundColor: (theme) => `${theme.palette.primary.contrastText}0d`,
                  '&:hover': { backgroundColor: (theme) => `${theme.palette.primary.contrastText}26` }
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
                  boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.contrastText}26`,
                  border: (theme) => `1px solid ${theme.palette.primary.contrastText}1a`
                }
              }}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }} sx={{ py: 1.2, gap: 1.5, fontWeight: 600 }}>
                <Person fontSize="small" color="primary" /> {t("header.profile") || "Trang cá nhân"}
              </MenuItem>

              {/* Lịch sử đặt phòng — hiện cho tất cả user */}
              <MenuItem onClick={() => { navigate('/booking-history'); handleMenuClose(); }} sx={{ py: 1.2, gap: 1.5, fontWeight: 600 }}>
                <History fontSize="small" color="primary" /> {t("header.bookings_history") || "Lịch sử đặt phòng"}
              </MenuItem>

              {/* Membership — only for customers */}
              {!hasRole(['ADMIN', 'MANAGER']) && (
                <MenuItem onClick={() => { navigate('/membership'); handleMenuClose(); }} sx={{ py: 1.2, gap: 1.5, fontWeight: 600 }}>
                  <EmojiEvents fontSize="small" color="primary" /> {t("header.membership") || "Hạng thành viên"}
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
              bgcolor: 'primary.contrastText', color: 'primary.contrastTextHover',
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            {t("header.login")}
          </Button>
        )}

        {/* Language Switcher at the very corner */}
        <Box sx={{ ml: { xs: 0.5, sm: 1 }, pl: { xs: 0.5, sm: 1 }, borderLeft: '1px solid rgba(255,255,255,0.2)', display: 'block' }}>
          <LanguageSwitcher />
        </Box>
      </Box>
    </Box>
  )
}

export default Header