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
        <Label htmlFor="identifier">E-posta veya Kullanıcı Adı</Label>
        <div className="mt-1 relative">
          <Input
            id="identifier"
            name="identifier"
            type="text"
            placeholder="ornek@email.com"
            className="w-full pl-10 py-2 rounded-md bg-white/5 text-white placeholder-gray-400 border border-white/10 focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <Mail className="absolute w-4 h-4 top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div>
        <Label htmlFor="password">Şifre</Label>
        <div className="mt-1 relative">
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="w-full pl-10 py-2 rounded-md bg-white/5 text-white placeholder-gray-400 border border-white/10 focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <Lock className="absolute w-4 h-4 top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        disabled={isLoading}
      >
        {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </Button>
    </form>
  )
}

export default LoginForm