import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Crown, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const ProfilePage = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Bilgileri</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 md:col-span-2 bg-white dark:bg-gray-800">
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Ad Soyad</Label>
                <Input 
                  placeholder="Ad Soyad" 
                  value={user?.name} 
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">E-posta</Label>
                <Input 
                  type="email" 
                  placeholder="ornek@email.com" 
                  value={user?.email}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Telefon</Label>
                <Input 
                  type="tel" 
                  placeholder="+90 555 555 55 55"
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Şifre</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>
            <Button className="w-full">Bilgileri Güncelle</Button>
          </form>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-800">
          <div className="text-center space-y-4">
            {user?.isPremium ? (
              <>
                <Crown className="h-16 w-16 mx-auto text-yellow-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Premium Üye</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Premium üyelik avantajlarından yararlanabilirsiniz.
                  </p>
                </div>
              </>
            ) : (
              <>
                <User className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Standart Üye</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    2000 TL üzeri alışveriş yaparak Premium üye olabilirsiniz.
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage 