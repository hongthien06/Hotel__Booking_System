import { Route, Routes, Navigate } from 'react-router-dom'
import Payments from '~/features/payments/_id'
import LoginPage from '~/features/auth/LoginPage'
import RegisterPage from '~/features/auth/RegisterPage'
import ForgotPasswordPage from '~/features/auth/ForgotPasswordPage'
import ResetPasswordPage from '~/features/auth/ResetPasswordPage'
import PrivateRoute from './PrivateRoute'
import MainLayout from '../shared/components/layout/MainLayout'
import DashboardPage from '~/features/dashboard/DashboardPage'
import ProfilePage from '~/features/auth/ProfilePage'
import UserManagementPage from '~/features/admin/UserManagementPage'
import HomePage from '~/features/home/HomePage'
import BookingPage from '~/features/bookings/BookingPage'
import RoomList from '~/features/rooms/List/RoomList'
import BookingHistoryPage from '~/features/bookings/Pages/BookingHistoryPage'
import MembershipPage from '~/features/membership/MembershipPage'
import ReviewsPage from '~/features/reviews/ReviewsPage'
import ReviewManagementPage from '~/features/admin-dashboard/ReviewManagementPage'

import { useAuth } from '~/shared/hooks/useAuth'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

const AppRoutes = () => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    )
  }

  const isAdminOrManager = isAuthenticated && user?.roles?.some(r => {
    const roleStr = typeof r === 'string' ? r : (r?.roleName || r?.authority || '')
    const cleanRole = roleStr.replace('ROLE_', '')
    return cleanRole === 'ADMIN' || cleanRole === 'MANAGER'
  })

  return (
    <Routes>
      {/* Điều hướng mặc định */}
      <Route path="/" element={<Navigate to={isAdminOrManager ? "/dashboard" : "/home"} replace />} />

      {/* Các trang công khai - không có Header */}
      <Route path='/login' element={
        isAuthenticated ? <Navigate to={isAdminOrManager ? "/dashboard" : "/home"} replace /> : <LoginPage />
      } />
      <Route path='/register' element={
        isAuthenticated ? <Navigate to={isAdminOrManager ? "/dashboard" : "/home"} replace /> : <RegisterPage />
      } />
      <Route path='/forgot-password' element={
        isAuthenticated ? <Navigate to={isAdminOrManager ? "/dashboard" : "/home"} replace /> : <ForgotPasswordPage />
      } />
      <Route path='/reset-password' element={
        isAuthenticated ? <Navigate to={isAdminOrManager ? "/dashboard" : "/home"} replace /> : <ResetPasswordPage />
      } />

      {/* Các trang sử dụng MainLayout (Có Header + Navbar) */}
      <Route element={<MainLayout />}>
        {/* Các trang công khai */}
        <Route path='/home' element={
          isAdminOrManager ? <Navigate to="/dashboard" replace /> : <HomePage />
        } />
        <Route path='/bookings' element={
          isAdminOrManager ? <Navigate to="/dashboard" replace /> : <BookingPage />
        } />
        <Route path='/rooms' element={<RoomList />} />
        <Route path='/reviews' element={
          isAdminOrManager ? <Navigate to="/dashboard" replace /> : <ReviewsPage />
        } />
        
        {/* Các trang yêu cầu đăng nhập (Customer / Admin / Manager) */}
        <Route element={<PrivateRoute />}>
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/booking-history' element={
            isAdminOrManager ? <Navigate to="/dashboard" replace /> : <BookingHistoryPage />
          } />
          <Route path='/membership' element={
            isAdminOrManager ? <Navigate to="/dashboard" replace /> : <MembershipPage />
          } />
          <Route path='/payment' element={
            isAdminOrManager ? <Navigate to="/dashboard" replace /> : <Payments />
          } />
        </Route>

        {/* Các trang dành cho Admin và Manager */}
        <Route element={<PrivateRoute requiredRoles={['ADMIN', 'MANAGER']} />}>
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/admin/reviews' element={<ReviewManagementPage />} />
        </Route>

        {/* Trang chỉ dành riêng cho Manager */}
        <Route element={<PrivateRoute requiredRoles={['MANAGER']} />}>
          <Route path='/admin/users' element={<UserManagementPage />} />
        </Route>
      </Route>

      {/* Bẫy các route không tồn tại về "/" */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes