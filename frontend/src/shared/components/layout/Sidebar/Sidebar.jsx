import React from 'react'
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../../shared/hooks/useAuth'

// Icon placeholders (Mock MUI icons text for now)
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', roles: ['ROLE_ADMIN'] },
  { id: 'profile', label: 'Trang cá nhân', path: '/profile', roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CUSTOMER'] },
  { id: 'rooms', label: 'Quản lý Phòng', path: '/rooms', roles: ['ROLE_ADMIN', 'ROLE_MANAGER'] },
  { id: 'bookings', label: 'Đặt phòng', path: '/bookings', roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CUSTOMER'] },
  { id: 'customers', label: 'Khách hàng', path: '/customers', roles: ['ROLE_ADMIN'] }
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
    const userRoleStrings = user.roles ? user.roles.map(r => r.roleName || r.authority) : []
    if (user.role) userRoleStrings.push(user.role) // Handle single role format if any

    return itemRoles.some(role => 
      userRoleStrings.includes(role) || userRoleStrings.includes(role.replace('ROLE_', ''))
    )
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
                {/* Generic Icon placeholder */}
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                  {item.label.charAt(0)}
                </Box>
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
