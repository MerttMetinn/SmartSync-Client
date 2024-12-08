import React, { useState } from 'react'
import LoginForm from './Forms/LoginForm'
import RegisterForm from './Forms/RegisterForm'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Building2, User2 } from 'lucide-react'

type UserType = 'company' | 'customer'
type FormType = 'login' | 'register'

const AuthPage = () => {
  const [formType, setFormType] = useState<FormType>('login')
  const [userType, setUserType] = useState<UserType>('company')

  return (
    <div className="relative">
      <div className="absolute -top-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20" />
      
      <div className="mb-6 flex gap-2 p-1 bg-white/5 rounded-lg">
        <button
          onClick={() => setUserType('company')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            userType === 'company'
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-blue-100/60 hover:text-blue-100'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Şirket
        </button>
        <button
          onClick={() => setUserType('customer')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            userType === 'customer'
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-blue-100/60 hover:text-blue-100'
          }`}
        >
          <User2 className="h-4 w-4" />
          Müşteri
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${formType}-${userType}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">
              {formType === 'login' ? 'Tekrar Hoş Geldiniz' : 'Hesap Oluşturun'}
            </h2>
            <p className="text-blue-100/60 text-sm">
              {formType === 'login' 
                ? `${userType === 'company' ? 'Şirket panelinize' : 'Hesabınıza'} erişim için giriş yapın`
                : `${userType === 'company' ? 'SmartSync iş ortağı olun' : 'SmartSync ailesine katılın'}`}
            </p>
          </div>

          {formType === 'login' ? (
            <LoginForm userType={userType} />
          ) : (
            <RegisterForm userType={userType} />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 text-center">
        <Button
          variant="ghost"
          onClick={() => setFormType(formType === 'login' ? 'register' : 'login')}
          className="text-blue-100/80 hover:text-blue-100 hover:bg-white/10"
        >
          {formType === 'login'
            ? `${userType === 'company' ? 'Şirketinizi' : 'Hesabınızı'} oluşturun`
            : 'Zaten hesabınız var mı? Giriş yapın'}
        </Button>
      </div>
    </div>
  )
}

export default AuthPage