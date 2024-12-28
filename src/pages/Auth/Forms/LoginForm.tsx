import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-toastify'

interface LoginFormProps {
  userType: 'admin' | 'customer'
}

const LoginForm = ({ userType }: LoginFormProps) => {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const usernameOrEmail = formData.get('identifier') as string
    const password = formData.get('password') as string

    try {
      await login(usernameOrEmail, password, userType)
      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } catch {
      toast.error('Giriş başarısız! Lütfen bilgilerinizi kontrol edin.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="identifier" className="text-blue-200/80">E-posta veya Kullanıcı Adı</Label>
        <div className="mt-1.5 relative">
          <Input
            id="identifier"
            name="identifier"
            type="text"
            placeholder="ornek@email.com"
            className="w-full pl-10 py-2.5 rounded-xl bg-white/10 text-blue-50 placeholder-blue-200/30 border border-white/20 focus:border-blue-300/30 focus:ring-1 focus:ring-blue-300/30"
            required
          />
          <Mail className="absolute w-4 h-4 top-1/2 left-3 transform -translate-y-1/2 text-blue-300/50" />
        </div>
      </div>

      <div>
        <Label htmlFor="password" className="text-blue-200/80">Şifre</Label>
        <div className="mt-1.5 relative">
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="w-full pl-10 py-2.5 rounded-xl bg-white/10 text-blue-50 placeholder-blue-200/30 border border-white/20 focus:border-blue-300/30 focus:ring-1 focus:ring-blue-300/30"
            required
          />
          <Lock className="absolute w-4 h-4 top-1/2 left-3 transform -translate-y-1/2 text-blue-300/50" />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-xl py-2.5 px-4 hover:from-blue-500 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-[#1a2341] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        disabled={isLoading}
      >
        {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </Button>
    </form>
  )
}
export default LoginForm
