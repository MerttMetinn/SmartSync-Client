import { Card } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Crown, 
  ShoppingBag, 
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react'

const HomePage = () => {
  const { user } = useAuth()

  const stats = [
    {
      title: 'Toplam Sipariş',
      value: '12',
      icon: ShoppingBag,
      change: '+4 yeni',
      color: 'from-blue-600 to-blue-400',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Aktif Siparişler',
      value: '3',
      icon: Clock,
      change: '2 beklemede',
      color: 'from-purple-600 to-purple-400',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500'
    },
    {
      title: 'Tamamlanan',
      value: '9',
      icon: CheckCircle2,
      change: '%95 başarı',
      color: 'from-green-600 to-green-400',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500'
    },
    {
      title: 'Bakiye',
      value: '₺1,250.00',
      icon: Wallet,
      change: '+₺250 bonus',
      color: 'from-amber-600 to-amber-400',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500'
    }
  ]

  const recentOrders = [
    { id: '1001', date: '2024-02-20', status: 'Tamamlandı', amount: 450, products: ['Ürün A', 'Ürün B'] },
    { id: '1002', date: '2024-02-19', status: 'İşleniyor', amount: 850, products: ['Ürün C'] },
    { id: '1003', date: '2024-02-18', status: 'Hazırlanıyor', amount: 1200, products: ['Ürün D', 'Ürün E'] }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Tamamlandı':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      case 'İşleniyor':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
      default:
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
    }
  }

  return (
    <div className="space-y-8">
      {/* Hoş Geldin Mesajı */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-8 shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white">
            Hoş Geldin, {user?.username}!
          </h1>
          <p className="mt-2 text-blue-100">
            {user?.customerType === 'Premium' ? 'Premium üyelik ayrıcalıklarından yararlanabilirsin.' : 'Alışverişe başlayabilirsin.'}
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3">
          <div className="h-full w-full bg-gradient-to-l from-white/10 to-transparent" />
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="p-6">
              <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-4 ${stat.iconBg}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </h3>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.change}
                </div>
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
          </Card>
        ))}
      </div>

      {/* Son Siparişler ve Premium Durum */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Son Siparişler */}
        <Card className="overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Son Siparişler</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="space-y-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Sipariş #{order.id}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.products.join(', ')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{order.date}</p>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">
                    ₺{order.amount.toFixed(2)}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Premium Durum */}
        <Card className="p-6">
          <div className="text-center space-y-6">
            {user?.customerType === 'Premium' ? (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-amber-600 p-1">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Premium Üyelik Aktif
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      Tüm premium ayrıcalıklardan yararlanabilirsiniz.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                        Öncelikli Sipariş İşleme
                      </li>
                      <li className="flex items-center text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                        Özel İndirimler
                      </li>
                      <li className="flex items-center text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                        7/24 Öncelikli Destek
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 p-1">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Premium Üye Olun
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    2000 TL üzeri alışveriş yaparak Premium üye olabilirsiniz.
                  </p>
                  <div className="pt-4">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>Premium üyeliğe çok yakınsınız!</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default HomePage