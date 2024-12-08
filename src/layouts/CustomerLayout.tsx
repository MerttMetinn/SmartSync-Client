import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/shared/Customer/Sidebar'
import Footer from '@/components/shared/Customer/Footer'

export default function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Sidebar />
      <main className="flex-grow container mx-auto px-4 py-8 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}