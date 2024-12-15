import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

interface RegisterFormProps {
  userType: 'company' | 'customer'
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
      await register(username, email, password, userType)
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
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-blue-100 text-sm">Kullanıcı Adı</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/50" />
          <Input
            name="username"
            type="text"
            placeholder="Kullanıcı adı belirleyin"
            className="pl-9 h-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-blue-100 text-sm">E-posta</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/50" />
          <Input
            name="email"
            type="email"
            placeholder="E-posta adresiniz"
            className="pl-9 h-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-blue-100 text-sm">Şifre</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/50" />
          <Input
            name="password"
            type="password"
            placeholder="••••••••"
            className="pl-9 h-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20"
            required
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-10 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium group mt-2"
        disabled={isLoading}
      >
        {isLoading ? (
          "Kayıt yapılıyor..."
        ) : (
          <>
            {userType === 'company' ? 'Şirket Kaydı Oluştur' : 'Hesap Oluştur'}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </form>
  )
}

export default RegisterForm