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
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-1.5">
        <div className="flex gap-2">
          <button
            onClick={() => setUserType('customer')}
            className={`flex-1 px-4 py-3 rounded-xl transition-colors duration-200 ${
              userType === 'customer'
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-purple-500/30'
                : 'border border-transparent hover:border-white/10'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`p-2 rounded-lg transition-colors duration-200 ${
                userType === 'customer' 
                  ? 'text-purple-300' 
                  : 'text-gray-400'
              }`}>
                <User2 className="w-5 h-5" />
              </div>
              <span className={`text-sm font-medium transition-colors duration-200 ${
                userType === 'customer'
                  ? 'text-purple-300'
                  : 'text-gray-400'
              }`}>
                Müşteri
              </span>
            </div>
          </button>

          <button
            onClick={() => setUserType('admin')}
            className={`flex-1 px-4 py-3 rounded-xl transition-colors duration-200 ${
              userType === 'admin'
                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30'
                : 'border border-transparent hover:border-white/10'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`p-2 rounded-lg transition-colors duration-200 ${
                userType === 'admin' 
                  ? 'text-blue-300' 
                  : 'text-gray-400'
              }`}>
                <Shield className="w-5 h-5" />
              </div>
              <span className={`text-sm font-medium transition-colors duration-200 ${
                userType === 'admin'
                  ? 'text-blue-300'
                  : 'text-gray-400'
              }`}>
                Admin
              </span>
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
                ? 'text-indigo-300'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Giriş Yap
            {formType === 'login' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/50 to-purple-500/50" />
            )}
          </button>
          <button
            onClick={() => setFormType('register')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${
              formType === 'register'
                ? 'text-indigo-300'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Kayıt Ol
            {formType === 'register' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/50 to-purple-500/50" />
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
