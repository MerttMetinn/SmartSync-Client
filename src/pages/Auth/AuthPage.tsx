import React, { useState } from 'react'
import LoginForm from './Forms/LoginForm'
import RegisterForm from './Forms/RegisterForm'
import { motion, AnimatePresence } from 'framer-motion'
import { User2, Shield } from 'lucide-react'

type UserType = 'admin' | 'customer'
type FormType = 'login' | 'register'

const AuthPage = () => {
  const [formType, setFormType] = useState<FormType>('login')
  const [userType, setUserType] = useState<UserType>('customer')

  return (
    <div className="space-y-4">
      {/* Üst Seçim Kartı */}
      <div className="bg-white/5 rounded-xl p-1">
        <div className="flex divide-x divide-white/10">
          <button
            onClick={() => setUserType('customer')}
            className={`flex-1 px-4 py-3 rounded-lg transition-all ${
              userType === 'customer'
                ? 'bg-purple-500/10 text-purple-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex flex-col items-center gap-1.5">
              <User2 className="w-5 h-5" />
              <span className="text-xs font-medium">Müşteri</span>
            </div>
          </button>

          <button
            onClick={() => setUserType('admin')}
            className={`flex-1 px-4 py-3 rounded-lg transition-all ${
              userType === 'admin'
                ? 'bg-blue-500/10 text-blue-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex flex-col items-center gap-1.5">
              <Shield className="w-5 h-5" />
              <span className="text-xs font-medium">Admin</span>
            </div>
          </button>
        </div>
      </div>

      {/* Form Kartı */}
      <div className="bg-white/5 rounded-xl">
        {/* Form Tipi Seçimi */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setFormType('login')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${
              formType === 'login'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Giriş Yap
            {formType === 'login' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setFormType('register')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${
              formType === 'register'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Kayıt Ol
            {formType === 'register' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
            )}
          </button>
        </div>

        {/* Form İçeriği */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={formType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {formType === 'login' ? (
                <LoginForm userType={userType} />
              ) : (
                <RegisterForm userType={userType} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AuthPage