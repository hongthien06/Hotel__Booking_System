import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../shared/hooks/useAuth'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

const PrivateRoute = ({ requiredRoles }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    )
  }

  // Not logged in -> Redirect to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If a specific role is required, check roles
  if (requiredRoles && user && user.roles) {
    const rolesToMatch = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    
    // Normalize user roles
    const userRoleStrings = user.roles.map(r => {
      if (typeof r === 'string') return r
      return r.roleName || r.authority || ''
    }).filter(Boolean)

    const hasPermission = rolesToMatch.some(reqRole => {
      const normReq = reqRole.startsWith('ROLE_') ? reqRole : `ROLE_${reqRole}`
      return userRoleStrings.some(uRole => {
        const normUser = uRole.startsWith('ROLE_') ? uRole : `ROLE_${uRole}`
        return normReq === normUser
      })
    })

    if (!hasPermission) {
      return <Navigate to="/home" replace />
    }
  }

  return <Outlet />
}

export default PrivateRoute
