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

const AppRoutes = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Routes>
      {/* Điều hướng mặc định về "/home" */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Các trang công khai - không có Header */}
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />

      {/* Các trang sử dụng MainLayout (Có Header + Navbar) */}
      <Route element={<MainLayout />}>
        {/* Các trang công khai */}
        <Route path='/home' element={<HomePage />} />
        <Route path='/bookings' element={<BookingPage />} />
        <Route path='/rooms' element={<RoomList />} />
        
        {/* Các trang yêu cầu đăng nhập (Customer / Admin / Manager) */}
        <Route element={<PrivateRoute />}>
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/booking-history' element={<BookingHistoryPage />} />
          <Route path='/payment' element={<Payments />} />
        </Route>

        {/* Các trang dành cho Admin và Manager */}
        <Route element={<PrivateRoute requiredRoles={['ADMIN', 'MANAGER']} />}>
          <Route path='/dashboard' element={<DashboardPage />} />
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