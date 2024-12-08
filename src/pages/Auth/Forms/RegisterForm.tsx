import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Lock, Building2, ArrowRight, Phone } from 'lucide-react'

interface RegisterFormProps {
  userType: 'company' | 'customer'
}

const RegisterForm = ({ userType }: RegisterFormProps) => {
  return (
    <form className="space-y-4">
      {userType === 'company' ? (
        // Şirket Kayıt Formu
        <>
          <div className="space-y-2">
            <Label className="text-blue-100 text-sm">Şirket Adı</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/50" />
              <Input
                type="text"
                placeholder="Şirket Adı"
                className="pl-9 h-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-blue-100 text-sm">Yetkili Adı</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/50" />
                <Input
                  type="text"
                  placeholder="Ad"
                  className="pl-9 h-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-blue-100 text-sm">Yetkili Soyadı</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/50" />
                <Input
                  type="text"
                  placeholder="Soyad"
                  className="pl-9 h-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        // Müşteri Kayıt Formu
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-blue-100 text-sm">Ad</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/50" />
              <Input
                type="text"
                placeholder="Adınız"
                className="pl-9 h-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-blue-100 text-sm">Soyad</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/50" />
              <Input
                type="text"
                placeholder="Soyadınız"
                className="pl-9 h-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-blue-100 text-sm">Telefon</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/50" />
          <Input
            type="tel"
            placeholder="05XX XXX XX XX"
            className="pl-9 h-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-blue-100 text-sm">E-posta</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/50" />
          <Input
            type="email"
            placeholder={userType === 'company' ? "sirket@ornek.com" : "kullanici@ornek.com"}
            className="pl-9 h-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-blue-100 text-sm">Şifre</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/50" />
          <Input
            type="password"
            placeholder="••••••••"
            className="pl-9 h-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-10 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium group mt-2"
      >
        {userType === 'company' ? 'Şirket Kaydı Oluştur' : 'Hesap Oluştur'}
        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </form>
  )
}

export default RegisterForm