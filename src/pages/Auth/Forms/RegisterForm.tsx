import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

interface RegisterFormProps {
  userType: 'admin' | 'customer'
}

const RegisterForm = ({ userType }: RegisterFormProps) => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const username = (e.currentTarget.elements.namedItem('username') as HTMLInputElement).value
    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value

    if (!username || !email || !password) {
      toast.error('Lütfen tüm alanları doldurun!')
      setIsLoading(false)
      return
    }

    try {
      await register({
        username,
        email,
        password,
        userType
      })
      formRef.current?.reset()
      
      toast.success('Kayıt işlemi başarılı! Giriş yapabilirsiniz.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClose: () => {
          navigate('/auth')
        }
      })
    } catch (error) {
      toast.error('Kayıt başarısız! Lütfen bilgilerinizi kontrol edin.', {
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
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="username">Kullanıcı Adı</Label>
        <div className="mt-1 relative">
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Kullanıcı adı belirleyin"
            className="w-full pl-10 py-2 rounded-md bg-white/5 text-white placeholder-gray-400 border border-white/10 focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <User className="absolute w-4 h-4 top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div>
        <Label htmlFor="email">E-posta</Label>
        <div className="mt-1 relative">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="E-posta adresiniz"
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
        {isLoading ? 'Kayıt yapılıyor...' : 'Hesap Oluştur'}
      </Button>
    </form>
  )
}

export default RegisterForm