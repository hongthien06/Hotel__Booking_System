import { Route, Routes } from 'react-router-dom'
import Payments from '~/features/payments/_id'
import LoginPage from '~/features/auth/LoginPage'
import RegisterPage from '~/features/auth/RegisterPage'
import ForgotPasswordPage from '~/features/auth/ForgotPasswordPage'
import ResetPasswordPage from '~/features/auth/ResetPasswordPage'
import PrivateRoute from './PrivateRoute'
import MainLayout from '../shared/components/layout/MainLayout'
import DashboardPage from '~/features/dashboard/DashboardPage'
import ProfilePage from '~/features/auth/ProfilePage'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public route không có Header/Sidebar (Full màn hình) */}
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />
      
      {/* Các route nằm trong Layout chung */}
      <Route element={<MainLayout />}>
        {/* Route public nhưng vẫn có Header (nhưng Sidebar ẩn vì chưa đăng nhập) */}
        <Route path='/payment' element={<Payments />} />
        
        {/* Example protected blocks (cần đăng nhập, sẽ hiện sidebar) */}
        <Route element={<PrivateRoute />}>
           <Route path="/dashboard" element={<DashboardPage />} />
           <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default AppRoutes