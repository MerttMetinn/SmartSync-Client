import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="w-full max-w-lg mx-auto p-4 relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
              SmartSync
            </h1>
            <p className="text-blue-100/60 mt-1 text-sm">
              Eş Zamanlı Sipariş ve Stok Yönetimi Sistemi
            </p>
          </div>
          <div className="max-w-sm mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}