import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/Customer/HomePage'
import OrdersPage from '../pages/Customer/OrdersPage'
import { ProductsPage } from '../pages/Customer/ProductsPage'
import CartPage from '../pages/Customer/CartPage'

const CustomerRoutes = () => (
  <Routes>
    <Route path="home" element={<HomePage />} />
    <Route path="orders" element={<OrdersPage />} />
    <Route path="products" element={<ProductsPage />} />
    <Route path="cart" element={<CartPage />} />
  </Routes>
)

export default CustomerRoutes