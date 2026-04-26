import React from 'react'
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../../shared/hooks/useAuth'

// Icon placeholders (Mock MUI icons text for now)
// Icon placeholders (using character initials as before or importing MUI icons)
import {
  Home,
  EventNote,
  AccountBalanceWallet,
  Person,
  Dashboard
} from '@mui/icons-material'

const menuItems = [
  { id: 'home', label: 'Trang chủ', path: '/', roles: [], icon: <Home /> },
  { id: 'bookings', label: 'Đặt phòng', path: '/bookings', roles: [], icon: <EventNote /> },
  { id: 'payment', label: 'Thanh toán', path: '/payment', roles: [], icon: <AccountBalanceWallet /> },
  { id: 'profile', label: 'Tài khoản', path: '/profile', roles: [], icon: <Person /> },
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'MANAGER'], icon: <Dashboard /> }
]

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // Helper method to check if user has permission
  const hasAccess = (itemRoles) => {
    if (!itemRoles || itemRoles.length === 0) return true
    if (!user || (!user.roles && !user.role)) return false

    // Normalize user roles to array of strings
    const userRoleStrings = (user.roles || []).map(r => {
      if (typeof r === 'string') return r
      return r.roleName || r.authority || ''
    }).filter(Boolean)

    if (user.role) userRoleStrings.push(user.role)

    return itemRoles.some(role => {
      const normalizedRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`
      return userRoleStrings.some(uRole => {
        const normalizedURole = uRole.startsWith('ROLE_') ? uRole : `ROLE_${uRole}`
        return normalizedRole === normalizedURole
      })
    })
  }

  return (
    <Box sx={{
      width: 250,
      flexShrink: 0,
      height: (theme) => `calc(100vh - ${theme.hotel_booking?.headerHeight || '58px'})`,
      borderRight: 1,
      borderColor: 'divider',
      backgroundColor: 'background.paper',
      overflow: 'auto'
    }}>
      <List component="nav">
        {menuItems.filter(item => hasAccess(item.roles)).map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(item.path)}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ color: location.pathname.startsWith(item.path) ? 'inherit' : 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: location.pathname.startsWith(item.path) ? 'bold' : 'normal' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </Box>
  )
}

export default Sidebar
