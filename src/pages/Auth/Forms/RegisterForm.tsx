import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Lock } from 'lucide-react'
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
        <Label htmlFor="username" className="text-blue-200/80">Kullanıcı Adı</Label>
        <div className="mt-1.5 relative">
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Kullanıcı adı belirleyin"
            className="w-full pl-10 py-2.5 rounded-xl bg-white/10 text-blue-50 placeholder-blue-200/30 border border-white/20 focus:border-blue-300/30 focus:ring-1 focus:ring-blue-300/30"
            required
          />
          <User className="absolute w-4 h-4 top-1/2 left-3 transform -translate-y-1/2 text-blue-300/50" />

        </div>
      </div>

      <div>
      <Label htmlFor="email" className="text-blue-200/80">E-posta</Label>
        <div className="mt-1.5 relative">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="E-posta adresiniz"
            className="w-full pl-10 py-2.5 rounded-xl bg-white/10 text-blue-50 placeholder-blue-200/30 border border-white/20 focus:border-blue-300/30 focus:ring-1 focus:ring-blue-300/30"
            required
          />
          <Mail className="absolute w-4 h-4 top-1/2 left-3 transform -translate-y-1/2 text-blue-300/50" />

        </div>
      </div>

      <div>
      <Label htmlFor="password" className="text-blue-200/80">Şifre</Label>        <div className="mt-1.5 relative">
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
        {isLoading ? 'Kayıt yapılıyor...' : 'Hesap Oluştur'}
      </Button>
    </form>
  )
}

export default RegisterForm
