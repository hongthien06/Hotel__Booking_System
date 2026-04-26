import React, { useState, useEffect } from 'react'
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Button, 
  CircularProgress, Alert, Avatar, Tooltip, IconButton 
} from '@mui/material'
import { AdminPanelSettings, Person, VerifiedUser, Security } from '@mui/icons-material'
import { getAllUsersApi, updateUserRolesApi } from '../../shared/api/adminUserApi'
import { useAuth } from '../../shared/hooks/useAuth'

const UserManagementPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const { user: currentUser } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await getAllUsersApi()
      console.log('User data received:', data)
      
      if (Array.isArray(data)) {
        setUsers(data)
      } else if (data && typeof data === 'object' && Array.isArray(data.users)) {
        setUsers(data.users)
      } else if (data && typeof data === 'object' && Array.isArray(data.content)) {
        setUsers(data.content)
      } else {
        setUsers([])
        console.error('Dữ liệu trả về không phải là mảng:', data)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Không thể tải danh sách người dùng.')
    } finally {
      setLoading(false)
    }
  }

  const handleGrantAdmin = async (userId, currentRoles) => {
    setActionLoading(userId)
    try {
      const newRoles = new Set(currentRoles)
      if (newRoles.has('ADMIN') || newRoles.has('ROLE_ADMIN')) {
        // Remove admin (optional, for toggle)
        newRoles.delete('ADMIN')
        newRoles.delete('ROLE_ADMIN')
      } else {
        newRoles.add('ADMIN')
      }
      
      const updatedUser = await updateUserRolesApi(userId, Array.from(newRoles))
      setUsers(users.map(u => u.userId === userId ? updatedUser : u))
    } catch (err) {
      setError('Lỗi khi cập nhật quyền hạn.')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 2 }}>
        <Security fontSize="large" /> Quản lý người dùng
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Người dùng</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Vai trò</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(users) && users.map((u) => {
              const isAdmin = u.roles?.some(r => r === 'ADMIN' || r === 'ROLE_ADMIN')
              const isSelf = u.email === currentUser?.email

              return (
                <TableRow key={u.userId} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: isAdmin ? 'secondary.main' : 'primary.main' }}>
                        {u.fullName?.charAt(0) || '?'}
                      </Avatar>
                      <Typography sx={{ fontWeight: 600 }}>{u.fullName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {u.roles?.map(role => (
                        <Chip 
                          key={role} 
                          label={role.replace('ROLE_', '')} 
                          size="small" 
                          color={role.includes('ADMIN') ? 'secondary' : role.includes('MANAGER') ? 'info' : 'default'}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Button
                      variant={isAdmin ? "outlined" : "contained"}
                      color="secondary"
                      size="small"
                      disabled={actionLoading === u.userId || isSelf}
                      startIcon={actionLoading === u.userId ? <CircularProgress size={16} /> : <AdminPanelSettings />}
                      onClick={() => handleGrantAdmin(u.userId, u.roles || [])}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                      {isAdmin ? 'Gỡ quyền Admin' : 'Cấp quyền Admin'}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default UserManagementPage
