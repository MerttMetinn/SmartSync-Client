import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-toastify'

interface LoginFormProps {
  userType: 'company' | 'customer'
}

const LoginForm = ({ userType }: LoginFormProps) => {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await login(email, password, userType)
      toast.success('Giriş başarılı, yönlendiriliyorsunuz.')
    } catch (error) {
      toast.error('Geçersiz kullanıcı bilgileri.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-blue-100 text-sm">E-posta</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/50" />
          <Input
            name="email"
            type="email"
            placeholder={userType === 'company' ? "sirket@ornek.com" : "kullanici@ornek.com"}
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
          "Giriş yapılıyor..."
        ) : (
          <>
            {userType === 'company' ? 'Şirket Girişi' : 'Giriş Yap'}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </form>
  )
}

export default LoginForm