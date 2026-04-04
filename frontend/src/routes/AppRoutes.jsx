import { Route, Routes } from 'react-router-dom'
import Payments from '~/features/payments/_id'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/payment' element={<Payments />} />
    </Routes>
  )
}

export default AppRoutes