import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import axiosInstance from '@/contexts/axiosInstance';
import { toast } from 'react-toastify';
import {
  ShoppingCart,
  Package2,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Wallet,
  ShoppingBag,
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

enum OrderStatus {
  Pending = 0,
  Processing = 1,
  Completed = 2,
  Error = 3
}

interface Order {
  id: string;
  status: OrderStatus;
  price: number;
  createdDate: string;
  orderProducts: OrderProduct[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface OrderProduct {
  productId: string;
  product: Product;
  quantity: number;
}

interface Stats {
  recentOrders?: Order[];
  pendingOrders?: number;
  totalSpent?: number;
}

const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Pending:
      return {
        color: 'text-yellow-700 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-400/10',
        icon: <Clock className="h-4 w-4" />,
        text: 'Beklemede'
      };
    case OrderStatus.Processing:
      return {
        color: 'text-blue-700 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-400/10',
        icon: <Package2 className="h-4 w-4" />,
        text: 'İşleniyor'
      };
    case OrderStatus.Completed:
      return {
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-400/10',
        icon: <CheckCircle2 className="h-4 w-4" />,
        text: 'Tamamlandı'
      };
    case OrderStatus.Error:
      return {
        color: 'text-red-700 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-400/10',
        icon: <AlertCircle className="h-4 w-4" />,
        text: 'Hata'
      };
  }
};

const OrderCard = ({ order }: { order: Order }) => {
  const statusConfig = getStatusConfig(order.status);
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors dark:border-gray-800 dark:hover:border-gray-700 dark:bg-gray-800/50">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
          {statusConfig.icon}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            Sipariş #{order.id.slice(0, 8)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(order.createdDate).toLocaleDateString('tr-TR')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className="font-medium text-gray-900 dark:text-gray-100">
          ₺{order.price.toFixed(2)}
        </p>
        <Badge variant="secondary" className={`${statusConfig.color}`}>
          {statusConfig.text}
        </Badge>
      </div>
    </div>
  );
};

export default function HomePage() {
  const { user } = useAuth();
  const { items } = useCart();
  const [stats, setStats] = useState<Stats>({});
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordersResponse = await axiosInstance.get('/api/Order/GetCustomerOrders');
      if (ordersResponse.data.response.success) {
        const orders = ordersResponse.data.orders;
        setStats({
          recentOrders: orders,
          pendingOrders: orders.filter(o => o.status === OrderStatus.Pending).length,
          totalSpent: user?.totalSpent || 0
        });
      }

      const productsResponse = await axiosInstance.get('/api/Product/GetProducts');
      if (productsResponse.data.response.success) {
        setRecentProducts(productsResponse.data.products.slice(0, 3));
      }
    } catch (error) {
      toast.error('Veriler yüklenirken bir hata oluştu');
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Hoş Geldiniz, {user?.username}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Hesap durumunuz ve son siparişleriniz aşağıda listelenmiştir.
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/20">
              <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mevcut Bakiye</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                ₺{user?.budget?.toFixed(2) || '0.00'}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-900/20">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Harcama</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                ₺{user?.totalSpent?.toFixed(2) || '0.00'}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full dark:bg-yellow-900/20">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bekleyen Sipariş</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {stats?.pendingOrders || 0}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full dark:bg-green-900/20">
              <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Sipariş</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {stats?.recentOrders?.length || 0}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Son Siparişler */}
      <Card className="overflow-hidden bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Son Siparişler</h2>
            <Button variant="outline" size="sm" 
              className="border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => window.location.href = '/customer/orders'}>
              Tümünü Gör
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {stats?.recentOrders?.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      </Card>

      {/* Sepet Özeti */}
      {items.length > 0 && (
        <Card className="p-6 bg-white dark:bg-gray-800 border-2 border-primary/20 dark:border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 dark:bg-primary/5 rounded-full">
                <ShoppingCart className="h-6 w-6 text-primary dark:text-primary/90" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Sepetinizde {items.length} ürün var
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Siparişinizi tamamlamak için sepete gidin
                </p>
              </div>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => window.location.href = '/customer/cart'}>
              Sepete Git
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
