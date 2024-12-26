import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
      
      <div className="w-full max-w-md relative z-10 px-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl">
          <div className="text-center pt-6 pb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
              SmartSync
            </h1>
            <p className="text-sm text-blue-100/60">
              Eş Zamanlı Sipariş ve Stok Yönetimi Sistemi
            </p>
          </div>
          
          <div className="px-6 pb-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}