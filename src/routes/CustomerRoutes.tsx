import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/Customer/HomePage'

const UserRoutes = () => (
  <Routes>
    <Route path="home" element={<HomePage />} />
  </Routes>
)

export default UserRoutes